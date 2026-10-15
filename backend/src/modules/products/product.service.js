import mongoose from 'mongoose';
import { Product } from './product.model.js';
import { Category } from '../categories/category.model.js';
import { Sale } from '../pricing/sale.model.js';
import { resolvePrice } from '../pricing/pricing.service.js';
import { getOrLoad } from '../../core/cache/index.js';
import { TTL } from '../../core/cache/config.js';
import { ApiError } from '../../core/apiError.js';

/**
 * Lists active products with filtering, sorting, pagination, and pricing resolution
 */
export async function listProducts(query = {}) {
  const {
    q,
    category,
    audience,
    isFeatured,
    isNewArrival,
    minPrice,
    maxPrice,
    fabric,
    occasion,
    season,
    sort = 'newest',
    page = 1,
    limit = 20,
    isSale,
    sale,
  } = query;

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  // Build Filter - allow both active and published
  const filter = { status: { $in: ['active', 'published'] } };

  if (audience && audience !== 'all') {
    filter.audience = audience;
  }

  if (category) {
    if (mongoose.isValidObjectId(category)) {
      filter.category = category;
    } else {
      const catDoc = await Category.findOne({ slug: category.toLowerCase().trim() }).select('_id').lean();
      if (catDoc) {
        filter.category = catDoc._id;
      } else {
        filter.category = new mongoose.Types.ObjectId();
      }
    }
  }

  if (fabric) {
    filter.fabric = new RegExp(fabric, 'i');
  }

  if (season) {
    filter.season = new RegExp(`^${season}$`, 'i');
  }

  if (occasion) {
    filter.occasion = { $in: [new RegExp(occasion, 'i')] };
  }

  if (isFeatured !== undefined) {
    filter.isFeatured = isFeatured === 'true' || isFeatured === true;
  }

  if (isNewArrival !== undefined) {
    filter.isNewArrival = isNewArrival === 'true' || isNewArrival === true;
  }

  if (query.isBestSeller !== undefined) {
    filter.isBestSeller = query.isBestSeller === 'true' || query.isBestSeller === true;
  }

  const isSaleRequested = isSale === 'true' || isSale === true || sale === 'true' || sale === true;

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined && minPrice !== '') filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined && maxPrice !== '') filter.price.$lte = Number(maxPrice);
  }

  if (q && typeof q === 'string' && q.trim()) {
    filter.$or = [
      { name: new RegExp(q.trim(), 'i') },
      { tags: new RegExp(q.trim(), 'i') },
      { searchKeywords: new RegExp(q.trim(), 'i') },
      { fabric: new RegExp(q.trim(), 'i') },
    ];
  }

  // Build Sort
  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  else if (sort === 'price_desc') sortOption = { price: -1 };
  else if (sort === 'popular') sortOption = { soldCount: -1 };
  else if (sort === 'rating') sortOption = { 'ratings.average': -1 };

  const cacheKey = `products:list:${JSON.stringify({ filter, sortOption, parsedPage, parsedLimit, isSaleRequested })}`;

  return getOrLoad(
    cacheKey,
    async () => {
      if (mongoose.connection.readyState !== 1) {
        throw ApiError.serviceUnavailable('Database connection is temporarily unavailable');
      }

      const now = new Date();
      // Fetch active campaign sales
      const activeSales = await Sale.find({
        isEnabled: true,
        startsAt: { $lte: now },
        endsAt: { $gte: now },
      }).lean();

      if (isSaleRequested) {
        // Collect matching campaign IDs/categories/audiences/products
        const matchingProductIds = [];
        const matchingCategoryIds = [];
        const matchingAudiences = [];
        let hasAllScopeCampaign = false;

        for (const camp of activeSales) {
          if (camp.scope === 'all') {
            hasAllScopeCampaign = true;
          } else if (camp.scope === 'products' && Array.isArray(camp.targetProductIds)) {
            matchingProductIds.push(...camp.targetProductIds);
          } else if (camp.scope === 'categories' && Array.isArray(camp.targetCategoryIds)) {
            matchingCategoryIds.push(...camp.targetCategoryIds);
          } else if (camp.scope === 'audiences' && Array.isArray(camp.targetAudiences)) {
            matchingAudiences.push(...camp.targetAudiences);
          }
        }

        const saleOrConditions = [
          // 1. Direct product sale enabled
          {
            'sale.isEnabled': true,
            $and: [
              {
                $or: [
                  { 'sale.startsAt': null },
                  { 'sale.startsAt': { $exists: false } },
                  { 'sale.startsAt': { $lte: now } },
                ],
              },
              {
                $or: [
                  { 'sale.endsAt': null },
                  { 'sale.endsAt': { $exists: false } },
                  { 'sale.endsAt': { $gte: now } },
                ],
              },
            ],
            $or: [
              { 'sale.salePrice': { $gt: 0 } },
              { 'sale.value': { $gt: 0 } },
            ],
          },
        ];

        if (hasAllScopeCampaign) {
          // If a storewide campaign is active, any product qualifies unless explicitly excluded
          // Handled during resolvePrice
        } else {
          if (matchingProductIds.length > 0) {
            saleOrConditions.push({ _id: { $in: matchingProductIds } });
          }
          if (matchingCategoryIds.length > 0) {
            saleOrConditions.push({ category: { $in: matchingCategoryIds } });
          }
          if (matchingAudiences.length > 0) {
            saleOrConditions.push({ audience: { $in: matchingAudiences } });
          }
        }

        if (!hasAllScopeCampaign) {
          filter.$or = filter.$or ? [{ $and: [{ $or: filter.$or }, { $or: saleOrConditions }] }] : saleOrConditions;
        }
      }

      const [items, total] = await Promise.all([
        Product.find(filter)
          .sort(sortOption)
          .skip(skip)
          .limit(parsedLimit)
          .populate('category', 'name slug audience')
          .lean(),
        Product.countDocuments(filter),
      ]);

      const decoratedItems = items.map((prod) => {
        const pricing = resolvePrice(prod, null, now, activeSales);
        return {
          ...prod,
          pricing,
        };
      });

      // If isSale was requested, verify products have valid savings
      const finalItems = isSaleRequested
        ? decoratedItems.filter((p) => (p.pricing?.savings || 0) > 0)
        : decoratedItems;

      return {
        items: finalItems,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total: isSaleRequested ? finalItems.length : total,
          totalPages: isSaleRequested
            ? Math.ceil(finalItems.length / parsedLimit) || 1
            : Math.ceil(total / parsedLimit) || 1,
        },
      };
    },
    {
      ttl: TTL.PRODUCT,
      tags: ['products'],
    }
  );
}

/**
 * Retrieves a single active product by slug with pricing and related recommendations
 */
export async function getProductBySlug(slug) {
  if (!slug) {
    throw ApiError.badRequest('Product slug is required');
  }

  const cacheKey = `product:slug:${slug}`;

  return getOrLoad(
    cacheKey,
    async () => {
      if (mongoose.connection.readyState !== 1) {
        throw ApiError.serviceUnavailable('Database connection is temporarily unavailable');
      }

      const queryFilter = mongoose.isValidObjectId(slug)
        ? { $or: [{ _id: slug }, { slug }], status: { $in: ['active', 'published'] } }
        : { slug, status: { $in: ['active', 'published'] } };

      const product = await Product.findOne(queryFilter)
        .populate('category', 'name slug audience')
        .populate('subCategory', 'name slug')
        .populate('bundleWith', 'name slug price images variants')
        .lean();

      if (!product) {
        throw ApiError.notFound(`Product not found: ${slug}`);
      }

      const now = new Date();
      const activeSales = await Sale.find({
        isEnabled: true,
        startsAt: { $lte: now },
        endsAt: { $gte: now },
      }).lean();

      const pricing = resolvePrice(product, null, now, activeSales);

      // Variant prices
      const variantsWithPricing = (product.variants || []).map((v) => ({
        ...v,
        pricing: resolvePrice(product, v, now, activeSales),
      }));

      // Related products from same category
      const catId = product.category?._id || (mongoose.isValidObjectId(product.category) ? product.category : null);
      const related = catId
        ? await Product.find({
            category: catId,
            _id: { $ne: product._id },
            status: { $in: ['active', 'published'] },
          })
            .limit(4)
            .populate('category', 'name slug')
            .lean()
        : [];

      const relatedDecorated = related.map((p) => ({
        ...p,
        pricing: resolvePrice(p, null, now, activeSales),
      }));

      return {
        ...product,
        variants: variantsWithPricing,
        pricing,
        related: relatedDecorated,
      };
    },
    {
      ttl: TTL.PRODUCT,
      tags: ['products', `product:${slug}`],
    }
  );
}

/**
 * Retrieves catalog facets (available fabrics, price bounds, audiences) for filter UI
 */
export async function getProductFacets() {
  const cacheKey = 'products:facets';

  return getOrLoad(
    cacheKey,
    async () => {
      if (mongoose.connection.readyState !== 1) {
        throw ApiError.serviceUnavailable('Database connection is temporarily unavailable');
      }

      const [fabrics, occasions, priceStats] = await Promise.all([
        Product.distinct('fabric', { status: { $in: ['active', 'published'] } }),
        Product.distinct('occasion', { status: { $in: ['active', 'published'] } }),
        Product.aggregate([
          { $match: { status: { $in: ['active', 'published'] } } },
          {
            $group: {
              _id: null,
              minPrice: { $min: '$price' },
              maxPrice: { $max: '$price' },
            },
          },
        ]),
      ]);

      const min = priceStats[0]?.minPrice ?? 3000;
      const max = priceStats[0]?.maxPrice ?? 15000;

      return {
        audiences: ['women', 'men', 'kids', 'footwear', 'home'],
        fabrics: fabrics.filter(Boolean),
        occasions: occasions.filter(Boolean),
        priceRange: { min, max },
      };
    },
    {
      ttl: TTL.PRODUCT,
      tags: ['products'],
    }
  );
}

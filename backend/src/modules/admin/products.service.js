import mongoose from 'mongoose';
import { Product } from '../products/product.model.js';
import { Order } from '../orders/order.model.js';
import { Category } from '../categories/category.model.js';
import { ApiError } from '../../core/apiError.js';
import { invalidateTag } from '../../core/cache/index.js';
import * as mediaService from './media.service.js';
import { logger } from '../../utils/logger.js';

export async function listAdminProducts({
  q = '',
  audience = '',
  category = '',
  status = '',
  page = 1,
  limit = 20,
  sort = '-createdAt',
} = {}) {
  // Database offline guard
  if (mongoose.connection.readyState !== 1) {
    return {
      docs: [],
      totalDocs: 0,
      limit,
      page,
      totalPages: 1,
    };
  }

  const filter = {};
  if (q.trim()) {
    const regex = new RegExp(q.trim(), 'i');
    const matchedCategories = await Category.find({ name: regex }).select('_id').lean();
    const matchedCategoryIds = matchedCategories.map((c) => c._id);

    filter.$or = [
      { name: regex },
      { slug: regex },
      { sku: regex },
      { subtitle: regex },
      ...(matchedCategoryIds.length > 0 ? [{ category: { $in: matchedCategoryIds } }] : []),
    ];
  }
  if (audience) {
    filter.audience = audience;
  }
  if (category) {
    filter.category = category;
  }
  if (status) {
    filter.status = status;
  }

  const p = Math.max(1, parseInt(page, 10) || 1);
  const lim = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (p - 1) * lim;

  const [docs, totalDocs] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(lim)
      .populate('category', 'name slug audience')
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    docs,
    totalDocs,
    limit: lim,
    page: p,
    totalPages: Math.ceil(totalDocs / lim) || 1,
  };
}

export async function createDraftProduct() {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  // Find or create a default category if none exists
  let defaultCategory = await Category.findOne();
  if (!defaultCategory) {
    defaultCategory = await Category.create({
      name: 'General',
      slug: 'general',
      audience: 'women',
    });
  }

  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.floor(Math.random() * 1000).toString();

  const product = await Product.create({
    name: 'Untitled Atelier Piece (Draft)',
    slug: `draft-${timestamp}-${randomSuffix}`,
    sku: `NK-DFT-${timestamp.toUpperCase()}`,
    description: '',
    category: defaultCategory._id,
    audience: 'women',
    price: 1000,
    variants: [
      {
        sku: `NK-DFT-${timestamp.toUpperCase()}-M`,
        size: 'M',
        color: 'Ivory',
        stock: 0,
      },
    ],
    images: [],
    fabric: 'Pure Lawn',
  });

  invalidateTag('products');
  invalidateTag('catalog');
  return product;
}

export async function getProductById(id) {
  if (!id || !mongoose.isValidObjectId(id)) {
    throw ApiError.notFound('Product not found');
  }

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const product = await Product.findById(id).populate('category').lean();
  if (!product) {
    throw ApiError.notFound('Product not found');
  }
  return product;
}

export async function updateProduct(id, updates) {
  if (!id || !mongoose.isValidObjectId(id)) {
    throw ApiError.notFound('Product not found');
  }

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  // Fetch current product to detect removed images
  const existing = await Product.findById(id).lean();
  if (!existing) {
    throw ApiError.notFound('Product not found');
  }

  // Validate images limit (max 20)
  if (updates.images && Array.isArray(updates.images)) {
    if (updates.images.length > 20) {
      throw ApiError.badRequest('Maximum 20 images allowed per product');
    }
    // Ensure sequential order
    updates.images = updates.images.map((img, idx) => ({
      ...img,
      order: img.order !== undefined ? Number(img.order) : idx,
    }));
  }

  // Clean and enforce integer prices
  if (updates.price !== undefined) {
    updates.price = Math.round(Number(updates.price));
  }
  // Synchronize stock and hasVariants
  if (updates.hasVariants === false) {
    updates.stock = Number(updates.stock) || 0;
    if (updates.variants && updates.variants.length === 0) {
      updates.variants = [
        {
          sku: `${existing.sku}-STD`,
          size: 'Standard',
          color: 'Default',
          stock: updates.stock,
        },
      ];
    }
  } else if (Array.isArray(updates.variants) && updates.variants.length > 0) {
    updates.hasVariants = true;
    updates.stock = updates.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }

  // Validate and clean sale configuration
  if (updates.sale) {
    if (updates.sale.isEnabled) {
      const basePrice = updates.price !== undefined ? updates.price : existing.price;
      if (updates.sale.salePrice !== undefined && updates.sale.salePrice !== null && updates.sale.salePrice !== '') {
        const salePrice = Math.round(Number(updates.sale.salePrice));
        if (salePrice >= basePrice) {
          throw ApiError.badRequest('Sale price must be less than the regular selling price');
        }
        updates.sale.salePrice = salePrice;
      }
    }
  }

  const product = await Product.findByIdAndUpdate(id, { $set: updates }, { returnDocument: 'after' });
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  // Clean up removed images from Cloudinary ONLY after DB save succeeds
  if (updates.images && Array.isArray(updates.images) && existing.images && Array.isArray(existing.images)) {
    const newPublicIds = new Set(
      updates.images.map((img) => img.publicId).filter(Boolean)
    );
    const removedImages = existing.images.filter(
      (img) => img.publicId && !newPublicIds.has(img.publicId)
    );

    for (const removed of removedImages) {
      try {
        await mediaService.deleteMediaAsset(removed.publicId);
      } catch (err) {
        logger.error(`Failed to clean up removed image ${removed.publicId}:`, err);
      }
    }
  }

  invalidateTag('products');
  invalidateTag('catalog');
  if (product.slug) invalidateTag(`product:${product.slug}`);

  return product;
}

export async function createProduct(data) {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.floor(Math.random() * 1000).toString();

  const payload = { ...data };
  delete payload._id;
  delete payload.createdAt;
  delete payload.updatedAt;

  if (!payload.name) {
    payload.name = 'Untitled Product';
  }
  if (!payload.slug) {
    payload.slug = `product-${timestamp}-${randomSuffix}`;
  } else {
    payload.slug = payload.slug.toLowerCase().trim();
  }
  if (!payload.sku) {
    payload.sku = `NK-${timestamp.toUpperCase()}`;
  } else {
    payload.sku = payload.sku.toUpperCase().trim();
  }

  // Ensure default to draft if not specified
  if (!payload.status) {
    payload.status = 'draft';
  }

  // Ensure integer prices
  if (payload.price !== undefined) {
    payload.price = Math.round(Number(payload.price)) || 1000;
  }
  if (payload.compareAtPrice !== undefined && payload.compareAtPrice !== null) {
    payload.compareAtPrice = Math.round(Number(payload.compareAtPrice));
  }

  // Validate sale configuration
  if (payload.sale) {
    if (payload.sale.isEnabled) {
      if (payload.sale.salePrice !== undefined && payload.sale.salePrice !== null && payload.sale.salePrice !== '') {
        const salePrice = Math.round(Number(payload.sale.salePrice));
        if (salePrice >= payload.price) {
          throw ApiError.badRequest('Sale price must be less than the regular selling price');
        }
        payload.sale.salePrice = salePrice;
      }
    }
  }

  // Ensure sequential order on images
  if (payload.images && Array.isArray(payload.images)) {
    if (payload.images.length > 20) {
      throw ApiError.badRequest('Maximum 20 images allowed per product');
    }
    payload.images = payload.images.map((img, idx) => ({
      ...img,
      order: img.order !== undefined ? Number(img.order) : idx,
    }));
  }

  // Calculate and synchronize stock
  if (payload.hasVariants === false) {
    payload.stock = Number(payload.stock) || 0;
    if (!payload.variants || payload.variants.length === 0) {
      payload.variants = [
        {
          sku: `${payload.sku}-STD`,
          size: 'Standard',
          color: 'Default',
          stock: payload.stock,
        },
      ];
    }
  } else if (Array.isArray(payload.variants) && payload.variants.length > 0) {
    payload.hasVariants = true;
    payload.stock = payload.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }

  const product = await Product.create(payload);
  invalidateTag('products');
  invalidateTag('catalog');
  return product;
}

export async function deleteProduct(id) {
  if (!id || !mongoose.isValidObjectId(id)) {
    throw ApiError.notFound('Product not found');
  }

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  // Guard: Cannot delete product if orders exist
  const hasOrders = await Order.exists({ 'items.productId': id });
  if (hasOrders) {
    throw ApiError.conflict('This product has existing customer orders. Archive it instead.');
  }

  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  invalidateTag('products');
  invalidateTag('catalog');
  if (product.slug) invalidateTag(`product:${product.slug}`);

  return { success: true, message: 'Product deleted successfully' };
}

export async function updateVariantStock(productId, sku, newStock) {
  if (!productId || !mongoose.isValidObjectId(productId)) {
    throw ApiError.notFound('Product not found');
  }

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const stockInt = Math.max(0, Math.round(Number(newStock)));
  const product = await Product.findOneAndUpdate(
    { _id: productId, 'variants.sku': sku },
    { $set: { 'variants.$.stock': stockInt } },
    { returnDocument: 'after' }
  );

  if (!product) {
    throw ApiError.notFound('Product or variant SKU not found');
  }

  invalidateTag('products');
  invalidateTag('inventory');
  invalidateTag('catalog');

  return product;
}

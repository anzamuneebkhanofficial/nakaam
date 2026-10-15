import mongoose from 'mongoose';
import { Sale } from '../pricing/sale.model.js';
import { Product } from '../products/product.model.js';
import { respond, respondCreated } from '../../core/respond.js';
import { ApiError } from '../../core/apiError.js';
import { invalidateTag } from '../../core/cache/index.js';

export async function listSales(req, res) {
  if (mongoose.connection.readyState !== 1) {
    return respond(res, [
      {
        _id: 's1',
        name: 'Eid Heritage Festive Sale',
        slug: 'eid-heritage-sale',
        discountType: 'percent',
        value: 15,
        scope: 'all',
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        isEnabled: true,
      },
    ]);
  }

  const sales = await Sale.find().sort({ createdAt: -1 }).lean();
  return respond(res, sales);
}

export async function createSale(req, res) {
  const {
    name,
    slug,
    discountType = 'percent',
    value,
    startsAt,
    endsAt,
    scope = 'all',
    targetAudiences = [],
    targetCategoryIds = [],
    isEnabled = true,
  } = req.body;

  if (!name || !value || !endsAt) {
    throw ApiError.badRequest('Campaign name, discount value, and end date are required');
  }

  const generatedSlug = (slug || name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const sale = await Sale.create({
    name,
    slug: `${generatedSlug}-${Date.now().toString(36)}`,
    discountType,
    value: Math.round(Number(value)),
    startsAt: startsAt ? new Date(startsAt) : new Date(),
    endsAt: new Date(endsAt),
    scope,
    targetAudiences,
    targetCategoryIds,
    isEnabled,
  });

  invalidateTag('products');
  invalidateTag('catalog');
  return respondCreated(res, sale);
}

export async function updateSale(req, res) {
  const { id } = req.params;
  const {
    name,
    discountType,
    value,
    startsAt,
    endsAt,
    scope,
    targetAudiences,
    targetCategoryIds,
    isEnabled,
  } = req.body;

  const sale = await Sale.findById(id);
  if (!sale) {
    throw ApiError.notFound('Sale campaign not found');
  }

  if (name !== undefined) sale.name = name;
  if (discountType !== undefined) sale.discountType = discountType;
  if (value !== undefined) sale.value = Math.round(Number(value));
  if (startsAt !== undefined) sale.startsAt = new Date(startsAt);
  if (endsAt !== undefined) sale.endsAt = new Date(endsAt);
  if (scope !== undefined) sale.scope = scope;
  if (targetAudiences !== undefined) sale.targetAudiences = targetAudiences;
  if (targetCategoryIds !== undefined) sale.targetCategoryIds = targetCategoryIds;
  if (isEnabled !== undefined) sale.isEnabled = Boolean(isEnabled);

  await sale.save();

  invalidateTag('products');
  invalidateTag('catalog');
  return respond(res, sale);
}

export async function previewSale(req, res) {
  const {
    discountType = 'percent',
    value,
    scope = 'all',
    targetAudiences = [],
    targetCategoryIds = [],
  } = req.body;
  const val = Number(value) || 0;

  if (mongoose.connection.readyState !== 1) {
    return respond(res, [
      { name: 'Emerald Lawn Kurta', originalPrice: 14500, newPrice: Math.round(14500 * (1 - val / 100)), savings: Math.round(14500 * (val / 100)) },
      { name: 'Marori Khussa', originalPrice: 8200, newPrice: Math.round(8200 * (1 - val / 100)), savings: Math.round(8200 * (val / 100)) },
    ]);
  }

  const filter = { status: { $in: ['active', 'published'] } };
  if (scope === 'audiences' && targetAudiences.length > 0) {
    filter.audience = { $in: targetAudiences };
  } else if (scope === 'categories' && targetCategoryIds.length > 0) {
    filter.$or = [
      { category: { $in: targetCategoryIds } },
      { subCategory: { $in: targetCategoryIds } },
    ];
  }

  const sampleProducts = await Product.find(filter).limit(6).select('name price audience category').lean();
  const preview = sampleProducts.map((p) => {
    let newPrice = p.price;
    let savings = 0;
    if (discountType === 'percent') {
      savings = Math.round((p.price * val) / 100);
      newPrice = Math.max(1, p.price - savings);
    } else {
      savings = Math.round(val);
      newPrice = Math.max(1, p.price - savings);
    }
    return {
      productId: p._id,
      name: p.name,
      originalPrice: p.price,
      newPrice,
      savings,
    };
  });

  return respond(res, preview);
}

export async function deleteSale(req, res) {
  const { id } = req.params;
  await Sale.findByIdAndDelete(id);
  invalidateTag('products');
  invalidateTag('catalog');
  return respond(res, { success: true });
}

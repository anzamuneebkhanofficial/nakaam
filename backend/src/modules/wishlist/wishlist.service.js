import mongoose from 'mongoose';
import { WishlistItem } from './wishlist.model.js';
import { Product } from '../products/product.model.js';
import { resolvePrice } from '../pricing/pricing.service.js';
import { ApiError } from '../../core/apiError.js';
import { parsePagination, formatPaginated, PAGE_SIZES } from '../../core/pagination.js';

export async function getWishlist(userId, query = {}) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection is temporarily unavailable');
  }

  const { page, limit, skip } = parsePagination(query, PAGE_SIZES.wishlist);

  const [rawItems, total] = await Promise.all([
    WishlistItem.find({ userId })
      .populate('productId', 'name slug price compareAtPrice images sale status variants')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    WishlistItem.countDocuments({ userId }),
  ]);

  const now = new Date();
  const items = rawItems
    .filter((item) => item.productId && (item.productId.status === 'active' || item.productId.status === 'published'))
    .map((item) => {
      const p = item.productId;
      const pricing = resolvePrice(p, null, now, []);
      const totalStock = p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
      return {
        _id: item._id,
        product: {
          _id: p._id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          images: p.images,
          pricing,
          inStock: totalStock > 0,
        },
        createdAt: item.createdAt,
      };
    });

  return formatPaginated(items, total, page, limit);
}

export async function addToWishlist(userId, productId) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');
  if (!productId) throw ApiError.badRequest('Product ID is required');

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection is temporarily unavailable');
  }

  await WishlistItem.findOneAndUpdate(
    { userId, productId },
    { $setOnInsert: { userId, productId } },
    { upsert: true }
  );

  return { success: true, productId };
}

export async function removeFromWishlist(userId, productId) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection is temporarily unavailable');
  }

  await WishlistItem.findOneAndDelete({ userId, productId });
  return { success: true, productId };
}

import mongoose from 'mongoose';
import { Review } from '../reviews/review.model.js';
import { Product } from '../products/product.model.js';
import { ApiError } from '../../core/apiError.js';
import { invalidateTag } from '../../core/cache/index.js';

export async function listAdminReviews({ status = '', page = 1, limit = 20 } = {}) {
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
  if (status) filter.status = status;

  const p = Math.max(1, parseInt(page, 10) || 1);
  const lim = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (p - 1) * lim;

  const [docs, totalDocs] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .populate('productId', 'name sku images')
      .lean(),
    Review.countDocuments(filter),
  ]);

  return {
    docs,
    totalDocs,
    limit: lim,
    page: p,
    totalPages: Math.ceil(totalDocs / lim) || 1,
  };
}

export async function approveReview(id, { adminUserId = null } = {}) {
  if (mongoose.connection.readyState !== 1) {
    return { _id: id, status: 'approved' };
  }

  const review = await Review.findByIdAndUpdate(
    id,
    { $set: { status: 'approved', moderatedBy: adminUserId, moderatedAt: new Date() } },
    { returnDocument: 'after' }
  );

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  // Atomically update product ratings
  if (review.productId) {
    const stats = await Review.aggregate([
      { $match: { productId: review.productId, status: 'approved' } },
      { $group: { _id: '$productId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      const avg = Math.round(stats[0].avg * 10) / 10;
      await Product.findByIdAndUpdate(review.productId, {
        $set: { 'ratings.average': avg, 'ratings.count': stats[0].count },
      }).catch(() => {});
    }
  }

  invalidateTag('products');
  invalidateTag('reviews');
  return review;
}

export async function rejectReview(id, { reason = 'Violates guidelines', adminUserId = null } = {}) {
  if (mongoose.connection.readyState !== 1) {
    return { _id: id, status: 'rejected', reason };
  }

  const review = await Review.findByIdAndUpdate(
    id,
    {
      $set: {
        status: 'rejected',
        moderationNote: reason,
        moderatedBy: adminUserId,
        moderatedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  );

  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  // Atomically update product ratings
  if (review.productId) {
    const stats = await Review.aggregate([
      { $match: { productId: review.productId, status: 'approved' } },
      { $group: { _id: '$productId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    const avg = stats.length > 0 ? Math.round(stats[0].avg * 10) / 10 : 0;
    const count = stats.length > 0 ? stats[0].count : 0;
    await Product.findByIdAndUpdate(review.productId, {
      $set: { 'ratings.average': avg, 'ratings.count': count },
    }).catch(() => {});
  }

  invalidateTag('products');
  invalidateTag('reviews');
  return review;
}

export async function deleteReview(id) {
  if (mongoose.connection.readyState !== 1) {
    return { _id: id, deleted: true };
  }

  const review = await Review.findByIdAndDelete(id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  // Atomically recalculate product ratings
  if (review.productId) {
    const stats = await Review.aggregate([
      { $match: { productId: review.productId, status: 'approved' } },
      { $group: { _id: '$productId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    const avg = stats.length > 0 ? Math.round(stats[0].avg * 10) / 10 : 0;
    const count = stats.length > 0 ? stats[0].count : 0;
    await Product.findByIdAndUpdate(review.productId, {
      $set: { 'ratings.average': avg, 'ratings.count': count },
    }).catch(() => {});
  }

  invalidateTag('products');
  invalidateTag('reviews');
  return { success: true, id };
}

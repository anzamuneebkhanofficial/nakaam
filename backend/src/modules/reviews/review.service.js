import mongoose from 'mongoose';
import { Review } from './review.model.js';
import { Product } from '../products/product.model.js';
import { Order } from '../orders/order.model.js';
import { parsePagination, formatPaginated } from '../../core/pagination.js';
import { ApiError } from '../../core/apiError.js';
import { invalidateTag } from '../../core/cache/index.js';

/**
 * Lists approved public reviews for a product with pagination
 */
export async function listProductReviews(productIdOrSlug, query = {}) {
  if (mongoose.connection.readyState !== 1) {
    return formatPaginated([], 0, 1, 10);
  }

  let product = null;
  if (mongoose.isValidObjectId(productIdOrSlug)) {
    product = await Product.findById(productIdOrSlug).select('_id').lean();
  }
  if (!product) {
    product = await Product.findOne({ slug: productIdOrSlug }).select('_id').lean();
  }

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  const { page, limit, skip } = parsePagination(query);
  const filter = { productId: product._id, status: 'approved' };

  const [items, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('customerName rating comment images isVerifiedBuyer createdAt')
      .lean(),
    Review.countDocuments(filter),
  ]);

  return formatPaginated(items, total, page, limit);
}

/**
 * Submits a new review for a product by an authenticated customer
 */
export async function createProductReview(userId, productIdOrSlug, payload) {
  if (!userId) throw ApiError.unauthorized('Authentication required to submit review');

  const { rating, comment, customerName = 'Verified Patron', images = [] } = payload;
  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    throw ApiError.badRequest('Rating must be between 1 and 5 stars');
  }
  if (!comment || !comment.trim()) {
    throw ApiError.badRequest('Review feedback comment is required');
  }

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database offline');
  }

  let product = null;
  if (mongoose.isValidObjectId(productIdOrSlug)) {
    product = await Product.findById(productIdOrSlug).select('_id name').lean();
  }
  if (!product) {
    product = await Product.findOne({ slug: productIdOrSlug }).select('_id name').lean();
  }

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  // Resolve actual customer name if not provided
  let finalCustomerName = (customerName || '').trim();
  if (!finalCustomerName || finalCustomerName === 'Verified Patron') {
    try {
      const user = await mongoose.model('User').findById(userId).select('name').lean();
      if (user?.name) {
        finalCustomerName = user.name;
      }
    } catch {
      // Fallback
    }
  }
  if (!finalCustomerName) {
    finalCustomerName = 'Customer';
  }

  // Check verified buyer status
  const verifiedOrder = await Order.findOne({
    userId,
    'items.productId': product._id,
    status: { $in: ['delivered', 'dispatched', 'confirmed'] },
  }).select('_id').lean();

  const review = new Review({
    productId: product._id,
    userId,
    orderId: verifiedOrder?._id || null,
    customerName: finalCustomerName,
    rating: Number(rating),
    comment: comment.trim(),
    images: Array.isArray(images) ? images.slice(0, 5) : [],
    isVerifiedBuyer: Boolean(verifiedOrder),
    status: 'approved', // Public immediately after submission without admin moderation
  });

  await review.save();

  // Recalculate real ratings stats on product
  const stats = await Review.aggregate([
    { $match: { productId: product._id, status: 'approved' } },
    { $group: { _id: '$productId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    const avg = Math.round(stats[0].avg * 10) / 10;
    await Product.findByIdAndUpdate(product._id, {
      $set: { 'ratings.average': avg, 'ratings.count': stats[0].count },
    }).catch(() => {});
  }

  invalidateTag('reviews');
  invalidateTag('products');
  return review.toObject();
}

import { respond, respondCreated } from '../../core/respond.js';
import * as reviewService from './review.service.js';

export async function listReviews(req, res) {
  const { slug } = req.params;
  const result = await reviewService.listProductReviews(slug, req.query);
  return respond(res, result.items, {
    totalDocs: result.total,
    limit: result.limit,
    page: result.page,
    totalPages: result.totalPages,
    hasNext: result.hasNext,
    hasPrev: result.hasPrev,
  });
}

export async function createReview(req, res) {
  const { slug } = req.params;
  const userId = req.user?.id || req.user?._id;
  const review = await reviewService.createProductReview(userId, slug, {
    ...req.body,
    customerName: req.body.customerName || req.user?.name || 'Verified Patron',
  });
  return respondCreated(res, review);
}

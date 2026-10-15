import { respond } from '../../core/respond.js';
import * as reviewsAdminService from './reviews.admin.service.js';

export async function listReviews(req, res) {
  const result = await reviewsAdminService.listAdminReviews(req.query);
  return respond(res, result.docs, {
    totalDocs: result.totalDocs,
    limit: result.limit,
    page: result.page,
    totalPages: result.totalPages,
  });
}

export async function approve(req, res) {
  const adminUserId = req.user?.id;
  const review = await reviewsAdminService.approveReview(req.params.id, { adminUserId });
  return respond(res, review);
}

export async function deleteReview(req, res) {
  const result = await reviewsAdminService.deleteReview(req.params.id);
  return respond(res, result);
}

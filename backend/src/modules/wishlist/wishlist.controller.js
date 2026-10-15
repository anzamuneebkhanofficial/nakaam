import { respond } from '../../core/respond.js';
import { ApiError } from '../../core/apiError.js';
import * as wishlistService from './wishlist.service.js';

function getUserId(req) {
  const userId = req.user?.oid || req.user?.id || req.user?._id;
  if (!userId) throw ApiError.unauthorized('Authentication required');
  return userId;
}

export async function getWishlist(req, res) {
  const userId = getUserId(req);
  const result = await wishlistService.getWishlist(userId, req.query);
  return respond(res, result.items, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
    hasNext: result.hasNext,
    hasPrev: result.hasPrev,
  });
}

export async function addToWishlist(req, res) {
  const userId = getUserId(req);
  const { productId } = req.body;
  const result = await wishlistService.addToWishlist(userId, productId);
  return respond(res, result);
}

export async function removeFromWishlist(req, res) {
  const userId = getUserId(req);
  const { productId } = req.params;
  const result = await wishlistService.removeFromWishlist(userId, productId);
  return respond(res, result);
}

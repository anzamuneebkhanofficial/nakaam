import mongoose from 'mongoose';
import { Coupon } from '../coupons/coupon.model.js';
import { respond, respondCreated } from '../../core/respond.js';
import { ApiError } from '../../core/apiError.js';
import { parsePagination, PAGE_SIZES } from '../../core/pagination.js';

export async function listCoupons(req, res) {
  if (mongoose.connection.readyState !== 1) {
    return respond(res, [
      {
        _id: 'cpn-1',
        code: 'NAKAAM10',
        type: 'percent',
        value: 10,
        minSubtotal: 5000,
        usedCount: 42,
        usageLimit: 200,
        endsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      },
    ], { page: 1, limit: PAGE_SIZES.adminCoupons, total: 1, totalPages: 1, hasNext: false, hasPrev: false });
  }

  const { page, limit, skip } = parsePagination(req.query, PAGE_SIZES.adminCoupons);
  const [coupons, total] = await Promise.all([
    Coupon.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Coupon.countDocuments(),
  ]);
  const totalPages = Math.ceil(total / limit) || 1;
  return respond(res, coupons, {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  });
}

export async function createCoupon(req, res) {
  const { code, type = 'percent', value, minSubtotal = 0, maxDiscount = null, endsAt, usageLimit } = req.body;
  if (!code || !value) {
    throw ApiError.badRequest('Coupon code and discount value are required');
  }

  const coupon = await Coupon.create({
    code: code.trim().toUpperCase(),
    type,
    value: Math.round(Number(value)),
    minSubtotal: Math.round(Number(minSubtotal) || 0),
    maxDiscount: maxDiscount ? Math.round(Number(maxDiscount)) : null,
    endsAt: endsAt ? new Date(endsAt) : null,
    usageLimit: usageLimit ? Number(usageLimit) : null,
  });

  return respondCreated(res, coupon);
}

export async function updateCoupon(req, res) {
  const { id } = req.params;
  const coupon = await Coupon.findByIdAndUpdate(id, { $set: req.body }, { returnDocument: 'after' });
  if (!coupon) {
    throw ApiError.notFound('Coupon not found');
  }
  return respond(res, coupon);
}

export async function deleteCoupon(req, res) {
  const { id } = req.params;
  await Coupon.findByIdAndDelete(id);
  return respond(res, { success: true });
}

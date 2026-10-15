import mongoose from 'mongoose';
import { Coupon } from './coupon.model.js';
import { Order } from '../orders/order.model.js';
import { ApiError } from '../../core/apiError.js';

/**
 * Validates a coupon code and calculates integer PKR discount
 * @param {Object} params
 * @param {string} params.code
 * @param {number} params.subtotal
 * @param {string} [params.userId]
 * @returns {Promise<{ valid: boolean, code: string, discount: number, type: string, value: number, maxDiscount?: number }>}
 */
export async function validateCoupon({ code, subtotal, userId }) {
  if (!code || typeof code !== 'string') {
    throw ApiError.badRequest('Coupon code is required');
  }

  const cleanCode = code.trim().toUpperCase();

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const coupon = await Coupon.findOne({ code: cleanCode, isActive: true }).lean();

  if (!coupon) {
    throw ApiError.notFound(`Coupon code "${cleanCode}" is invalid or inactive`);
  }

  const now = new Date();
  if (coupon.startsAt && now < new Date(coupon.startsAt)) {
    throw ApiError.badRequest(`Coupon "${cleanCode}" is not active yet`);
  }

  if (coupon.endsAt && now > new Date(coupon.endsAt)) {
    throw ApiError.badRequest(`Coupon "${cleanCode}" has expired`);
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw ApiError.badRequest(`Coupon "${cleanCode}" usage limit has been reached`);
  }

  // Enforce per-user redemption limit
  if (userId && coupon.perUserLimit && mongoose.connection.readyState === 1) {
    const userRedemptionCount = await Order.countDocuments({
      userId,
      'pricing.couponCode': cleanCode,
      status: { $ne: 'cancelled' },
    });

    if (userRedemptionCount >= coupon.perUserLimit) {
      throw ApiError.badRequest(
        `You have already used coupon "${cleanCode}" the maximum number of times allowed (${coupon.perUserLimit})`
      );
    }
  }

  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    throw ApiError.badRequest(
      `Coupon "${cleanCode}" requires a minimum order subtotal of PKR ${coupon.minSubtotal.toLocaleString()}`
    );
  }

  let discount = 0;
  if (coupon.type === 'percent') {
    discount = Math.round(subtotal * (coupon.value / 100));
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.type === 'flat') {
    discount = Math.min(coupon.value, subtotal);
  }

  // Ensure discount does not exceed subtotal
  discount = Math.min(discount, subtotal);

  return {
    valid: true,
    code: coupon.code,
    discount,
    type: coupon.type,
    value: coupon.value,
    maxDiscount: coupon.maxDiscount,
  };
}

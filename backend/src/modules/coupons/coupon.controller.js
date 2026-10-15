import { respond } from '../../core/respond.js';
import * as couponService from './coupon.service.js';

export async function validateCoupon(req, res) {
  const { code, subtotal } = req.body;
  const userId = req.user?._id;
  const result = await couponService.validateCoupon({ code, subtotal, userId });
  return respond(res, result);
}

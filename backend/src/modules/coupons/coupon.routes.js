import { Router } from 'express';
import * as couponController from './coupon.controller.js';

const router = Router();

router.post('/validate', couponController.validateCoupon);

export const couponRoutes = router;

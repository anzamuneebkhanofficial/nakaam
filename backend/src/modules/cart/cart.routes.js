import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth.js';
import * as cartController from './cart.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', cartController.getCart);
router.post('/items', cartController.addToCart);
router.patch('/items/:sku', cartController.updateCartItem);
router.delete('/items/:sku', cartController.removeFromCart);
router.post('/merge', cartController.mergeGuestCart);
router.delete('/', cartController.clearCart);

export const cartRoutes = router;

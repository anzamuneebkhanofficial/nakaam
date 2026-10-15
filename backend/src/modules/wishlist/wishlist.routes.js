import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth.js';
import * as wishlistController from './wishlist.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);

export const wishlistRoutes = router;

import { Router } from 'express';
import * as productController from './product.controller.js';
import * as reviewController from '../reviews/review.controller.js';
import { requireAuth } from '../../middlewares/requireAuth.js';

export const productRouter = Router();

productRouter.get('/', productController.getProducts);
productRouter.get('/facets', productController.getFacets);
productRouter.get('/:slug', productController.getProduct);
productRouter.get('/:slug/reviews', reviewController.listReviews);
productRouter.post('/:slug/reviews', requireAuth, reviewController.createReview);

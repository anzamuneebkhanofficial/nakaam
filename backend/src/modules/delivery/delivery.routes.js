import { Router } from 'express';
import * as deliveryController from './delivery.controller.js';
import { optionalAuth, requireAuth } from '../../middlewares/requireAuth.js';

export const deliveryRouter = Router();

deliveryRouter.get('/options', deliveryController.getOptions);
deliveryRouter.post('/orders/:orderId/reports', optionalAuth, deliveryController.reportIssue);
deliveryRouter.get('/orders/:orderId/reports', optionalAuth, deliveryController.getReports);


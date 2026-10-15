import { Router } from 'express';
import * as ordersController from './orders.controller.js';
import { requireAuth } from '../../middlewares/requireAuth.js';

const router = Router();

router.get('/', requireAuth, ordersController.listMyOrders);
router.post('/quote', ordersController.getQuote);
router.post('/', requireAuth, ordersController.createOrder);
router.get('/:id', requireAuth, ordersController.getOrder);
router.get('/:id/tracking', requireAuth, ordersController.getOrderTracking);
router.post('/:id/confirm-delivery', requireAuth, ordersController.confirmDeliveryReceipt);
router.post('/:id/payment-proof', requireAuth, ordersController.submitPaymentProof);
router.post('/:id/payment-proof/whatsapp-sent', requireAuth, ordersController.submitWhatsAppProofSent);

export const ordersRoutes = router;

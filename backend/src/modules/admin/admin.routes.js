import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireRole } from '../../middlewares/requireRole.js';

import * as dashboardController from './dashboard.controller.js';
import * as mediaController from './media.controller.js';
import { upload } from './media.upload.js';
import * as productsController from './products.controller.js';
import * as importController from './import.controller.js';
import * as categoriesController from './categories.admin.controller.js';
import * as salesController from './sales.controller.js';
import * as couponsController from './coupons.admin.controller.js';
import * as ordersAdminController from './orders.admin.controller.js';
import * as reconciliationController from './reconciliation.controller.js';
import * as complaintsAdminController from './complaints.admin.controller.js';
import * as usersAdminController from './users.admin.controller.js';
import * as reviewsAdminController from './reviews.admin.controller.js';
import * as settingsAdminController from '../settings/settings.controller.js';

import * as deliveryAdminController from '../delivery/delivery.controller.js';

export const adminRoutes = Router();

// Apply defense-in-depth protection across all admin routes
adminRoutes.use(requireAuth, requireRole(['admin', 'operator']));

// 1. Dashboard Operations (Screen 34)
adminRoutes.get('/dashboard/metrics', dashboardController.getMetrics);

// 2. Cloudinary Media Upload, Sign & Rollback
adminRoutes.post('/media/upload', upload.array('files', 20), mediaController.uploadMedia);
adminRoutes.post('/media/sign', mediaController.signUpload);
adminRoutes.delete('/media', mediaController.deleteAsset);
adminRoutes.delete('/media/:publicId', mediaController.deleteAsset);

// 3. Products Catalog & Stock
adminRoutes.get('/products', productsController.listProducts);
adminRoutes.post('/products', productsController.createDraft);
adminRoutes.get('/products/:id', productsController.getProduct);
adminRoutes.patch('/products/:id', productsController.updateProduct);
adminRoutes.delete('/products/:id', productsController.deleteProduct);
adminRoutes.post('/products/:id/variants/:sku/stock', productsController.updateStock);

// 4. CSV Bulk Stock & Product Import
adminRoutes.post('/products/import/validate', importController.validateImport);
adminRoutes.post('/products/import/commit', importController.commitImport);

// 5. Categories Taxonomy & Curations
adminRoutes.get('/categories', categoriesController.listCategories);
adminRoutes.post('/categories', categoriesController.createCategory);
adminRoutes.patch('/categories/:id', categoriesController.updateCategory);
adminRoutes.delete('/categories/:id', categoriesController.deleteCategory);

// 6. Flash Sales & Promotional Campaigns
adminRoutes.get('/sales', salesController.listSales);
adminRoutes.post('/sales', salesController.createSale);
adminRoutes.put('/sales/:id', salesController.updateSale);
adminRoutes.post('/sales/preview', salesController.previewSale);
adminRoutes.delete('/sales/:id', salesController.deleteSale);

// 7. Coupons & Vouchers
adminRoutes.get('/coupons', couponsController.listCoupons);
adminRoutes.post('/coupons', couponsController.createCoupon);
adminRoutes.patch('/coupons/:id', couponsController.updateCoupon);
adminRoutes.delete('/coupons/:id', couponsController.deleteCoupon);

// 8. Order Fulfillment & Fast Blinker Polling (Screen 18)
adminRoutes.get('/orders/stream/blinker', ordersAdminController.getBlinker);
adminRoutes.get('/orders', ordersAdminController.listOrders);
adminRoutes.get('/orders/:id', ordersAdminController.getOrder);
adminRoutes.post('/orders/:id/status', ordersAdminController.updateStatus);
adminRoutes.post('/orders/:id/payment/verify', ordersAdminController.verifyPayment);
adminRoutes.post('/orders/:id/payment/reject', ordersAdminController.rejectPayment);
adminRoutes.post('/orders/:id/confirm', ordersAdminController.confirmCod);
adminRoutes.patch('/orders/:id/delivery', ordersAdminController.updateDelivery);
adminRoutes.get('/orders/:id/darzi-slip', ordersAdminController.getDarziSlip);
adminRoutes.get('/orders/:id/whatsapp-link', ordersAdminController.getWhatsAppLink);

// 9. Raast P2P & COD Financial Reconciliation Ledger (Screen 35)
adminRoutes.get('/reconciliation', reconciliationController.getLedger);

// 10. Customer Support & Complaints Queue (Screen 12)
adminRoutes.get('/complaints', complaintsAdminController.listComplaints);
adminRoutes.get('/complaints/:id', complaintsAdminController.getComplaint);
adminRoutes.patch('/complaints/:id/status', complaintsAdminController.updateStatus);
adminRoutes.delete('/complaints/:id', complaintsAdminController.deleteComplaint);

// 11. Customer Directory & Risk Scoring
adminRoutes.get('/users', usersAdminController.listUsers);
adminRoutes.get('/users/:id', usersAdminController.getUser);
adminRoutes.post('/users/:id/block', usersAdminController.toggleBlock);

// 12. Review UGC & Social Proof Moderation
adminRoutes.get('/reviews', reviewsAdminController.listReviews);
adminRoutes.post('/reviews/:id/approve', reviewsAdminController.approve);
adminRoutes.delete('/reviews/:id', reviewsAdminController.deleteReview);

// 13. Atelier Store Settings
adminRoutes.get('/settings', settingsAdminController.getAdminSettings);
adminRoutes.patch('/settings', settingsAdminController.updateSettings);

// 14. Delivery Reports Management
adminRoutes.get('/delivery-reports', deliveryAdminController.listAdminReports);
adminRoutes.patch('/delivery-reports/:reportId', deliveryAdminController.updateAdminReport);



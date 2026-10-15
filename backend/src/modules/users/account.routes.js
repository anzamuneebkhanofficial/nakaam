import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth.js';
import * as accountController from './account.controller.js';

const router = Router();

// Apply requireAuth across all personal customer account endpoints
router.use(requireAuth);

// Account Overview & Summary
router.get('/summary', accountController.getSummary);

// Profile & Tailoring Measurements
router.get('/profile', accountController.getProfile);
router.put('/profile', accountController.updateProfile);

// Family Size Book
router.post('/family', accountController.addFamilyMember);
router.delete('/family/:id', accountController.deleteFamilyMember);

// Saved Delivery Addresses
router.get('/addresses', accountController.listAddresses);
router.post('/addresses', accountController.createAddress);
router.delete('/addresses/:id', accountController.deleteAddress);
router.post('/addresses/:id/default', accountController.setDefaultAddress);

// In-App Notifications (Fast Polling)
router.get('/notifications', accountController.getNotifications);
router.post('/notifications/read-all', accountController.markAllNotificationsRead);
router.post('/notifications/:id/read', accountController.markNotificationRead);

export const accountRoutes = router;

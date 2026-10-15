import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth.js';
import * as authController from './auth.controller.js';

export const authRouter = Router();

// /api/me identity routes
authRouter.get('/me', requireAuth, authController.getMe);
authRouter.patch('/me', requireAuth, authController.updateMe);
authRouter.get('/me/summary', requireAuth, authController.getMeSummary);

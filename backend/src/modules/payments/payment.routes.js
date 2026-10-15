import { Router } from 'express';
import * as paymentController from './payment.controller.js';

export const paymentRouter = Router();

paymentRouter.get('/accounts', paymentController.getAccounts);

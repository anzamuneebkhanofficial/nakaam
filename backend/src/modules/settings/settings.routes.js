import { Router } from 'express';
import * as settingsController from './settings.controller.js';

export const settingsRouter = Router();

settingsRouter.get('/public', settingsController.getPublicSettings);

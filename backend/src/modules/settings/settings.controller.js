import { respond } from '../../core/respond.js';
import * as settingsService from './settings.service.js';

export async function getPublicSettings(req, res) {
  const settings = await settingsService.getPublicSettings();
  return respond(res, settings);
}

export async function getAdminSettings(req, res) {
  const settings = await settingsService.getAdminSettings();
  return respond(res, settings);
}

export async function updateSettings(req, res) {
  const updated = await settingsService.updateStoreSettings(req.body);
  return respond(res, updated);
}

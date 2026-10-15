import { respond } from '../../core/respond.js';
import * as importService from './import.service.js';

export async function validateImport(req, res) {
  const { rows } = req.body;
  const result = await importService.validateImportRows(rows || []);
  return respond(res, result);
}

export async function commitImport(req, res) {
  const { rows } = req.body;
  const result = await importService.commitImportRows(rows || []);
  return respond(res, result);
}

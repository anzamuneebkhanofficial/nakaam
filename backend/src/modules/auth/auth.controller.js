import { respond } from '../../core/respond.js';
import { userService } from '../users/index.js';
import * as accountService from '../users/account.service.js';

export async function getMe(req, res) {
  const user = await userService.findById(req.user.id);
  return respond(res, user || req.user);
}

export async function updateMe(req, res) {
  const updated = await userService.updateUser(req.user.id, req.body);
  return respond(res, updated);
}

export async function getMeSummary(req, res) {
  const summary = await accountService.getSummary(req.user.id || req.user._id);
  return respond(res, summary);
}

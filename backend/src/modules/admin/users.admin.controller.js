import { respond } from '../../core/respond.js';
import * as usersAdminService from './users.admin.service.js';

export async function listUsers(req, res) {
  const result = await usersAdminService.listAdminUsers(req.query);
  return respond(res, result.docs, {
    totalDocs: result.totalDocs,
    limit: result.limit,
    page: result.page,
    totalPages: result.totalPages,
  });
}

export async function getUser(req, res) {
  const user = await usersAdminService.getAdminUserById(req.params.id);
  return respond(res, user);
}

export async function toggleBlock(req, res) {
  const { isBlocked, reason } = req.body;
  const user = await usersAdminService.toggleUserBlock(req.params.id, { isBlocked, reason });
  return respond(res, user);
}

import { respond, respondCreated } from '../../core/respond.js';
import { ApiError } from '../../core/apiError.js';
import * as accountService from './account.service.js';
import * as notificationService from '../notifications/notification.service.js';

function getUserId(req) {
  const userId = req.user?.oid || req.user?.id || req.user?._id;
  if (!userId) throw ApiError.unauthorized('Authentication required');
  return userId;
}

export async function getSummary(req, res) {
  const userId = getUserId(req);
  const summary = await accountService.getSummary(userId);
  return respond(res, summary);
}

export async function getProfile(req, res) {
  const userId = getUserId(req);
  const profile = await accountService.getProfile(userId);
  return respond(res, profile);
}

export async function updateProfile(req, res) {
  const userId = getUserId(req);
  const profile = await accountService.updateProfile(userId, req.body);
  return respond(res, profile);
}

export async function addFamilyMember(req, res) {
  const userId = getUserId(req);
  const member = await accountService.addFamilyMember(userId, req.body);
  return respondCreated(res, member);
}

export async function deleteFamilyMember(req, res) {
  const userId = getUserId(req);
  const { id } = req.params;
  const result = await accountService.deleteFamilyMember(userId, id);
  return respond(res, result);
}

export async function listAddresses(req, res) {
  const userId = getUserId(req);
  const addresses = await accountService.listAddresses(userId);
  return respond(res, addresses);
}

export async function createAddress(req, res) {
  const userId = getUserId(req);
  const address = await accountService.createAddress(userId, req.body);
  return respondCreated(res, address);
}

export async function deleteAddress(req, res) {
  const userId = getUserId(req);
  const { id } = req.params;
  const result = await accountService.deleteAddress(userId, id);
  return respond(res, result);
}

export async function setDefaultAddress(req, res) {
  const userId = getUserId(req);
  const { id } = req.params;
  const result = await accountService.setDefaultAddress(userId, id);
  return respond(res, result);
}

export async function getNotifications(req, res) {
  const userId = getUserId(req);
  const result = await notificationService.getNotifications(userId, req.query);
  return respond(res, result.items, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
    hasNext: result.hasNext,
    hasPrev: result.hasPrev,
  });
}

export async function markNotificationRead(req, res) {
  const userId = getUserId(req);
  const { id } = req.params;
  const result = await notificationService.markAsRead(userId, id);
  return respond(res, result);
}

export async function markAllNotificationsRead(req, res) {
  const userId = getUserId(req);
  const result = await notificationService.markAllAsRead(userId);
  return respond(res, result);
}

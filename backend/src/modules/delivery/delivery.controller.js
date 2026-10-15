import { respond } from '../../core/respond.js';
import * as deliveryService from './delivery.service.js';

export async function getOptions(req, res) {
  const { city } = req.query;
  const options = await deliveryService.getDeliveryOptions(city);
  return respond(res, options);
}

export async function reportIssue(req, res) {
  const { orderId } = req.params;
  const { issueType, preferredContactMethod, contactPhone, message } = req.body;
  const userId = req.user?._id || req.user?.id || null;

  const report = await deliveryService.createDeliveryReport({
    orderIdentifier: orderId,
    issueType,
    preferredContactMethod,
    contactPhone,
    message,
    userId,
  });

  return respond(res, report, 201);
}

export async function getReports(req, res) {
  const { orderId } = req.params;
  const userId = req.user?._id || req.user?.id || null;

  const reports = await deliveryService.getOrderDeliveryReports(orderId, userId);
  return respond(res, reports);
}

export async function listAdminReports(req, res) {
  const { status, page, limit } = req.query;
  const result = await deliveryService.listAdminDeliveryReports({ status, page, limit });
  return respond(res, result);
}

export async function updateAdminReport(req, res) {
  const { reportId } = req.params;
  const { status, adminNotes } = req.body;
  const adminUserId = req.user?._id || req.user?.id || null;

  const updated = await deliveryService.updateAdminDeliveryReport(reportId, {
    status,
    adminNotes,
    adminUserId,
  });

  return respond(res, updated);
}


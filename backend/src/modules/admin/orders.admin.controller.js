import { respond } from '../../core/respond.js';
import * as ordersAdminService from './orders.admin.service.js';

export async function listOrders(req, res) {
  const result = await ordersAdminService.listAdminOrders(req.query);
  return respond(res, result.docs, {
    totalDocs: result.totalDocs,
    limit: result.limit,
    page: result.page,
    totalPages: result.totalPages,
  });
}

export async function getOrder(req, res) {
  const order = await ordersAdminService.getAdminOrderById(req.params.id);
  return respond(res, order);
}

export async function updateStatus(req, res) {
  const { status, note } = req.body;
  const adminUserId = req.user?.id;
  const order = await ordersAdminService.transitionOrderStatus(req.params.id, status, {
    actor: 'admin',
    note,
    adminUserId,
  });
  return respond(res, order);
}

export async function verifyPayment(req, res) {
  const adminUserId = req.user?.id;
  const order = await ordersAdminService.verifyPaymentProof(req.params.id, {
    adminUserId,
    note: req.body.note,
  });
  return respond(res, order);
}

export async function rejectPayment(req, res) {
  const adminUserId = req.user?.id;
  const order = await ordersAdminService.rejectPaymentProof(req.params.id, {
    rejectionReason: req.body.reason,
    adminUserId,
  });
  return respond(res, order);
}

export async function confirmCod(req, res) {
  const adminUserId = req.user?.id;
  const order = await ordersAdminService.confirmCodOrder(req.params.id, {
    confirmedVia: req.body.via || 'whatsapp',
    adminUserId,
  });
  return respond(res, order);
}

export async function updateDelivery(req, res) {
  const adminUserId = req.user?.id;
  const order = await ordersAdminService.updateDeliveryDispatch(req.params.id, {
    courier: req.body.courier,
    trackingNumber: req.body.trackingNumber,
    etaDays: req.body.etaDays,
    adminUserId,
  });
  return respond(res, order);
}

export async function getDarziSlip(req, res) {
  const slip = await ordersAdminService.getDarziSlip(req.params.id);
  return respond(res, slip);
}

export async function getWhatsAppLink(req, res) {
  const order = await ordersAdminService.getAdminOrderById(req.params.id);
  const link = ordersAdminService.generateWhatsAppLink(order, req.query.template || 'order_confirm');
  return respond(res, link);
}

export async function getBlinker(req, res) {
  const status = await ordersAdminService.getBlinkerStatus();
  return respond(res, status);
}

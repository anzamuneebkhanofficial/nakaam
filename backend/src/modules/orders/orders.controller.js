import { respond, respondCreated } from '../../core/respond.js';
import * as ordersService from './orders.service.js';

export async function listMyOrders(req, res) {
  const userId = req.user?.id || req.user?._id;
  const result = await ordersService.listOrdersByUser(userId, req.query);
  return respond(res, result.items, {
    totalDocs: result.total,
    limit: result.limit,
    page: result.page,
    totalPages: result.totalPages,
    hasNext: result.hasNext,
    hasPrev: result.hasPrev,
  });
}

export async function getQuote(req, res) {
  const { items, city, deliveryOptionCode, paymentMethod, couponCode } = req.body;
  const userId = req.user?.oid || req.user?.id || req.user?._id;
  const quote = await ordersService.getCheckoutQuote({
    items,
    city,
    deliveryOptionCode,
    paymentMethod,
    couponCode,
    userId,
  });
  return respond(res, quote);
}

export async function createOrder(req, res) {
  const idempotencyKey = req.headers['idempotency-key'] || req.body.idempotencyKey;
  const userId = req.user?.oid || req.user?.id || req.user?._id;
  const order = await ordersService.createOrder(req.body, idempotencyKey, userId);
  return respondCreated(res, order);
}

export async function getOrder(req, res) {
  const { id } = req.params;
  const userId = req.user?.oid || req.user?.id || req.user?._id;
  const order = await ordersService.getOrderById(id, userId);
  return respond(res, order);
}

export async function submitPaymentProof(req, res) {
  const { id } = req.params;
  const { via, imageUrl, publicId, txnRef } = req.body;
  const userId = req.user?._id;
  const order = await ordersService.submitPaymentProof(id, {
    via: via || 'upload',
    imageUrl,
    publicId,
    txnRef,
    userId,
  });
  return respond(res, order);
}

export async function confirmDeliveryReceipt(req, res) {
  const { id } = req.params;
  const { notes, rating } = req.body;
  const userId = req.user?.oid || req.user?.id || req.user?._id;
  const order = await ordersService.confirmDeliveryReceipt(id, {
    notes,
    rating,
    userId,
  });
  return respond(res, order);
}

export async function submitWhatsAppProofSent(req, res) {
  const { id } = req.params;
  const userId = req.user?._id;
  const order = await ordersService.submitPaymentProof(id, {
    via: 'whatsapp',
    userId,
  });
  return respond(res, order);
}

export async function getOrderTracking(req, res) {
  const { id } = req.params;
  const userId = req.user?.oid || req.user?.id || req.user?._id;
  const order = await ordersService.getOrderById(id, userId);
  const trackingPayload = {
    orderNumber: order.orderNumber,
    status: order.status,
    delivery: order.delivery,
    statusHistory: order.statusHistory,
    shippingAddress: {
      fullName: order.shippingAddress.fullName,
      city: order.shippingAddress.city,
    },
    payment: {
      status: order.payment.status,
      method: order.paymentMethod,
      amountDue: order.payment.amountDue,
    },
    createdAt: order.createdAt,
  };
  return respond(res, trackingPayload);
}

import mongoose from 'mongoose';
import { Order } from '../orders/order.model.js';
import { getOrderStatusLabel, ORDER_STATUSES } from '../orders/order.constants.js';
import { User } from '../users/user.model.js';
import {
  sendRaastVerifiedEmail,
  sendOrderDispatchedEmail,
  sendOrderCancelledEmail,
  sendOrderDeliveredEmail,
  sendOrderStatusUpdateEmail,
} from '../email/email.service.js';
import { notifyUser } from '../notifications/notification.service.js';
import { ApiError } from '../../core/apiError.js';
import { invalidateTag } from '../../core/cache/index.js';
import { logger } from '../../utils/logger.js';

function emailOrderStatusUpdate(order, note = '') {
  const deliver = (to, customerName) => {
    if (!to) return;
    const emailOptions = { to, order, customerName };
    const emailPromise =
      order.status === 'cancelled'
        ? sendOrderCancelledEmail({ ...emailOptions, reason: note })
        : order.status === 'delivered'
        ? sendOrderDeliveredEmail(emailOptions)
        : order.status === 'dispatched'
        ? sendOrderDispatchedEmail({
            ...emailOptions,
            courier: order.delivery?.courier || 'Courier',
            trackingNumber: order.delivery?.trackingNumber || 'Available shortly',
          })
        : sendOrderStatusUpdateEmail({ ...emailOptions, note });

    emailPromise.catch((error) => {
      logger.error('Failed to send order status update email', {
        orderNumber: order.orderNumber,
        error: error.message,
      });
    });
  };

  const email = order.shippingAddress?.email;
  if (email) {
    deliver(email, order.shippingAddress?.fullName);
    return;
  }

  if (order.userId) {
    User.findById(order.userId)
      .select('email name')
      .lean()
      .then((user) => deliver(user?.email, order.shippingAddress?.fullName || user?.name))
      .catch((error) => {
        logger.error('Failed to load customer for order status email', {
          orderNumber: order.orderNumber,
          error: error.message,
        });
      });
  }
}

export async function listAdminOrders({
  status = '',
  paymentMethod = '',
  paymentStatus = '',
  city = '',
  q = '',
  hasProof = '',
  filter: queueFilter = '',
  page = 1,
  limit = 20,
  sort = '-createdAt',
} = {}) {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const filter = {};
  const conditions = [];
  if (q.trim()) {
    const regex = new RegExp(q.trim(), 'i');
    conditions.push({ $or: [
      { orderNumber: regex },
      { 'shippingAddress.fullName': regex },
      { 'shippingAddress.phone': regex },
    ] });
  }
  if (queueFilter === 'action_required') {
    conditions.push({
      $or: [
        { status: { $in: ['placed', 'awaiting_confirmation'] } },
        { 'payment.status': 'proof_submitted' },
        { status: 'return_requested' },
      ],
    });
  }
  if (conditions.length) filter.$and = conditions;
  if (status) filter.status = status;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (paymentStatus) filter['payment.status'] = paymentStatus;
  if (city) filter['shippingAddress.city'] = new RegExp(city, 'i');
  if (hasProof === 'true') {
    filter['payment.status'] = 'proof_submitted';
  }

  const p = Math.max(1, parseInt(page, 10) || 1);
  const lim = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (p - 1) * lim;

  const [docs, totalDocs] = await Promise.all([
    Order.find(filter).sort(sort).skip(skip).limit(lim).lean(),
    Order.countDocuments(filter),
  ]);

  return {
    docs,
    totalDocs,
    limit: lim,
    page: p,
    totalPages: Math.ceil(totalDocs / lim) || 1,
  };
}

export async function getAdminOrderById(idOrNumber) {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const query = mongoose.isValidObjectId(idOrNumber)
    ? { _id: idOrNumber }
    : { orderNumber: idOrNumber };

  const order = await Order.findOne(query).lean();
  if (!order) {
    throw ApiError.notFound('Order not found');
  }
  return order;
}

export async function transitionOrderStatus(orderId, nextStatus, { actor = 'admin', note = '', adminUserId = null } = {}) {
  if (!ORDER_STATUSES.includes(nextStatus)) {
    throw ApiError.badRequest('Invalid order status');
  }

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const query = mongoose.isValidObjectId(orderId) ? { _id: orderId } : { orderNumber: orderId };
  const order = await Order.findOne(query);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.status === nextStatus) {
    return order.toObject();
  }

  order.status = nextStatus;
  order.statusHistory.push({
    status: nextStatus,
    at: new Date(),
    by: actor,
    byUserId: adminUserId,
    note: note || `Status transitioned to ${nextStatus}`,
  });

  await order.save();
  invalidateTag('orders');
  invalidateTag('admin-metrics');

  const orderObj = order.toObject();
  emailOrderStatusUpdate(orderObj, note);

  // In-app Patron Notification
  if (order.userId) {
    const statusTitles = {
      confirmed: `Order Confirmed (#${order.orderNumber})`,
      processing: `Darzi Tailoring Started (#${order.orderNumber})`,
      dispatched: `Order Dispatched (#${order.orderNumber})`,
      delivered: `Order Delivered (#${order.orderNumber})`,
      cancelled: `Order Cancelled (#${order.orderNumber})`,
    };
    const statusLabel = getOrderStatusLabel(nextStatus);
    const title = statusTitles[nextStatus] || `Order Status Updated: ${statusLabel}`;
    notifyUser(order.userId, {
      type: nextStatus === 'dispatched' ? 'dispatched' : 'order',
      title,
      body: `Your order status was updated to: ${statusLabel}.${note ? ` Note: ${note}` : ''}`,
      link: `/user/orders/${order.orderNumber}`,
    }).catch(() => {});
  }

  return orderObj;
}

export async function verifyPaymentProof(orderId, { adminUserId = null, note = '' } = {}) {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const query = mongoose.isValidObjectId(orderId) ? { _id: orderId } : { orderNumber: orderId };
  const order = await Order.findOne(query);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  const previousStatus = order.status;
  order.payment.status = 'verified';
  order.expiresAt = null;
  order.payment.verifiedAt = new Date();
  order.payment.verifiedBy = adminUserId;
  order.payment.amountVerified = order.pricing.total;

  if (['placed', 'awaiting_payment'].includes(order.status)) {
    order.status = 'confirmed';
  }

  order.statusHistory.push({
    status: order.status,
    at: new Date(),
    by: 'admin',
    byUserId: adminUserId,
    note: note || 'Raast bank transfer receipt verified by admin',
  });

  await order.save();
  invalidateTag('orders');
  invalidateTag('admin-metrics');

  const orderObj = order.toObject();

  if (previousStatus !== order.status) {
    emailOrderStatusUpdate(orderObj, note || 'Payment proof verified by admin');
  } else {
    const recipientEmail = order.shippingAddress?.email;
    if (recipientEmail) {
      sendRaastVerifiedEmail({
        to: recipientEmail,
        order: orderObj,
        customerName: order.shippingAddress?.fullName,
      }).catch((error) => {
        logger.error('Failed to send payment verification email', {
          orderNumber: order.orderNumber,
          error: error.message,
        });
      });
    } else if (order.userId) {
      User.findById(order.userId)
        .select('email name')
        .lean()
        .then((user) => {
          if (user?.email) {
            sendRaastVerifiedEmail({
              to: user.email,
              order: orderObj,
              customerName: order.shippingAddress?.fullName || user.name,
            }).catch((error) => {
              logger.error('Failed to send payment verification email', {
                orderNumber: order.orderNumber,
                error: error.message,
              });
            });
          }
        })
        .catch((error) => {
          logger.error('Failed to load customer for payment verification email', {
            orderNumber: order.orderNumber,
            error: error.message,
          });
        });
    }
  }

  if (order.userId) {
    notifyUser(order.userId, {
      type: 'payment',
      title: `Payment Verified (#${order.orderNumber})`,
      body: 'Your Raast bank transfer payment proof was audited and approved.',
      link: `/user/orders/${order.orderNumber}`,
    }).catch(() => {});
  }

  return orderObj;
}

export async function rejectPaymentProof(orderId, { rejectionReason = 'Receipt mismatch or unreadable image', adminUserId = null } = {}) {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const query = mongoose.isValidObjectId(orderId) ? { _id: orderId } : { orderNumber: orderId };
  const order = await Order.findOne(query);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  order.payment.status = 'rejected';
  order.payment.rejectionReason = rejectionReason;

  order.statusHistory.push({
    status: order.status,
    at: new Date(),
    by: 'admin',
    byUserId: adminUserId,
    note: `Payment proof rejected: ${rejectionReason}`,
  });

  await order.save();
  invalidateTag('orders');
  invalidateTag('admin-metrics');

  if (order.userId) {
    notifyUser(order.userId, {
      type: 'payment',
      title: `Payment Proof Rejected (#${order.orderNumber})`,
      body: `Reason: ${rejectionReason}. Please upload a legible proof slip in your account.`,
      link: `/user/orders/${order.orderNumber}`,
    }).catch(() => {});
  }

  return order.toObject();
}

export async function confirmCodOrder(orderId, { confirmedVia = 'whatsapp', adminUserId = null } = {}) {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const query = mongoose.isValidObjectId(orderId) ? { _id: orderId } : { orderNumber: orderId };
  const order = await Order.findOne(query);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  const previousStatus = order.status;
  order.status = 'confirmed';
  order.cod.confirmedAt = new Date();
  order.cod.confirmedVia = confirmedVia;

  if (previousStatus !== 'confirmed') {
    order.statusHistory.push({
      status: 'confirmed',
      at: new Date(),
      by: 'admin',
      byUserId: adminUserId,
      note: `COD delivery confirmed via ${confirmedVia}`,
    });
  }

  await order.save();
  invalidateTag('orders');
  invalidateTag('admin-metrics');
  if (previousStatus !== 'confirmed') {
    emailOrderStatusUpdate(order.toObject(), `COD order confirmed via ${confirmedVia}`);
  }

  if (order.userId && previousStatus !== 'confirmed') {
    notifyUser(order.userId, {
      type: 'order',
      title: `COD Delivery Confirmed (#${order.orderNumber})`,
      body: `Your Cash on Delivery order was verified via ${confirmedVia} and scheduled for workshop preparation.`,
      link: `/user/orders/${order.orderNumber}`,
    }).catch(() => {});
  }

  return order.toObject();
}

export async function updateDeliveryDispatch(orderId, { courier, trackingNumber, etaDays = 3, adminUserId = null } = {}) {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const query = mongoose.isValidObjectId(orderId) ? { _id: orderId } : { orderNumber: orderId };
  const order = await Order.findOne(query);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (courier) order.delivery.courier = courier;
  if (trackingNumber) order.delivery.trackingNumber = trackingNumber;
  if (etaDays) {
    order.delivery.etaDaysMin = etaDays;
    order.delivery.etaDaysMax = Number(etaDays) + 1;
  }

  order.status = 'dispatched';
  order.statusHistory.push({
    status: 'dispatched',
    at: new Date(),
    by: 'admin',
    byUserId: adminUserId,
    note: `Dispatched via ${courier || 'Courier'} (Tracking: ${trackingNumber || 'Pending'})`,
  });

  await order.save();
  invalidateTag('orders');
  invalidateTag('admin-metrics');

  if (order.userId) {
    notifyUser(order.userId, {
      type: 'dispatched',
      title: `Order Dispatched (#${order.orderNumber})`,
      body: `Your parcel was dispatched with ${courier || 'Courier'}. Tracking: ${trackingNumber || 'Available shortly'}.`,
      link: `/user/orders/${order.orderNumber}`,
    }).catch(() => {});
  }

  const orderObj = order.toObject();
  emailOrderStatusUpdate(orderObj, `Dispatched via ${courier || 'Courier'}`);

  return orderObj;
}

export async function getDarziSlip(orderId) {
  const order = await getAdminOrderById(orderId);
  return {
    orderNumber: order.orderNumber,
    orderDate: order.createdAt,
    customerName: order.shippingAddress?.fullName,
    customerPhone: order.shippingAddress?.phone,
    destinationCity: order.shippingAddress?.city,
    shippingAddress: `${order.shippingAddress?.street}, ${order.shippingAddress?.city}`,
    items: order.items.map((i) => ({
      name: i.name,
      variantSku: i.variantSku,
      size: i.size,
      color: i.color || 'Standard',
      quantity: i.quantity,
    })),
    customerNote: order.customerNote || 'No special requests',
    totalPKR: order.pricing?.total,
    paymentMethod: order.paymentMethod,
  };
}

export function generateWhatsAppLink(order, template = 'order_confirm') {
  const phone = (order.shippingAddress?.phone || '').replace(/[^0-9]/g, '');
  const cleanPhone = phone.startsWith('0') ? `92${phone.slice(1)}` : phone;

  let message = '';
  if (template === 'order_confirm') {
    message = `Assalam-o-Alaikum ${order.shippingAddress?.fullName}! This is Nakaam Atelier (Lahore). We are preparing your order #${order.orderNumber} for Rs ${order.pricing?.total}. Please reply to confirm delivery to ${order.shippingAddress?.city}. Thank you!`;
  } else if (template === 'dispatched') {
    message = `Assalam-o-Alaikum ${order.shippingAddress?.fullName}! Your Nakaam parcel #${order.orderNumber} has been dispatched via ${order.delivery?.courier || 'Express'}. Tracking: ${order.delivery?.trackingNumber || 'Available soon'}. Thank you!`;
  }

  return {
    phone: cleanPhone,
    url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
    message,
  };
}

export async function getBlinkerStatus() {
  if (mongoose.connection.readyState !== 1) {
    return {
      hasNewOrders: false,
      unverifiedProofs: 5,
      unconfirmedCod: 8,
      lastOrderTime: new Date().toISOString(),
    };
  }

  const [lastOrder, unverifiedCount, unconfirmedCount] = await Promise.all([
    Order.findOne().sort({ createdAt: -1 }).select('createdAt').lean(),
    Order.countDocuments({ paymentMethod: 'MANUAL', 'payment.status': 'proof_submitted' }),
    Order.countDocuments({
      paymentMethod: 'COD',
      $or: [{ status: 'placed' }, { status: 'awaiting_confirmation' }],
    }),
  ]);

  return {
    unverifiedProofs: unverifiedCount,
    unconfirmedCod: unconfirmedCount,
    hasActionRequired: unverifiedCount > 0 || unconfirmedCount > 0,
    lastOrderTime: lastOrder?.createdAt || null,
  };
}

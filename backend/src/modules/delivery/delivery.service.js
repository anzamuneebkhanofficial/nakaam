import mongoose from 'mongoose';
import { DeliveryOption } from './deliveryOption.model.js';
import { DeliveryReport } from './deliveryReport.model.js';
import { Order } from '../orders/order.model.js';
import { ApiError } from '../../core/apiError.js';
import { notifyAdmins } from '../notifications/notification.service.js';
import { getOrLoad, invalidateTag } from '../../core/cache/index.js';

export async function getDeliveryOptions(city = null) {
  const cacheKey = `delivery:options:${city || 'all'}`;

  return getOrLoad(
    cacheKey,
    async () => {
      if (mongoose.connection.readyState !== 1) {
        return [
          {
            code: 'express',
            label: 'Express Doorstep Delivery (Next Day)',
            etaDaysMin: 1,
            etaDaysMax: 1,
            fee: 300,
            cities: ['Lahore'],
          },
          {
            code: 'standard',
            label: 'Standard Courier Delivery (3–4 Days)',
            etaDaysMin: 3,
            etaDaysMax: 4,
            fee: 150,
            cities: ['Lahore'],
          },
        ];
      }

      const query = { isActive: true };
      if (city) {
        query.cities = city;
      }
      return DeliveryOption.find(query).sort({ sortOrder: 1, fee: 1 }).lean();
    },
    {
      ttl: 3600000, // 1 hour
      tags: ['delivery'],
    }
  );
}

export async function createDeliveryReport({
  orderIdentifier,
  issueType,
  preferredContactMethod = 'whatsapp',
  contactPhone,
  message,
  userId = null,
}) {
  if (!orderIdentifier) throw ApiError.badRequest('Order identifier is required');
  if (!issueType) throw ApiError.badRequest('Issue type is required');
  if (!contactPhone) throw ApiError.badRequest('Contact phone is required');
  if (!message || message.trim().length < 5) {
    throw ApiError.badRequest('Please provide a message explaining the issue (min 5 characters)');
  }

  const query = mongoose.isValidObjectId(orderIdentifier)
    ? { _id: orderIdentifier }
    : { orderNumber: orderIdentifier };

  const order = await Order.findOne(query).lean();
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  // If logged in, ensure customer belongs to this order or allow admin/guest phone match
  if (userId && order.userId && String(order.userId) !== String(userId)) {
    throw ApiError.forbidden('You are not authorized to submit reports for this order');
  }

  const report = new DeliveryReport({
    orderId: order._id,
    orderNumber: order.orderNumber,
    userId: userId || order.userId || null,
    issueType,
    preferredContactMethod,
    contactPhone: contactPhone.trim(),
    message: message.trim(),
    status: 'pending',
  });

  await report.save();

  notifyAdmins({
    type: 'order',
    title: `Delivery Issue Reported (#${order.orderNumber})`,
    body: `Issue: ${issueType.replace('_', ' ')} - ${message.substring(0, 100)}`,
    link: `/admin/orders/${order.orderNumber}`,
  }).catch(() => {});

  return report.toObject();
}

export async function getOrderDeliveryReports(orderIdentifier, userId = null) {
  const query = mongoose.isValidObjectId(orderIdentifier)
    ? { _id: orderIdentifier }
    : { orderNumber: orderIdentifier };

  const order = await Order.findOne(query).lean();
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (userId && order.userId && String(order.userId) !== String(userId)) {
    throw ApiError.forbidden('Unauthorized access to this order reports');
  }

  const reports = await DeliveryReport.find({ orderId: order._id })
    .sort({ createdAt: -1 })
    .lean();

  return reports;
}

export async function listAdminDeliveryReports({ status = '', page = 1, limit = 20 } = {}) {
  const filter = {};
  if (status) filter.status = status;

  const p = Math.max(1, parseInt(page, 10) || 1);
  const lim = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (p - 1) * lim;

  const [docs, totalDocs] = await Promise.all([
    DeliveryReport.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
    DeliveryReport.countDocuments(filter),
  ]);

  return {
    docs,
    totalDocs,
    limit: lim,
    page: p,
    totalPages: Math.ceil(totalDocs / lim) || 1,
  };
}

export async function updateAdminDeliveryReport(reportId, { status, adminNotes, adminUserId }) {
  const report = await DeliveryReport.findById(reportId);
  if (!report) throw ApiError.notFound('Delivery report not found');

  if (status) {
    report.status = status;
    if (status === 'resolved' || status === 'closed') {
      report.resolvedAt = new Date();
      report.resolvedBy = adminUserId;
    } else {
      report.resolvedAt = null;
      report.resolvedBy = null;
    }
  }
  if (adminNotes !== undefined) {
    report.adminNotes = adminNotes;
  }

  await report.save();
  return report.toObject();
}

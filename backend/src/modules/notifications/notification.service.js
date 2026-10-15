import mongoose from 'mongoose';
import { Notification } from './notification.model.js';
import { getOrLoad, invalidateTag } from '../../core/cache/index.js';
import { TTL } from '../../core/cache/config.js';
import { ApiError } from '../../core/apiError.js';
import { parsePagination, formatPaginated, PAGE_SIZES } from '../../core/pagination.js';

/**
 * Gets user notifications with server-side pagination.
 * Returns a formatPaginated envelope: { items, total, page, limit, totalPages, hasNext, hasPrev }
 */
export async function getNotifications(userId, query = {}) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    const mockItems = [
      {
        _id: 'notif_1',
        type: 'order',
        title: 'Order Placed Successfully',
        body: 'Your order NK-2610-000001 has entered our Master Darzi queue.',
        link: '/account/orders',
        readAt: null,
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'notif_2',
        type: 'darzi',
        title: 'Atelier Tailoring Started',
        body: 'Our master craftsmen are measuring fabric cuts for your kurta.',
        link: '/account/orders',
        readAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
    return formatPaginated(mockItems, mockItems.length, 1, PAGE_SIZES.notifications);
  }

  const { page, limit, skip } = parsePagination(query, PAGE_SIZES.notifications);
  const cacheKey = `notifications:${userId}:p${page}:l${limit}`;

  return getOrLoad(
    cacheKey,
    async () => {
      const [items, total] = await Promise.all([
        Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Notification.countDocuments({ userId }),
      ]);
      return formatPaginated(items, total, page, limit);
    },
    {
      ttl: TTL.NOTIFICATIONS || 5000,
      tags: [`notifications:${userId}`],
    }
  );
}


/**
 * Marks a notification as read
 */
export async function markAsRead(userId, notificationId) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    return { success: true };
  }

  await Notification.updateOne(
    { _id: notificationId, userId },
    { $set: { readAt: new Date() } }
  );

  invalidateTag(`notifications:${userId}`);
  return { success: true };
}

/**
 * Marks all notifications as read for a user
 */
export async function markAllAsRead(userId) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    return { success: true };
  }

  await Notification.updateMany(
    { userId, readAt: null },
    { $set: { readAt: new Date() } }
  );

  invalidateTag(`notifications:${userId}`);
  return { success: true };
}

import { User } from '../users/user.model.js';

/**
 * Creates an in-app notification
 */
export async function createNotification({ userId, type = 'system', title, body, link = null }) {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const notification = await Notification.create({
    userId,
    type,
    title,
    body,
    link,
  });

  invalidateTag(`notifications:${userId}`);
  return notification.toObject();
}

/**
 * Safely creates a notification for a specific user without failing outer operations
 */
export async function notifyUser(userId, { type = 'order', title, body, link = null }) {
  if (!userId) return null;
  try {
    return await createNotification({ userId, type, title, body, link });
  } catch (err) {
    return null;
  }
}

/**
 * Notifies all administrator accounts of high-priority operational events
 */
export async function notifyAdmins({ type = 'order', title, body, link = null }) {
  try {
    if (mongoose.connection.readyState !== 1) return [];
    const admins = await User.find({ role: 'admin' }).select('_id').lean();
    if (!admins || admins.length === 0) return [];

    const results = await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin._id,
          type,
          title,
          body,
          link,
        }).catch(() => null)
      )
    );
    return results.filter(Boolean);
  } catch (err) {
    return [];
  }
}

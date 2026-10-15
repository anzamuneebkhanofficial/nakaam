import mongoose from 'mongoose';
import { env } from './env.js';
import { Cart } from '../modules/cart/cart.model.js';
import { Complaint } from '../modules/complaints/complaint.model.js';
import { DeliveryReport } from '../modules/delivery/deliveryReport.model.js';
import { Notification } from '../modules/notifications/notification.model.js';
import { Order } from '../modules/orders/order.model.js';
import { logger } from '../utils/logger.js';

const dayInSeconds = 24 * 60 * 60;

export async function ensureTtlIndex(
  collection,
  field,
  expireAfterSeconds,
  database = mongoose.connection.db
) {
  let indexes;
  try {
    indexes = await collection.indexes();
  } catch (error) {
    if (error.code !== 26 && error.codeName !== 'NamespaceNotFound') throw error;
    indexes = [];
  }

  const index = indexes.find(
    (candidate) => candidate.key?.[field] === 1 && Object.keys(candidate.key).length === 1
  );
  if (!index) {
    await collection.createIndex(
      { [field]: 1 },
      { expireAfterSeconds, name: `${field}_1` }
    );
    return;
  }

  if (index.expireAfterSeconds !== expireAfterSeconds) {
    await database.command({
      collMod: collection.collectionName,
      index: { keyPattern: { [field]: 1 }, expireAfterSeconds },
    });
  }
}

export async function ensureTtlIndexes() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB must be connected before TTL indexes can be configured');
  }

  const protectedOrderUpdate = await Order.updateMany(
    {
      expiresAt: { $type: 'date' },
      $or: [
        { 'payment.status': { $in: ['proof_submitted', 'verified', 'rejected'] } },
        { 'payment.proof.imageUrl': { $type: 'string' } },
        { 'payment.proof.publicId': { $type: 'string' } },
        { 'payment.proof.txnRef': { $type: 'string' } },
      ],
    },
    { $set: { expiresAt: null } }
  );
  if (protectedOrderUpdate.modifiedCount > 0) {
    logger.info('Cleared expiry dates from orders with submitted payment proofs', {
      count: protectedOrderUpdate.modifiedCount,
    });
  }

  const rateLimitCollection = mongoose.connection.db.collection('rateLimit');
  await rateLimitCollection.updateMany(
    {
      expiresAt: { $exists: false },
      lastRequest: { $type: 'number' },
    },
    [
      {
        $set: {
          expiresAt: {
            $add: [
              { $toDate: '$lastRequest' },
              env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
            ],
          },
        },
      },
    ]
  );

  const indexes = [
    [Cart.collection, 'updatedAt', env.ABANDONED_CART_RETENTION_DAYS * dayInSeconds],
    [Notification.collection, 'createdAt', env.NOTIFICATION_RETENTION_DAYS * dayInSeconds],
    [Order.collection, 'expiresAt', 0],
    [
      DeliveryReport.collection,
      'resolvedAt',
      env.RESOLVED_DELIVERY_REPORTS_RETENTION_DAYS * dayInSeconds,
    ],
    [
      Complaint.collection,
      'closedAt',
      env.CLOSED_COMPLAINTS_RETENTION_DAYS * dayInSeconds,
    ],
    [mongoose.connection.db.collection('verification'), 'expiresAt', 0],
    [mongoose.connection.db.collection('session'), 'expiresAt', 0],
    [rateLimitCollection, 'expiresAt', 0],
  ];

  for (const [collection, field, expireAfterSeconds] of indexes) {
    await ensureTtlIndex(collection, field, expireAfterSeconds, mongoose.connection.db);
  }

  logger.info('MongoDB TTL indexes are configured from retention environment settings');
}

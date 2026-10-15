import mongoose from 'mongoose';
import { User } from '../users/user.model.js';
import { Order } from '../orders/order.model.js';
import { UserProfile } from '../users/profile.model.js';
import { ApiError } from '../../core/apiError.js';

export async function listAdminUsers({
  q = '',
  role = '',
  isBlocked = '',
  page = 1,
  limit = 20,
} = {}) {
  if (mongoose.connection.readyState !== 1) {
    return {
      docs: [],
      totalDocs: 0,
      limit,
      page,
      totalPages: 1,
    };
  }

  const filter = {};
  if (q.trim()) {
    const regex = new RegExp(q.trim(), 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }
  if (role) filter.role = role;
  if (isBlocked !== '') filter.isBlocked = isBlocked === 'true';

  const p = Math.max(1, parseInt(page, 10) || 1);
  const lim = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (p - 1) * lim;

  const [users, totalDocs] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
    User.countDocuments(filter),
  ]);

  // Aggregate user statistics
  const decoratedUsers = await Promise.all(
    users.map(async (u) => {
      const [orderStats, refusalCount] = await Promise.all([
        Order.aggregate([
          { $match: { userId: u._id, status: { $ne: 'cancelled' } } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalSpend: { $sum: '$pricing.total' },
            },
          },
        ]),
        Order.countDocuments({ userId: u._id, status: 'failed_delivery' }),
      ]);

      const stat = orderStats[0] || { totalOrders: 0, totalSpend: 0 };
      let riskLevel = 'LOW';
      if (refusalCount >= 3) {
        riskLevel = 'HIGH';
      } else if (refusalCount >= 1) {
        riskLevel = 'MEDIUM';
      }

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        isBlocked: !!u.isBlocked,
        totalOrders: stat.totalOrders,
        totalSpendPKR: Math.round(stat.totalSpend),
        codRefusals: refusalCount,
        riskLevel,
        createdAt: u.createdAt,
      };
    })
  );

  return {
    docs: decoratedUsers,
    totalDocs,
    limit: lim,
    page: p,
    totalPages: Math.ceil(totalDocs / lim) || 1,
  };
}

export async function getAdminUserById(id) {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const [user, profile, recentOrders] = await Promise.all([
    User.findById(id).lean(),
    UserProfile.findOne({ userId: id }).lean(),
    Order.find({ userId: id }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return {
    ...user,
    profile,
    recentOrders,
  };
}

export async function toggleUserBlock(id, { isBlocked, reason = '' }) {
  if (mongoose.connection.readyState !== 1) {
    return { _id: id, isBlocked, reason };
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: { isBlocked: !!isBlocked, blockReason: reason || null } },
    { returnDocument: 'after' }
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
}

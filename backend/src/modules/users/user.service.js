import mongoose from 'mongoose';
import { User } from './user.model.js';
import { ApiError } from '../../core/apiError.js';

export async function findById(id) {
  if (!id) return null;
  if (mongoose.connection.readyState !== 1) return null;
  return User.findById(id).lean();
}

export async function findByEmail(email) {
  if (!email) return null;
  if (mongoose.connection.readyState !== 1) return null;
  return User.findOne({ email: email.toLowerCase().trim() }).lean();
}

export async function updateUser(id, data) {
  if (!id) throw ApiError.badRequest('User ID is required');

  const allowedUpdates = {};
  if (data.name !== undefined) allowedUpdates.name = data.name.trim();
  if (data.phone !== undefined) allowedUpdates.phone = data.phone.trim();
  if (data.city !== undefined) allowedUpdates.city = data.city.trim();
  if (data.image !== undefined) allowedUpdates.image = data.image.trim();

  const updated = await User.findByIdAndUpdate(
    id,
    { $set: allowedUpdates },
    { returnDocument: 'after' }
  ).lean();

  if (!updated) {
    throw ApiError.notFound('User not found');
  }

  return updated;
}

export async function setUserRisk(id, { isBlocked, riskNote }) {
  if (!id) throw ApiError.badRequest('User ID is required');

  const update = { isBlocked: Boolean(isBlocked) };
  if (riskNote !== undefined) update.riskNote = riskNote.trim();

  const user = await User.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after' }
  ).lean();

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
}

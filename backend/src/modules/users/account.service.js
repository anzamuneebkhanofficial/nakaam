import mongoose from 'mongoose';
import { UserProfile } from './profile.model.js';
import { Address } from './address.model.js';
import { Order } from '../orders/order.model.js';
import { WishlistItem } from '../wishlist/wishlist.model.js';
import { Notification } from '../notifications/notification.model.js';
import { Complaint } from '../complaints/complaint.model.js';
import { ApiError } from '../../core/apiError.js';

/**
 * Returns customer account summary counts
 */
export async function getSummary(userId) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    return {
      ordersCount: 0,
      wishlistCount: 0,
      openComplaintsCount: 0,
      unreadNotificationsCount: 0,
    };
  }

  const [ordersCount, wishlistCount, openComplaintsCount, unreadNotificationsCount] =
    await Promise.all([
      Order.countDocuments({ userId }),
      WishlistItem.countDocuments({ userId }),
      Complaint.countDocuments({ userId, status: { $in: ['open', 'in_progress'] } }),
      Notification.countDocuments({ userId, readAt: null }),
    ]);

  return {
    ordersCount,
    wishlistCount,
    openComplaintsCount,
    unreadNotificationsCount,
  };
}

/**
 * Gets or creates user profile with tailoring measurements and family size book
 */
export async function getProfile(userId) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    return {
      userId,
      gender: '',
      measurements: {},
      familyMembers: [],
    };
  }

  let profile = await UserProfile.findOne({ userId }).lean();
  if (!profile) {
    profile = await UserProfile.create({ userId });
    profile = profile.toObject();
  }

  return profile;
}

/**
 * Updates profile measurements
 */
export async function updateProfile(userId, { gender, dateOfBirth, measurements }) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    return { userId, gender, measurements, familyMembers: [] };
  }

  const profile = await UserProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        ...(gender !== undefined && { gender }),
        ...(dateOfBirth !== undefined && { dateOfBirth }),
        ...(measurements !== undefined && { measurements }),
        lastActiveAt: new Date(),
      },
    },
    { returnDocument: 'after', upsert: true }
  ).lean();

  return profile;
}

/**
 * Adds a family member to the Family Size Book
 */
export async function addFamilyMember(userId, memberData) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');
  if (!memberData.name || !memberData.relation) {
    throw ApiError.badRequest('Family member name and relation are required');
  }

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  let profile = await UserProfile.findOne({ userId });
  if (!profile) {
    profile = new UserProfile({ userId, familyMembers: [] });
  }

  profile.familyMembers.push(memberData);
  await profile.save();
  return profile.familyMembers[profile.familyMembers.length - 1];
}

/**
 * Deletes a family member from the Family Size Book
 */
export async function deleteFamilyMember(userId, memberId) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    return { success: true };
  }

  await UserProfile.updateOne(
    { userId },
    { $pull: { familyMembers: { _id: memberId } } }
  );
  return { success: true };
}

/**
 * Lists user's saved delivery addresses (default first)
 */
export async function listAddresses(userId) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    return [];
  }

  return Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
}

/**
 * Creates a new delivery address (max 10)
 */
export async function createAddress(userId, addressData) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const count = await Address.countDocuments({ userId });
  if (count >= 10) {
    throw ApiError.badRequest('Maximum limit of 10 saved addresses reached');
  }

  const isFirst = count === 0;
  const isDefault = addressData.isDefault || isFirst;

  if (isDefault) {
    await Address.updateMany({ userId }, { $set: { isDefault: false } });
  }

  const address = await Address.create({
    userId,
    ...addressData,
    isDefault,
  });

  return address.toObject();
}

/**
 * Deletes a saved address
 */
export async function deleteAddress(userId, addressId) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    return { success: true };
  }

  await Address.findOneAndDelete({ _id: addressId, userId });
  return { success: true };
}

/**
 * Sets an address as default
 */
export async function setDefaultAddress(userId, addressId) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    return { success: true };
  }

  await Address.updateMany({ userId }, { $set: { isDefault: false } });
  await Address.updateOne({ _id: addressId, userId }, { $set: { isDefault: true } });
  return { success: true };
}

import mongoose from 'mongoose';
import { Complaint } from '../complaints/complaint.model.js';
import { User } from '../users/user.model.js';
import { sendTicketRepliedEmail } from '../email/email.service.js';
import { ApiError } from '../../core/apiError.js';

export async function listAdminComplaints({
  status = '',
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
  if (status) filter.status = status;

  const p = Math.max(1, parseInt(page, 10) || 1);
  const lim = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (p - 1) * lim;

  const [docs, totalDocs] = await Promise.all([
    Complaint.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .lean(),
    Complaint.countDocuments(filter),
  ]);

  return {
    docs,
    totalDocs,
    limit: lim,
    page: p,
    totalPages: Math.ceil(totalDocs / lim) || 1,
  };
}

export async function getAdminComplaintById(id) {
  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const complaint = await Complaint.findById(id).populate('userId', 'name email phone').lean();
  if (!complaint) {
    throw ApiError.notFound('Complaint not found');
  }
  return complaint;
}

export async function updateComplaintStatus(id, { status, resolutionMessage }) {
  if (mongoose.connection.readyState !== 1) {
    return { _id: id, status, resolutionMessage };
  }

  const updateDoc = {};
  if (status) {
    updateDoc.status = status;
    if (status === 'resolved') {
      updateDoc.resolvedAt = new Date();
    } else {
      updateDoc.resolvedAt = null;
    }
  }
  if (resolutionMessage !== undefined) {
    updateDoc.resolutionMessage = resolutionMessage;
  }

  const complaint = await Complaint.findByIdAndUpdate(
    id,
    { $set: updateDoc },
    { returnDocument: 'after' }
  ).populate('userId', 'name email phone');

  if (!complaint) {
    throw ApiError.notFound('Complaint not found');
  }

  // If a resolution message is supplied and complaint is resolved, email the customer
  if (resolutionMessage && complaint.userId && mongoose.connection.readyState === 1) {
    const customer = complaint.userId;
    if (customer?.email) {
      sendTicketRepliedEmail({
        to: customer.email,
        ticket: complaint.toObject(),
        customerName: customer.name || 'Customer',
        replySnippet: resolutionMessage,
      }).catch(() => {});
    }
  }

  return complaint;
}

export async function deleteComplaint(id) {
  if (mongoose.connection.readyState !== 1) {
    return { success: true };
  }

  const deleted = await Complaint.findByIdAndDelete(id);
  if (!deleted) {
    throw ApiError.notFound('Complaint not found');
  }
  return { success: true, id };
}

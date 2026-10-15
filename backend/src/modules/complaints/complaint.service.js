import mongoose from 'mongoose';
import { Complaint } from './complaint.model.js';
import { parsePagination, formatPaginated } from '../../core/pagination.js';
import { ApiError } from '../../core/apiError.js';

export async function createTicket(userId, { subject, message, whatsappNumber }) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');
  if (!subject?.trim() || !message?.trim()) {
    throw ApiError.badRequest('Subject and complaint message are required');
  }

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  // Prevent multiple active complaints per user
  const existingActive = await Complaint.findOne({
    userId,
    status: { $in: ['pending', 'in_progress'] },
  }).lean();

  if (existingActive) {
    throw ApiError.badRequest(
      'You already have a complaint in progress. Please wait until your current complaint is resolved before submitting a new one.'
    );
  }

  const complaint = await Complaint.create({
    userId,
    subject: subject.trim(),
    message: message.trim(),
    whatsappNumber: whatsappNumber?.trim() || null,
    status: 'pending',
  });

  return complaint.toObject();
}

export async function listTickets(userId, query = {}) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    return formatPaginated([], 0, 1, 10);
  }

  const { page, limit, skip } = parsePagination(query);
  const filter = { userId };
  if (query.status && query.status !== 'All') {
    filter.status = query.status.toLowerCase();
  }

  const [items, total] = await Promise.all([
    Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Complaint.countDocuments(filter),
  ]);

  return formatPaginated(items, total, page, limit);
}

export async function getTicketById(userId, complaintId) {
  if (!userId) throw ApiError.unauthorized('User not authenticated');

  if (mongoose.connection.readyState !== 1) {
    throw ApiError.serviceUnavailable('Database connection offline');
  }

  const complaint = await Complaint.findOne({ _id: complaintId, userId }).lean();
  if (!complaint) throw ApiError.notFound('Complaint not found');
  return complaint;
}

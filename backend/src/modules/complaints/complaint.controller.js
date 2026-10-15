import { respond, respondCreated } from '../../core/respond.js';
import { ApiError } from '../../core/apiError.js';
import * as complaintService from './complaint.service.js';

function getUserId(req) {
  const userId = req.user?.oid || req.user?.id || req.user?._id;
  if (!userId) throw ApiError.unauthorized('Authentication required');
  return userId;
}

export async function listComplaints(req, res) {
  const userId = getUserId(req);
  const result = await complaintService.listTickets(userId, req.query);
  return respond(res, result.items, {
    totalDocs: result.total,
    limit: result.limit,
    page: result.page,
    totalPages: result.totalPages,
    hasNext: result.hasNext,
    hasPrev: result.hasPrev,
  });
}

export async function createComplaint(req, res) {
  const userId = getUserId(req);
  const complaint = await complaintService.createTicket(userId, req.body);
  return respondCreated(res, complaint);
}

export async function getComplaint(req, res) {
  const userId = getUserId(req);
  const { id } = req.params;
  const complaint = await complaintService.getTicketById(userId, id);
  return respond(res, complaint);
}

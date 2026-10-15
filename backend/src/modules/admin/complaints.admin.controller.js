import { respond } from '../../core/respond.js';
import * as complaintsAdminService from './complaints.admin.service.js';

export async function listComplaints(req, res) {
  const result = await complaintsAdminService.listAdminComplaints(req.query);
  return respond(res, result.docs, {
    totalDocs: result.totalDocs,
    limit: result.limit,
    page: result.page,
    totalPages: result.totalPages,
  });
}

export async function getComplaint(req, res) {
  const complaint = await complaintsAdminService.getAdminComplaintById(req.params.id);
  return respond(res, complaint);
}

export async function updateStatus(req, res) {
  const updated = await complaintsAdminService.updateComplaintStatus(req.params.id, req.body);
  return respond(res, updated);
}

export async function deleteComplaint(req, res) {
  const result = await complaintsAdminService.deleteComplaint(req.params.id);
  return respond(res, result);
}

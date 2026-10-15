'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/shared/Pagination';
import {
  Phone,
  Trash2,
  ExternalLink,
  X,
  User,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminComplaintsContent() {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [resolutionMessage, setResolutionMessage] = useState('');
  const [targetStatus, setTargetStatus] = useState('in_progress');

  // Fetch Complaints with 5-second polling for live status synchronization
  const { data: response, isLoading } = useQuery({
    queryKey: ['admin', 'complaints', { statusFilter, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('limit', '20');
      return await apiClient(`/admin/complaints?${params.toString()}`);
    },
    refetchInterval: 5000,
  });

  const complaints = Array.isArray(response) ? response : (response?.data || response?.docs || []);
  const meta = response?.meta || { page, totalPages: 1, totalDocs: complaints.length };

  // Status & Resolution Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ complaintId, status, message }) => {
      return await apiClient(`/admin/complaints/${complaintId}/status`, {
        method: 'PATCH',
        body: { status, resolutionMessage: message },
      });
    },
    onSuccess: () => {
      toast.success('Complaint status updated');
      queryClient.invalidateQueries(['admin', 'complaints']);
      setActiveComplaint(null);
      setResolutionMessage('');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update status');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (complaintId) => {
      return await apiClient(`/admin/complaints/${complaintId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast.success('Complaint deleted from database');
      queryClient.invalidateQueries(['admin', 'complaints']);
      if (activeComplaint) setActiveComplaint(null);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete complaint');
    },
  });

  const openModal = (complaint) => {
    setActiveComplaint(complaint);
    setTargetStatus(complaint.status === 'resolved' ? 'resolved' : 'in_progress');
    setResolutionMessage(complaint.resolutionMessage || '');
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!activeComplaint) return;

    if (targetStatus === 'resolved' && !resolutionMessage.trim()) {
      toast.error('Please enter a resolution message for the customer');
      return;
    }

    statusMutation.mutate({
      complaintId: activeComplaint._id,
      status: targetStatus,
      message: resolutionMessage.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#151515]">
            Customer Support & Complaints
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            View customer complaints, contact them via WhatsApp, and submit resolutions.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {['', 'pending', 'in_progress', 'resolved'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[#151515] text-white shadow-xs'
                  : 'bg-white border border-[#E6E1DA] text-[#6B6B6B] hover:text-[#151515]'
              }`}
            >
              {st ? st.replace('_', ' ').toUpperCase() : 'ALL COMPLAINTS'}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-[#F6F2EC] border-b border-[#E6E1DA] font-bold text-[#151515]">
              <tr>
                <th className="py-3 px-4">Customer Name & Contact</th>
                <th className="py-3 px-4">Subject & Description</th>
                <th className="py-3 px-4">WhatsApp Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1DA] text-[#6B6B6B]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#6B6B6B]">
                    Loading complaints...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#6B6B6B]">
                    No customer complaints found.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => {
                  const customer = c.userId || {};
                  const isResolved = c.status === 'resolved';
                  const isInProgress = c.status === 'in_progress';
                  const whatsappClean = c.whatsappNumber
                    ? c.whatsappNumber.replace(/[^0-9]/g, '')
                    : null;

                  return (
                    <tr key={c._id} className="hover:bg-[#F6F2EC]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#151515]">{customer.name || 'Registered Customer'}</p>
                        <p className="text-[11px] text-[#6B6B6B]">{customer.email || '—'}</p>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-[#151515] line-clamp-1">{c.subject}</p>
                        <p className="text-[11px] text-[#6B6B6B] line-clamp-1 mt-0.5">{c.message}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        {c.whatsappNumber ? (
                          <a
                            href={`https://wa.me/${whatsappClean}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{c.whatsappNumber}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-[#A09D98] italic">Not provided</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isResolved
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isInProgress
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isResolved ? 'Resolved' : isInProgress ? 'In Progress' : 'Pending'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openModal(c)}
                            className="text-xs font-semibold"
                          >
                            View &amp; Resolve
                          </Button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Permanently delete this complaint?`)) {
                                deleteMutation.mutate(c._id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#D12C2F] hover:bg-[#FCEEEE]"
                            title="Delete complaint"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={meta.page || page}
          totalPages={meta.totalPages || 1}
          totalItems={meta.totalDocs || complaints.length}
          pageSize={20}
          onPageChange={(p) => setPage(p)}
          variant="compact"
        />
      </div>

      {/* View & Resolve Modal */}
      {activeComplaint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#151515]">
                  {activeComplaint.subject}
                </h3>
                <p className="text-xs text-[#6B6B6B]">
                  From: {activeComplaint.userId?.name || 'Customer'} ({activeComplaint.userId?.email || '—'})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveComplaint(null)}
                className="p-1.5 rounded-full hover:bg-[#F6F2EC]"
              >
                <X className="w-5 h-5 text-[#6B6B6B]" />
              </button>
            </div>

            {/* Problem Details */}
            <div className="space-y-3 bg-[#FBF9F5] p-4 rounded-2xl border border-[#E6E1DA] text-xs">
              {activeComplaint.whatsappNumber && (
                <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]/60">
                  <span className="font-semibold text-[#151515]">WhatsApp Contact:</span>
                  <a
                    href={`https://wa.me/${activeComplaint.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 hover:bg-emerald-100"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Chat on WhatsApp ({activeComplaint.whatsappNumber})</span>
                  </a>
                </div>
              )}

              <div>
                <p className="text-[11px] font-bold text-[#6B6B6B] mb-1">Customer Problem Description:</p>
                <div className="p-3 bg-white rounded-xl border border-[#E6E1DA] leading-relaxed whitespace-pre-line text-[#151515]">
                  {activeComplaint.message}
                </div>
              </div>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#151515]">Complaint Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetStatus('pending')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      targetStatus === 'pending'
                        ? 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-400'
                        : 'bg-[#F6F2EC] text-[#6B6B6B] border-[#E6E1DA]'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetStatus('in_progress')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      targetStatus === 'in_progress'
                        ? 'bg-blue-100 text-blue-900 border-blue-300 ring-1 ring-blue-400'
                        : 'bg-[#F6F2EC] text-[#6B6B6B] border-[#E6E1DA]'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetStatus('resolved')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      targetStatus === 'resolved'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-[#F6F2EC] text-[#6B6B6B] border-[#E6E1DA]'
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              {/* Resolution Message */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#151515]">
                    Resolution Message {targetStatus === 'resolved' && <span className="text-red-600">*</span>}
                  </label>
                  <span className="text-[10px] text-[#6B6B6B]">
                    Delivered to user
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={resolutionMessage}
                  onChange={(e) => setResolutionMessage(e.target.value)}
                  placeholder={
                    targetStatus === 'resolved'
                      ? 'e.g. Your problem has been resolved. We have completed your request. Thank you for shopping with Nakaam.'
                      : 'Optional progress note...'
                  }
                  className="w-full p-3 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-xs text-[#151515] focus:outline-none focus:ring-1 focus:ring-[#151515] leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Permanently delete this complaint?`)) {
                      deleteMutation.mutate(activeComplaint._id);
                    }
                  }}
                  className="text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveComplaint(null)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={statusMutation.isPending}
                    className="bg-[#151515] text-white text-xs font-bold"
                  >
                    Save Status &amp; Response
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/shared/Pagination';
import {
  Sparkles,
  Star,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Eye,
  X,
  AlertCircle,
  Filter,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminReviewsContent() {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [rejectDialog, setRejectDialog] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch Reviews
  const { data: response, isLoading } = useQuery({
    queryKey: ['admin', 'reviews', { statusFilter, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('limit', '20');
      return await apiClient(`/admin/reviews?${params.toString()}`);
    },
  });

  const reviews = Array.isArray(response) ? response : (response?.data?.docs || response?.docs || response?.data || []);
  const totalPages = response?.meta?.totalPages || response?.pagination?.totalPages || response?.totalPages || 1;
  const totalDocs = response?.meta?.totalDocs || response?.pagination?.totalDocs || response?.totalDocs || reviews.length;

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async (id) => {
      return await apiClient(`/admin/reviews/${id}/approve`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast.success('Review verified and published to storefront');
      queryClient.invalidateQueries(['admin', 'reviews']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to approve review');
    },
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      return await apiClient(`/admin/reviews/${id}/reject`, {
        method: 'POST',
        body: { reason },
      });
    },
    onSuccess: () => {
      toast.success('Review rejected and removed from moderation queue');
      setRejectDialog(null);
      setRejectReason('');
      queryClient.invalidateQueries(['admin', 'reviews']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to reject review');
    },
  });

  // Delete Review Mutation (for inappropriate or abusive content)
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await apiClient(`/admin/reviews/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast.success('Review removed from store');
      setRejectDialog(null);
      queryClient.invalidateQueries(['admin', 'reviews']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete review');
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#151515]">
            Customer Reviews
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Approve or reject customer reviews and product ratings.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E6E1DA] rounded-2xl shadow-2xs">
          {[
            { id: 'pending', label: 'Pending Review' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
            { id: '', label: 'All Reviews' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#151515] text-white shadow-xs'
                  : 'text-[#6B6B6B] hover:text-[#151515]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Stream / Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-12 text-center text-xs text-[#6B6B6B]">
            Loading UGC moderation stream...
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-12 text-center text-xs text-[#6B6B6B] space-y-2">
            <Sparkles className="w-8 h-8 text-[#E6E1DA] mx-auto" />
            <p className="font-semibold text-[#151515]">No reviews in this queue.</p>
            <p className="text-[11px]">
              {statusFilter === 'pending'
                ? 'All customer feedback and photos have been processed.'
                : 'No submissions found under this filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {reviews.map((rev) => {
              const isPending = rev.status === 'pending';
              const isApproved = rev.status === 'approved';
              const isRejected = rev.status === 'rejected';

              return (
                <div
                  key={rev._id || rev.id}
                  className="bg-white border border-[#E6E1DA] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 hover:border-[#151515]/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#E6E1DA]/60">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#151515]">{rev.customerName || 'Anonymous Customer'}</span>
                        {rev.isVerifiedBuyer && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            Verified Buyer
                          </span>
                        )}
                        <span className="text-[11px] text-[#6B6B6B]">&bull;</span>
                        <span className="text-[11px] text-[#6B6B6B]">
                          {new Date(rev.createdAt || Date.now()).toLocaleDateString('en-PK', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Product Title / Link */}
                      {rev.product && (
                        <p className="text-xs text-[#6B6B6B]">
                          Product:{' '}
                          <span className="font-semibold text-[#151515]">{rev.product.name}</span>
                          {rev.product.sku && (
                            <span className="font-mono text-[11px] ml-1.5 text-[#D12C2F]">
                              ({rev.product.sku})
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-800'
                            : isRejected
                            ? 'bg-[#FCEEEE] text-[#8F1A1E]'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {rev.status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Rating & Timestamp */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= (rev.rating || 5)
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-[#E6E1DA]'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-[#151515] ml-1">{rev.rating || 5}/5</span>
                    </div>
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs leading-relaxed text-[#151515] bg-[#F6F2EC]/40 p-3.5 rounded-xl border border-[#E6E1DA]/50">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {/* UGC Photos Grid */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        Customer Photo Submissions ({rev.images.length})
                      </span>
                      <div className="flex flex-wrap gap-2.5">
                        {rev.images.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedPhoto(img)}
                            className="relative w-16 h-20 rounded-xl overflow-hidden border border-[#E6E1DA] hover:border-[#151515] transition-all group shrink-0"
                          >
                            <img
                              src={img}
                              alt={`Customer submission ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Moderation Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E6E1DA]/60">
                    <span className="text-[11px] text-[#6B6B6B]">
                      {rev.moderatedAt && (
                        <span>
                          Moderated on{' '}
                          {new Date(rev.moderatedAt).toLocaleDateString('en-PK')}
                        </span>
                      )}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this review?')) {
                            deleteMutation.mutate(rev._id || rev.id);
                          }
                        }}
                        className="text-xs text-[#8F1A1E] bg-[#FCEEEE] border-[#E6E1DA] hover:bg-[#F8D7D7] flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Delete Review</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalDocs}
          pageSize={20}
          onPageChange={(p) => setPage(p)}
          variant="compact"
        />
      </div>

      {/* Full Photo Preview Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl max-h-[85vh] bg-white rounded-3xl overflow-hidden p-2 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={selectedPhoto}
              alt="Customer submission high-resolution preview"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* Reject Reason Confirmation Modal */}
      {rejectDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
              <div className="flex items-center gap-2 text-[#D12C2F]">
                <XCircle className="w-5 h-5 text-[#D12C2F]" />
                <h3 className="font-serif text-lg font-bold text-[#151515]">
                  Reject Customer Review
                </h3>
              </div>
              <button type="button" onClick={() => setRejectDialog(null)}>
                <X className="w-5 h-5 text-[#6B6B6B]" />
              </button>
            </div>

            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Rejecting this submission removes it from public catalog syndication. Please state the reason for internal audit logs.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#151515]">
                Rejection Reason
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Inappropriate photo, promotional spam, irrelevant commentary"
                className="w-full p-3 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-xs text-[#151515] focus:outline-none focus:border-[#151515]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRejectDialog(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleRejectConfirm}
                disabled={rejectMutation.isPending}
                size="sm"
                className="text-xs text-white bg-[#BA1A1A] hover:bg-[#93000A]"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

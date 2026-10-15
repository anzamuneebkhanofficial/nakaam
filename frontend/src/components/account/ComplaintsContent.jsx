'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle2,
  Phone,
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export function ComplaintsContent() {
  const [expandedId, setExpandedId] = useState(null);

  // Poll complaints every 5 seconds for live status synchronization
  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      try {
        const res = await apiClient('/complaints');
        return Array.isArray(res) ? res : (res?.data || res?.items || []);
      } catch {
        return [];
      }
    },
    refetchInterval: 5000,
  });

  // Check if user has an active unresolved complaint
  const hasActiveComplaint = complaints.some(
    (c) => c.status === 'pending' || c.status === 'in_progress'
  );

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E1DA] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E1DA]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F2EC] text-[#151515] text-[11px] font-bold tracking-wide uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Customer Care &amp; Assistance</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#151515]">
              Support &amp; Inquiries
            </h1>
            <p className="text-xs text-[#6B6B6B] mt-1">
              Track your submitted questions, delivery inquiries, and verified support resolutions.
            </p>
          </div>

          <div>
            {!hasActiveComplaint ? (
              <Button
                variant="primary"
                size="sm"
                className="font-bold h-11 px-5 text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-2"
                asChild
              >
                <Link href="/user/complaints/new">
                  <Plus className="w-4 h-4" />
                  <span>Submit New Inquiry</span>
                </Link>
              </Button>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Inquiry in progress</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#151515] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#6B6B6B]">Syncing your support inquiries...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#F6F2EC] flex items-center justify-center mx-auto text-[#151515]">
              <MessageSquare className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#151515]">No inquiries found</h3>
              <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                Need help with an order, fabric care advice, or size guidance? Submit a direct inquiry and our dedicated team will assist you.
              </p>
            </div>
            <Button variant="primary" size="sm" className="font-bold text-xs h-10 px-6" asChild>
              <Link href="/user/complaints/new">Start An Inquiry</Link>
            </Button>
          </div>
        ) : (
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-[#6B6B6B] px-1 font-medium">
              <span>All Inquiries ({complaints.length})</span>
              <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Status Updates
              </span>
            </div>

            {/* Inquiries Stream */}
            <div className="space-y-4">
              {complaints.map((c, idx) => {
                const isResolved = c.status === 'resolved';
                const isInProgress = c.status === 'in_progress';
                const isPending = c.status === 'pending';
                // First card open by default, or the one clicked
                const isExpanded = expandedId === c._id || (expandedId === null && idx === 0);

                return (
                  <div
                    key={c._id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white ${
                      isExpanded
                        ? 'border-[#151515] shadow-sm'
                        : 'border-[#E6E1DA] hover:border-[#CDC7BE] hover:shadow-2xs'
                    }`}
                  >
                    {/* Collapsible Card Header */}
                    <div
                      onClick={() => toggleExpand(c._id)}
                      className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none bg-white hover:bg-[#FBF9F5]/60 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                            isResolved
                              ? 'bg-emerald-50 text-emerald-700'
                              : isInProgress
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {isResolved ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : isInProgress ? (
                            <Clock className="w-5 h-5" />
                          ) : (
                            <HelpCircle className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-serif text-base font-bold text-[#151515] truncate">
                            {c.subject}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6B6B6B] mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#A09D98]" />
                              {new Date(c.createdAt).toLocaleDateString('en-PK', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            {c.whatsappNumber && (
                              <>
                                <span>&bull;</span>
                                <span className="text-emerald-800 font-medium flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  {c.whatsappNumber}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Status Pill */}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            isResolved
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isInProgress
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isResolved ? 'Resolved' : isInProgress ? 'In Progress' : 'Pending'}
                        </span>

                        <div className="text-[#6B6B6B]">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail Body */}
                    {isExpanded && (
                      <div className="px-5 pb-6 pt-2 border-t border-[#E6E1DA]/60 space-y-5 bg-[#FAF8F5]/40 animate-in fade-in duration-150">
                        {/* 3-Step Progress Timeline */}
                        <div className="py-3 px-4 rounded-2xl bg-white border border-[#E6E1DA] shadow-2xs">
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            {/* Step 1: Pending */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-center">
                                <span className="w-6 h-6 rounded-full bg-[#151515] text-white flex items-center justify-center text-[11px] font-bold">
                                  1
                                </span>
                              </div>
                              <p className="font-bold text-[#151515] text-[11px]">Submitted</p>
                              <p className="text-[10px] text-[#6B6B6B]">Inquiry logged</p>
                            </div>

                            {/* Step 2: In Progress */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-center">
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                    isInProgress || isResolved
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-[#E6E1DA] text-[#6B6B6B]'
                                  }`}
                                >
                                  2
                                </span>
                              </div>
                              <p
                                className={`text-[11px] font-bold ${
                                  isInProgress || isResolved ? 'text-blue-900' : 'text-[#6B6B6B]'
                                }`}
                              >
                                In Progress
                              </p>
                              <p className="text-[10px] text-[#6B6B6B]">Under review</p>
                            </div>

                            {/* Step 3: Resolved */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-center">
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                    isResolved
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-[#E6E1DA] text-[#6B6B6B]'
                                  }`}
                                >
                                  3
                                </span>
                              </div>
                              <p
                                className={`text-[11px] font-bold ${
                                  isResolved ? 'text-emerald-900' : 'text-[#6B6B6B]'
                                }`}
                              >
                                Resolved
                              </p>
                              <p className="text-[10px] text-[#6B6B6B]">Resolution delivered</p>
                            </div>
                          </div>
                        </div>

                        {/* Customer Problem Description Card */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] block">
                            Your Inquiry Description
                          </span>
                          <div className="p-4 rounded-2xl bg-white border border-[#E6E1DA] text-xs text-[#151515] leading-relaxed whitespace-pre-line shadow-2xs">
                            {c.message}
                          </div>
                        </div>

                        {/* Official Support Resolution Banner */}
                        {isResolved ? (
                          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] border border-[#BBF7D0] space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Official Support Resolution</span>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                Completed
                              </span>
                            </div>
                            <p className="text-xs text-emerald-900 leading-relaxed font-medium whitespace-pre-line pl-6">
                              {c.resolutionMessage ||
                                'Your problem has been reviewed and resolved. Thank you for shopping with Nakaam.'}
                            </p>
                            <p className="text-[10px] text-emerald-800/70 pt-1 pl-6">
                              This inquiry is concluded. It will automatically archive after 7 days.
                            </p>
                          </div>
                        ) : isInProgress ? (
                          <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-1 text-xs">
                            <div className="flex items-center gap-2 text-blue-900 font-bold">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span>Support Team Is Working On It</span>
                            </div>
                            <p className="text-blue-800 leading-relaxed pl-6 text-[11px]">
                              Our staff is currently reviewing your inquiry. We may reach out directly on WhatsApp ({c.whatsappNumber || 'provided contact'}) or update here once completed.
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] space-y-1 text-xs">
                            <div className="flex items-center gap-2 text-amber-900 font-bold">
                              <Clock className="w-4 h-4 text-amber-600" />
                              <span>Pending Review</span>
                            </div>
                            <p className="text-amber-800 leading-relaxed pl-6 text-[11px]">
                              Your inquiry is queued. An agent will move it to In Progress shortly.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

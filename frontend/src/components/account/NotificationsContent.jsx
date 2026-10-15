'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/shared/Pagination';
import {
  Bell,
  Package,
  Truck,
  Sparkles,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export function NotificationsContent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Fast Polling Query (5 seconds interval)
  const { data: response, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: async () => {
      try {
        return await apiClient(`/me/notifications?page=${page}&limit=20`);
      } catch {
        return { data: [], meta: { page: 1, totalPages: 1, total: 0 } };
      }
    },
    refetchInterval: 5000, // 5s fast polling per PROJECT.md 4.8
    refetchIntervalInBackground: false,
    staleTime: 5000,
  });

  const notifications = Array.isArray(response) ? response : (response?.data || response?.items || []);
  const meta = response?.meta || { page, totalPages: 1, total: notifications.length };

  const markAllMutation = useMutation({
    mutationFn: async () => {
      return await apiClient('/me/notifications/read-all', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All alerts marked as read');
    },
  });

  const markOneMutation = useMutation({
    mutationFn: async (id) => {
      return await apiClient(`/me/notifications/${id}/read`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5 text-[#151515]" />;
      case 'dispatched':
        return <Truck className="w-5 h-5 text-emerald-700" />;
      case 'darzi':
        return <Sparkles className="w-5 h-5 text-[#8F1A1E]" />;
      default:
        return <Bell className="w-5 h-5 text-[#6B6B6B]" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E1DA]">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#151515]">
              Notifications & Updates
            </h1>
                  {unreadCount > 0 && (
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#FCEEEE] text-[#8F1A1E]">
                      {unreadCount} Unread
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllMutation.mutate()}
                    className="text-xs font-bold"
                  >
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    Mark all as read
                  </Button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Bell className="w-12 h-12 text-[#6B6B6B] mx-auto stroke-[1.5]" />
                  <h3 className="font-serif text-lg font-bold text-[#151515]">You&apos;re all caught up. No notifications yet.</h3>
                  <p className="text-xs text-[#6B6B6B]">You will receive live alerts when your parcels are dispatched.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E6E1DA] border border-[#E6E1DA] rounded-2xl overflow-hidden">
                  {notifications.map((n) => {
                    const isUnread = !n.readAt;
                    return (
                      <div
                        key={n._id}
                        className={`p-5 flex items-start gap-4 transition-colors ${
                          isUnread ? 'bg-[#F6F2EC]/60' : 'bg-white'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-white border border-[#E6E1DA] flex items-center justify-center flex-shrink-0 shadow-2xs">
                          {getIcon(n.type)}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-serif text-sm font-bold text-[#151515] flex items-center gap-2">
                              {n.title}
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-[#D12C2F]" />
                              )}
                            </h3>
                            <span className="text-[11px] text-[#6B6B6B] whitespace-nowrap">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-xs text-[#3A3A3A] leading-relaxed">
                            {n.body}
                          </p>

                          <div className="pt-2 flex items-center gap-4 text-xs font-semibold">
                            {n.link && (
                              <Link
                                href={n.link}
                                onClick={() => markOneMutation.mutate(n._id)}
                                className="text-[#151515] hover:text-[#D12C2F] flex items-center gap-1"
                              >
                                View Order
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            )}

                            {isUnread && (
                              <button
                                onClick={() => markOneMutation.mutate(n._id)}
                                className="text-[#6B6B6B] hover:text-[#151515] cursor-pointer"
                              >
                                Dismiss
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Server-Side Pagination */}
              <Pagination
                currentPage={meta.page || page}
                totalPages={meta.totalPages || 1}
                totalItems={meta.total || notifications.length}
                pageSize={20}
                onPageChange={(p) => setPage(p)}
                variant="full"
              />
            </div>
          </div>
  );
}

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { formatPKR } from '@/lib/format';
import { getOrderStatusLabel, ORDER_STATUS_OPTIONS } from '@/lib/orderStatus';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/shared/Pagination';
import { Package, ArrowRight } from 'lucide-react';

export function OrdersContent() {
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['my-orders', activeFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeFilter) {
        params.set('status', activeFilter);
      }
      params.set('page', String(page));
      params.set('limit', '10');
      return await apiClient(`/orders?${params.toString()}`);
    },
    staleTime: 30 * 1000,
  });

  const orders = Array.isArray(response) ? response : (response?.data || response?.items || []);
  const meta = response?.meta || { page: 1, totalPages: 1, totalDocs: orders.length, hasNext: false, hasPrev: false };

  const getStatusBadge = (status) => (
    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#F6F2EC] text-[#151515] border border-[#E6E1DA]">
      {getOrderStatusLabel(status)}
    </span>
  );

  const handleFilterChange = (f) => {
    setActiveFilter(f);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E1DA]">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#151515]">
              Orders & Exchange History
            </h1>
            <p className="text-xs text-[#6B6B6B] mt-1">
              Track live parcels, download cutting slips, and request doorstep size exchanges.
            </p>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-[#3A3A3A]">
            <span>Filter by status</span>
            <select
              value={activeFilter}
              onChange={(event) => handleFilterChange(event.target.value)}
              className="min-h-10 rounded-xl border border-[#E6E1DA] bg-white px-3 text-xs text-[#151515]"
            >
              <option value="">All statuses</option>
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

              {/* Order Cards List */}
              {isError ? (
                <div role="alert" className="py-12 text-center space-y-3">
                  <p className="text-sm font-semibold text-[#8F1A1E]">
                    {error?.message || 'We could not load your orders.'}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Try Again
                  </Button>
                </div>
              ) : isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 rounded-2xl border border-[#E6E1DA] bg-white animate-pulse space-y-4">
                      <div className="h-5 bg-[#F6F2EC] rounded w-1/3" />
                      <div className="h-16 bg-[#F6F2EC] rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <Package className="w-12 h-12 text-[#6B6B6B] mx-auto stroke-[1.5]" />
                  <h3 className="font-serif text-lg font-bold text-[#151515]">
                    {activeFilter ? `No ${getOrderStatusLabel(activeFilter).toLowerCase()} orders found.` : "You haven't placed any orders yet."}
                  </h3>
                  <p className="text-xs text-[#6B6B6B] max-w-sm mx-auto">
                    Explore our honest catalogue and experience in-person inspection before paying COD.
                  </p>
                  {!activeFilter ? (
                    <Button variant="primary" size="sm" asChild>
                      <Link href="/shop">Explore Catalogue</Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleFilterChange('All')}>
                      View All Orders
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord._id}
                      className="p-5 sm:p-6 rounded-2xl border border-[#E6E1DA] bg-white hover:border-[#151515] transition-all space-y-4"
                    >
                      {/* Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E6E1DA]">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-[#151515]">
                            {ord.orderNumber}
                          </span>
                          <span className="text-xs text-[#6B6B6B]">
                            {new Date(ord.createdAt).toLocaleDateString('en-PK', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {getStatusBadge(ord.status)}
                          <span className="text-xs font-semibold text-[#151515] tabular-nums">
                            {formatPKR(ord.pricing?.total)}
                          </span>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {ord.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="relative w-14 h-18 rounded-lg bg-[#F6F2EC] border border-[#E6E1DA] overflow-hidden flex-shrink-0"
                            >
                              <Image
                                src={item.image || '/images/placeholder.jpg'}
                                alt={item.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>
                          ))}
                          <div className="space-y-0.5 text-xs">
                            <p className="font-bold text-[#151515]">{ord.items?.[0]?.name}</p>
                            <p className="text-[#6B6B6B]">
                              Size: {ord.items?.[0]?.size || '—'} • {ord.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Direct Transfer'}
                            </p>
                          </div>
                        </div>

                        <Button variant="outline" size="sm">
                          <Link href={`/user/orders/${ord.orderNumber || ord._id}`} className="flex items-center gap-1.5 font-bold">
                            View Order & Slip
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Backend-Driven Pagination Controls */}
                  <Pagination
                    currentPage={meta.page || page}
                    totalPages={meta.totalPages || 1}
                    totalItems={meta.totalDocs || orders.length}
                    pageSize={10}
                    onPageChange={(p) => setPage(p)}
                    variant="full"
                  />
                </div>
              )}
      </div>
    </div>
  );
}

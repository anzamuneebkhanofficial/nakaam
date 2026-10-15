'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { formatPKR } from '@/lib/format';
import { getOrderStatusLabel, getPaymentStatusLabel, ORDER_STATUS_OPTIONS } from '@/lib/orderStatus';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/shared/Pagination';
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  MessageSquare,
  Truck,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Eye,
  CreditCard,
} from 'lucide-react';

export function AdminOrdersContent({ initialStatus = '', initialHasProof = false, initialActionRequired = false }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(() =>
    ORDER_STATUS_OPTIONS.some((option) => option.value === initialStatus) ? initialStatus : ''
  );
  const [paymentFilter, setPaymentFilter] = useState('');
  const [hasProofOnly, setHasProofOnly] = useState(initialHasProof);
  const [actionRequiredOnly, setActionRequiredOnly] = useState(initialActionRequired);
  const [page, setPage] = useState(1);

  // 1. Order Blinker Fast Polling (Every 4 seconds)
  const { data: blinker } = useQuery({
    queryKey: ['admin', 'orders', 'blinker'],
    queryFn: async () => {
      return await apiClient('/admin/orders/stream/blinker');
    },
    refetchInterval: 4000,
  });

  // 2. Fetch Orders List
  const { data: response, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'orders', { search, statusFilter, paymentFilter, hasProofOnly, actionRequiredOnly, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (statusFilter) params.set('status', statusFilter);
      if (paymentFilter) params.set('paymentMethod', paymentFilter);
      if (hasProofOnly) params.set('hasProof', 'true');
      if (actionRequiredOnly) params.set('filter', 'action_required');
      params.set('page', page);
      params.set('limit', 15);
      return await apiClient(`/admin/orders?${params.toString()}`);
    },
  });

  const orders = Array.isArray(response) ? response : (response?.data || response?.docs || []);
  const meta = response?.meta || response?.pagination || { totalPages: 1, totalDocs: orders.length };

  return (
    <div className="space-y-6">
      {/* Header & Blinker Sentinel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {blinker?.hasActionRequired && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FCEEEE] text-[#8F1A1E] animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D12C2F]" />
                Action Required: {blinker.unverifiedProofs + blinker.unconfirmedCod} Pending
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#151515]">
            Orders & Shipments
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            View and manage customer orders, verify payment proofs, and update order statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/reconciliation">
            <Button variant="outline" className="text-xs font-semibold bg-white flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-[#D12C2F]" />
              <span>Payment Verification</span>
            </Button>
          </Link>
          <Link href="/admin/delivery">
            <Button variant="outline" className="text-xs font-semibold bg-white flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-[#151515]" />
              <span>Shipping & Delivery</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Order number, customer name, or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F6F2EC] text-xs text-[#151515] border border-[#E6E1DA] focus:outline-none focus:border-[#151515]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <label className="flex items-center gap-2 text-xs font-semibold text-[#3A3A3A]">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setHasProofOnly(false);
                setActionRequiredOnly(false);
                setPage(1);
              }}
              className="min-h-10 rounded-xl border border-[#E6E1DA] bg-white px-3 text-xs text-[#151515]"
            >
              <option value="">All Orders</option>
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-[#3A3A3A]">
            <span>Payment</span>
            <select
              value={paymentFilter}
              onChange={(event) => {
                setPaymentFilter(event.target.value);
                setPage(1);
              }}
              className="min-h-10 rounded-xl border border-[#E6E1DA] bg-white px-3 text-xs text-[#151515]"
            >
              <option value="">All methods</option>
              <option value="COD">Cash on Delivery</option>
              <option value="MANUAL">Bank Transfer</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              setHasProofOnly(!hasProofOnly);
              setActionRequiredOnly(false);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              hasProofOnly
                ? 'bg-[#8F1A1E] text-white shadow-xs'
                : 'bg-[#FCEEEE] text-[#8F1A1E] hover:bg-[#F6D0D0]'
            }`}
          >
            Unverified Proofs
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F2EC] border-b border-[#E6E1DA] font-bold text-[#151515]">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer & City</th>
                <th className="py-3 px-4">Amount (PKR)</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1DA] text-[#6B6B6B]">
              {isError ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#8F1A1E]">
                    <p role="alert">{error?.message || 'Could not load orders.'}</p>
                    <button type="button" onClick={() => refetch()} className="mt-2 underline">
                      Try again
                    </button>
                  </td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#6B6B6B]">
                    Loading customer orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#6B6B6B]">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const id = ord._id || ord.id || ord.orderNumber;
                  const total = ord.pricing?.total || 0;
                  const isAwaitingProof = ord.payment?.status === 'proof_submitted';

                  return (
                    <tr key={id} className="hover:bg-[#F6F2EC]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/orders/${id}`}
                          className="font-mono font-bold text-[#151515] hover:underline"
                        >
                          {ord.orderNumber}
                        </Link>
                        <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                          {new Date(ord.createdAt).toLocaleDateString()} &bull;{' '}
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#151515]">{ord.shippingAddress?.fullName}</p>
                        <p className="text-[11px] text-[#6B6B6B]">
                          {ord.shippingAddress?.phone} &bull; <strong>{ord.shippingAddress?.city}</strong>
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#151515]">
                        {formatPKR(total)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              ord.paymentMethod === 'COD'
                                ? 'bg-[#F6F2EC] text-[#151515]'
                                : 'bg-[#FCEEEE] text-[#8F1A1E]'
                            }`}
                          >
                            {ord.paymentMethod}
                          </span>
                          {isAwaitingProof && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#8F1A1E] text-white">
                              Proof Ready
                            </span>
                          )}
                        </div>
                        <span className="block text-[10px] text-[#6B6B6B] mt-0.5">
                          {getPaymentStatusLabel(ord.payment?.status)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-800'
                              : ord.status === 'dispatched'
                              ? 'bg-blue-50 text-blue-800'
                              : 'bg-[#F6F2EC] text-[#151515]'
                          }`}
                        >
                          {getOrderStatusLabel(ord.status)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/orders/${id}`}>
                            <button
                              type="button"
                              className="px-2.5 py-1 rounded-lg border border-[#E6E1DA] hover:border-[#151515] text-[11px] font-semibold text-[#151515] transition-colors"
                            >
                              Manage
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination
          currentPage={meta.page || page}
          totalPages={meta.totalPages || 1}
          totalItems={meta.totalDocs || orders.length}
          pageSize={15}
          onPageChange={(p) => setPage(p)}
          variant="compact"
        />
      </div>
    </div>
  );
}

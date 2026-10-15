'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { formatPKR } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  Truck,
  Layers,
  RefreshCw,
  Eye,
  Phone,
  MapPin,
  ExternalLink,
  Coins,
  Plus,
  Users,
  Tag,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';

export function DashboardContent() {
  const queryClient = useQueryClient();
  const { data: metrics, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'dashboard', 'metrics'],
    queryFn: async () => {
      return await apiClient('/admin/dashboard/metrics');
    },
    refetchInterval: 30 * 1000,
  });

  const quickOrderAction = useMutation({
    mutationFn: async ({ order, action }) => {
      const actionPath = action === 'confirm'
        ? `/admin/orders/${order.id}/confirm`
        : `/admin/orders/${order.id}/payment/verify`;
      return apiClient(actionPath, {
        method: 'POST',
        body: action === 'confirm' ? { via: 'admin' } : { note: 'Verified from admin dashboard' },
      });
    },
    onSuccess: async () => {
      toast.success('Order action completed.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'metrics'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }),
      ]);
    },
    onError: (error) => toast.error(error?.message || 'The order action could not be completed.'),
  });

  if (isLoading && !metrics) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-[#E6E1DA] rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-[#E6E1DA]" />
          ))}
        </div>
        <div className="h-48 bg-white rounded-2xl border border-[#E6E1DA]" />
      </div>
    );
  }

  const revenue = metrics?.revenue || {
    today: 0,
    yesterday: 0,
    todayChangePercent: null,
    thisWeek: 0,
    thisMonth: 0,
    total: 0,
    averageOrderValue: 0,
  };

  const catalog = metrics?.catalog || {
    totalProducts: 55,
    totalCategories: 6,
    totalCustomers: 12,
  };

  const orders = metrics?.orders || {
    total: 0,
    byStatus: {
      placed: 0,
      awaiting_confirmation: 0,
      awaiting_payment: 0,
      confirmed: 0,
      processing: 0,
      dispatched: 0,
      delivered: 0,
      cancelled: 0,
      return_requested: 0,
      returned: 0,
    },
  };

  const actionRequired = metrics?.actionRequired || {
    unverifiedProofs: 0,
    unconfirmedCod: 0,
    openReturns: 0,
    lowStockAlertsCount: 0,
  };

  const recentOrders = metrics?.recentOrders || [];
  const lowStockItems = metrics?.lowStockItems || [];
  const paymentBreakdown = metrics?.paymentBreakdown || {
    codCount: 0,
    codRevenue: 0,
    manualCount: 0,
    manualRevenue: 0,
  };
  const cityDistribution = metrics?.cityDistribution || [];

  const totalActionCount =
    actionRequired.unverifiedProofs +
    actionRequired.unconfirmedCod +
    actionRequired.openReturns;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Executive Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E1DA] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">
              Store Performance &bull; Live Synchronization
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#151515] mt-1">
            Store Overview
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Real-time tracking of revenue, order fulfillment, and inventory health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs font-semibold flex items-center gap-2 bg-white rounded-xl h-10 px-4 border-[#E6E1DA]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#B82A2E]' : 'text-[#6B6B6B]'}`} />
            <span>{isFetching ? 'Updating...' : 'Sync Data'}</span>
          </Button>

          <Link href="/admin/products/new">
            <Button size="sm" className="bg-[#151515] text-white hover:bg-black text-xs font-semibold rounded-xl h-10 px-4 flex items-center gap-1.5 shadow-xs">
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Action Required Alert Ribbon */}
      {totalActionCount > 0 && (
        <div className="bg-white border-l-4 border-l-[#B82A2E] border border-[#E6E1DA] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FCEEEE] text-[#B82A2E] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#151515]">
                {totalActionCount} Order{totalActionCount > 1 ? 's' : ''} Require Immediate Action
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B6B6B] mt-0.5">
                {actionRequired.unverifiedProofs > 0 && (
                  <span className="text-[#B82A2E] font-medium">&bull; {actionRequired.unverifiedProofs} Bank Transfer Proof{actionRequired.unverifiedProofs > 1 ? 's' : ''} to verify</span>
                )}
                {actionRequired.unconfirmedCod > 0 && (
                  <span className="text-amber-800 font-medium">&bull; {actionRequired.unconfirmedCod} Unconfirmed COD Order{actionRequired.unconfirmedCod > 1 ? 's' : ''}</span>
                )}
                {actionRequired.openReturns > 0 && (
                  <span className="text-blue-800 font-medium">&bull; {actionRequired.openReturns} Exchange / Return Request{actionRequired.openReturns > 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          </div>
          <Link href="/admin/orders?filter=action_required">
            <Button size="sm" className="bg-[#151515] text-white hover:bg-black text-xs font-semibold rounded-xl px-4 py-2">
              Review Action Queue &rarr;
            </Button>
          </Link>
        </div>
      )}

      {/* 3. Primary Financial & Order Volume KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Revenue Overview */}
        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B6B6B]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-[#F6F2EC] flex items-center justify-center text-[#151515]">
              <Coins className="w-4 h-4 text-[#B82A2E]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-serif text-2xl lg:text-3xl font-bold text-[#151515]">
              {formatPKR(revenue.total || revenue.thisMonth)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#6B6B6B]">
              <span>Today:</span>
              <span className="font-semibold text-[#151515]">{formatPKR(revenue.today)}</span>
              {revenue.todayChangePercent !== null && (
                <span className={`font-semibold ${revenue.todayChangePercent >= 0 ? 'text-emerald-700' : 'text-[#B82A2E]'}`}>
                  ({revenue.todayChangePercent >= 0 ? '+' : ''}{revenue.todayChangePercent}%)
                </span>
              )}
            </div>
          </div>
          <div className="pt-3 mt-4 border-t border-[#F6F2EC] flex items-center justify-between text-[11px] text-[#6B6B6B]">
            <span>Average Order Value</span>
            <span className="font-semibold text-[#151515]">{formatPKR(revenue.averageOrderValue)}</span>
          </div>
        </div>

        {/* Card 2: Orders Processed */}
        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B6B6B]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Orders Volume</span>
            <div className="w-8 h-8 rounded-xl bg-[#F6F2EC] flex items-center justify-center text-[#151515]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-serif text-2xl lg:text-3xl font-bold text-[#151515]">
              {orders.total} <span className="text-xs font-sans text-[#6B6B6B] font-normal">total</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">
              {orders.byStatus.dispatched + orders.byStatus.delivered} fulfilled / in transit
            </p>
          </div>
          <div className="pt-3 mt-4 border-t border-[#F6F2EC] flex items-center justify-between text-[11px] text-[#6B6B6B]">
            <span>Processing</span>
            <span className="font-semibold text-[#151515]">{orders.byStatus.processing} orders</span>
          </div>
        </div>

        {/* Card 3: Payment Verification */}
        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B6B6B]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Payment Verification</span>
            <div className="w-8 h-8 rounded-xl bg-[#F6F2EC] flex items-center justify-center text-[#151515]">
              <CreditCard className="w-4 h-4 text-[#B82A2E]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-serif text-2xl lg:text-3xl font-bold text-[#151515]">
              {actionRequired.unverifiedProofs}{' '}
              <span className="text-xs font-sans text-[#6B6B6B] font-normal">pending</span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-1">
              {actionRequired.unverifiedProofs === 0 ? 'All receipts verified' : 'Bank slips awaiting review'}
            </p>
          </div>
          <div className="pt-3 mt-4 border-t border-[#F6F2EC] flex items-center justify-between text-[11px]">
            <Link href="/admin/orders?hasProof=true" className="text-[#B82A2E] font-semibold hover:underline flex items-center gap-1">
              Verify Payments <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Inventory Health */}
        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B6B6B]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inventory Health</span>
            <div className="w-8 h-8 rounded-xl bg-[#F6F2EC] flex items-center justify-center text-[#151515]">
              <AlertTriangle className={`w-4 h-4 ${actionRequired.lowStockAlertsCount > 0 ? 'text-amber-600' : 'text-emerald-700'}`} />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-serif text-2xl lg:text-3xl font-bold text-[#151515]">
              {actionRequired.lowStockAlertsCount}{' '}
              <span className="text-xs font-sans text-[#6B6B6B] font-normal">low items</span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-1">
              Items with 3 or fewer units left
            </p>
          </div>
          <div className="pt-3 mt-4 border-t border-[#F6F2EC] flex items-center justify-between text-[11px]">
            <Link href="/admin/products" className="text-[#151515] font-semibold hover:underline flex items-center gap-1">
              Manage Products <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Quick Catalog Summary Ribbon */}
      <div className="bg-[#FAF8F5] border border-[#E6E1DA] rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <Link href="/admin/products" className="p-2 rounded-xl hover:bg-white transition-colors block">
          <span className="text-[11px] text-[#6B6B6B] font-medium block">Total Products</span>
          <span className="font-serif text-lg font-bold text-[#151515]">{catalog.totalProducts}</span>
        </Link>
        <Link href="/admin/categories" className="p-2 rounded-xl hover:bg-white transition-colors block">
          <span className="text-[11px] text-[#6B6B6B] font-medium block">Active Categories</span>
          <span className="font-serif text-lg font-bold text-[#151515]">{catalog.totalCategories}</span>
        </Link>
        <Link href="/admin/customers" className="p-2 rounded-xl hover:bg-white transition-colors block">
          <span className="text-[11px] text-[#6B6B6B] font-medium block">Customers</span>
          <span className="font-serif text-lg font-bold text-[#151515]">{catalog.totalCustomers}</span>
        </Link>
        <Link href="/admin/sales" className="p-2 rounded-xl hover:bg-white transition-colors block">
          <span className="text-[11px] text-[#6B6B6B] font-medium block">Coupons & Discounts</span>
          <span className="font-serif text-lg font-bold text-[#151515]">Active</span>
        </Link>
      </div>

      {/* 5. Order Status Pipeline Ribbon (Clean Minimalist Segment Strip) */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-[#151515]">
              Order Fulfillment Pipeline
            </h3>
            <p className="text-xs text-[#6B6B6B]">Live distribution of orders across each workflow phase</p>
          </div>
          <Link href="/admin/orders" className="text-xs text-[#B82A2E] font-semibold hover:underline">
            All Orders &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <Link href="/admin/orders?status=placed" className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] hover:border-[#151515] transition-all text-center">
            <span className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider block">Placed</span>
            <span className="font-serif text-xl font-bold text-[#151515] mt-0.5 block">{orders.byStatus.placed}</span>
          </Link>

          <Link href="/admin/orders?status=awaiting_confirmation" className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] hover:border-[#B82A2E] transition-all text-center">
            <span className="text-[10px] font-semibold text-[#B82A2E] uppercase tracking-wider block">Pending Confirm</span>
            <span className="font-serif text-xl font-bold text-[#B82A2E] mt-0.5 block">{orders.byStatus.awaiting_confirmation}</span>
          </Link>

          <Link href="/admin/orders?status=confirmed" className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] hover:border-[#151515] transition-all text-center">
            <span className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider block">Confirmed</span>
            <span className="font-serif text-xl font-bold text-[#151515] mt-0.5 block">{orders.byStatus.confirmed}</span>
          </Link>

          <Link href="/admin/orders?status=processing" className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] hover:border-[#151515] transition-all text-center">
            <span className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider block">Processing</span>
            <span className="font-serif text-xl font-bold text-[#151515] mt-0.5 block">{orders.byStatus.processing}</span>
          </Link>

          <Link href="/admin/orders?status=dispatched" className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] hover:border-[#151515] transition-all text-center">
            <span className="text-[10px] font-semibold text-[#151515] uppercase tracking-wider block">In Transit</span>
            <span className="font-serif text-xl font-bold text-[#151515] mt-0.5 block">{orders.byStatus.dispatched}</span>
          </Link>

          <Link href="/admin/orders?status=delivered" className="p-3 rounded-xl bg-[#EAF5EC] border border-[#CFEAD3] hover:border-emerald-700 transition-all text-center">
            <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">Delivered</span>
            <span className="font-serif text-xl font-bold text-emerald-800 mt-0.5 block">{orders.byStatus.delivered}</span>
          </Link>
        </div>
      </div>

      {/* 6. Full-Width Recent Orders Table (No Horizontal Scroll Cramping) */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E6E1DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#151515]">Recent Orders</h3>
            <p className="text-xs text-[#6B6B6B]">Live stream of incoming and dispatching orders</p>
          </div>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm" className="text-xs font-semibold rounded-xl bg-white border-[#E6E1DA]">
              View All Orders &rarr;
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E6E1DA] font-semibold text-[#151515]">
              <tr>
                <th className="py-3 px-5">Order #</th>
                <th className="py-3 px-5">Customer & City</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Total</th>
                <th className="py-3 px-5">Payment</th>
                <th className="py-3 px-5">Fulfillment Status</th>
                <th className="py-3 px-5">Courier Details</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1DA] text-[#6B6B6B]">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#6B6B6B]">
                    No customer orders found in the database yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord.id || ord.orderNumber} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-[#151515]">
                      <Link href={`/admin/orders/${ord.id || ord.orderNumber}`} className="hover:text-[#B82A2E] hover:underline">
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-semibold text-[#151515]">{ord.customerName}</p>
                      <p className="text-[11px] text-[#6B6B6B]">{ord.city} &bull; {ord.phone || 'No phone'}</p>
                    </td>
                    <td className="py-4 px-5 text-[#6B6B6B] whitespace-nowrap text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-5 font-mono font-bold text-[#151515] whitespace-nowrap">
                      {formatPKR(ord.total)}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        {ord.proofUrl && (
                          <a href={ord.proofUrl} target="_blank" rel="noreferrer" title="View uploaded bank transfer proof">
                            <Image
                              src={ord.proofUrl}
                              alt="Receipt"
                              width={32}
                              height={32}
                              unoptimized
                              className="h-8 w-8 rounded-lg border border-[#E6E1DA] object-cover hover:scale-105 transition-transform"
                            />
                          </a>
                        )}
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ord.paymentMethod === 'COD'
                            ? 'bg-[#F6F2EC] text-[#151515]'
                            : 'bg-[#FCEEEE] text-[#8F1A1E]'
                        }`}>
                          {ord.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ord.status === 'delivered'
                          ? 'bg-[#EAF5EC] text-emerald-800'
                          : ord.status === 'placed' || ord.status === 'awaiting_confirmation'
                          ? 'bg-[#FCEEEE] text-[#8F1A1E]'
                          : 'bg-[#FAF8F5] border border-[#E6E1DA] text-[#151515]'
                      }`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {ord.trackingNumber ? (
                        <div className="text-[11px]">
                          <span className="font-semibold text-[#151515]">{ord.courier || 'Courier'}</span>
                          <p className="font-mono text-[#6B6B6B]">{ord.trackingNumber}</p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#9B948B] italic">Pending assignment</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5">
                        {ord.paymentMethod === 'COD' && ['placed', 'awaiting_confirmation'].includes(ord.status) && (
                          <button
                            type="button"
                            disabled={quickOrderAction.isPending}
                            onClick={() => quickOrderAction.mutate({ order: ord, action: 'confirm' })}
                            className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                        )}
                        {ord.paymentStatus === 'proof_submitted' && (
                          <button
                            type="button"
                            disabled={quickOrderAction.isPending}
                            onClick={() => quickOrderAction.mutate({ order: ord, action: 'verify' })}
                            className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            Verify Slip
                          </button>
                        )}
                        <Link
                          href={`/admin/orders/${ord.id || ord.orderNumber}`}
                          className="rounded-lg border border-[#E6E1DA] bg-white px-3 py-1 text-[11px] font-semibold text-[#151515] hover:border-[#151515] transition-colors"
                        >
                          Manage
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Operational Triad: Inventory Restock, Payment Distribution & Top Cities (3 Columns Full-Width) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Col 1: Low Stock Items */}
        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
            <h3 className="font-serif text-sm font-bold text-[#151515] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Low Stock Warnings
            </h3>
            <Link href="/admin/products" className="text-[11px] text-[#B82A2E] font-semibold hover:underline">
              Inventory &rarr;
            </Link>
          </div>

          <div className="space-y-2.5">
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-[#6B6B6B] text-center py-6">All garment inventory levels healthy.</p>
            ) : (
              lowStockItems.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#151515] truncate">{item.name}</p>
                    <p className="text-[10px] text-[#6B6B6B] font-mono">
                      Size: {item.size} &bull; {item.variantSku || item.sku}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#FCEEEE] text-[#8F1A1E] shrink-0">
                    {item.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Col 2: Payment Distribution Split */}
        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
            <h3 className="font-serif text-sm font-bold text-[#151515] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#151515]" />
              Payment Distribution
            </h3>
            <span className="text-[11px] text-[#6B6B6B]">Settlement Share</span>
          </div>

          <div className="space-y-4 text-xs pt-1">
            <div>
              <div className="flex justify-between font-semibold text-[#151515] mb-1.5">
                <span>Cash on Delivery (COD)</span>
                <span>{paymentBreakdown.codCount} orders</span>
              </div>
              <div className="w-full bg-[#F6F2EC] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#151515] h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(
                      (paymentBreakdown.codCount /
                        (paymentBreakdown.codCount + paymentBreakdown.manualCount || 1)) *
                        100
                    )}%`,
                  }}
                />
              </div>
              <span className="text-[11px] text-[#6B6B6B] block mt-1 font-mono font-semibold">
                {formatPKR(paymentBreakdown.codRevenue)}
              </span>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-[#151515] mb-1.5">
                <span>Raast / Direct Bank Transfer</span>
                <span>{paymentBreakdown.manualCount} orders</span>
              </div>
              <div className="w-full bg-[#F6F2EC] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#B82A2E] h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(
                      (paymentBreakdown.manualCount /
                        (paymentBreakdown.codCount + paymentBreakdown.manualCount || 1)) *
                        100
                    )}%`,
                  }}
                />
              </div>
              <span className="text-[11px] text-[#6B6B6B] block mt-1 font-mono font-semibold">
                {formatPKR(paymentBreakdown.manualRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Col 3: Delivery Destinations */}
        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
            <h3 className="font-serif text-sm font-bold text-[#151515] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#151515]" />
              Fulfillment Destinations
            </h3>
            <span className="text-[11px] text-[#6B6B6B]">Regional Hubs</span>
          </div>

          <div className="space-y-2 text-xs">
            {cityDistribution.length === 0 ? (
              <p className="text-xs text-[#6B6B6B] text-center py-6">No city data available yet.</p>
            ) : (
              cityDistribution.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-[#E6E1DA]/50 last:border-0">
                  <span className="text-[#151515] font-semibold">{c.city}</span>
                  <span className="text-[#6B6B6B] font-mono text-[11px]">
                    {c.count} order{c.count > 1 ? 's' : ''} ({c.percentage}%)
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import React from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/lib/authClient';
import { apiClient } from '@/lib/apiClient';
import { formatPKR } from '@/lib/format';
import { getOrderStatusLabel, getPaymentStatusLabel } from '@/lib/orderStatus';
import { Button } from '@/components/ui/Button';
import {
  Package,
  Heart,
  Users,
  Bell,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Truck,
  MessageSquare,
  Ruler,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';

export function UserDashboardContent() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  // 1. Fetch real summary counts from backend
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
    isFetching: isSummaryFetching,
  } = useQuery({
    queryKey: ['user', 'summary', userId],
    queryFn: async () => await apiClient('/me/summary'),
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  });

  // 2. Fetch profile to get real family members count
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['user', 'profile', userId],
    queryFn: async () => await apiClient('/me/profile'),
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
  });

  // 3. Fetch latest real orders from backend
  const {
    data: ordersResponse,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['user', 'recent-orders', userId],
    queryFn: async () => {
      return await apiClient('/orders?limit=3');
    },
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  });

  const orders = Array.isArray(ordersResponse)
    ? ordersResponse
    : ordersResponse?.data || ordersResponse?.items || [];
  const latestOrder = orders.length > 0 ? orders[0] : null;

  const confirmDeliveryMutation = useMutation({
    mutationFn: async (order) =>
      apiClient(`/orders/${order.orderNumber || order._id}/confirm-delivery`, {
        method: 'POST',
        body: { notes: 'Customer confirmed receipt from their dashboard' },
      }),
    onSuccess: async () => {
      toast.success('Delivery confirmed. Thank you!');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user', 'recent-orders', userId] }),
        queryClient.invalidateQueries({ queryKey: ['user', 'summary', userId] }),
      ]);
    },
    onError: (error) => toast.error(error?.message || 'Unable to confirm receipt right now.'),
  });

  const familyMembersCount = profile?.familyMembers?.length || 0;

  const handleRefresh = () => {
    refetchSummary();
    refetchProfile();
    refetchOrders();
  };

  const getStatusBadge = (status) => (
    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#F6F2EC] text-[#151515] border border-[#E6E1DA]">
      {getOrderStatusLabel(status)}
    </span>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Header with Account Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E1DA] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B6B]">
              My Account &bull; Active Customer
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#151515] mt-1">
            Welcome back, {session?.user?.name || 'Valued Customer'}
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Manage your orders, shipment tracking, addresses, and wishlist.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white rounded-xl h-10 px-4 border-[#E6E1DA]"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isSummaryFetching ? 'animate-spin text-[#B82A2E]' : 'text-[#6B6B6B]'}`}
            />
            <span>Refresh</span>
          </Button>

          <Button size="sm" className="bg-[#151515] text-white hover:bg-black rounded-xl h-10 px-4 font-semibold text-xs" asChild>
            <Link href="/user/orders" className="flex items-center gap-1.5">
              <Package className="w-4 h-4" />
              <span>View All Orders</span>
            </Link>
          </Button>
        </div>
      </div>

      {(isSummaryError || isProfileError) && (
        <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          Some account metrics could not be loaded. Use Refresh to try again.
        </p>
      )}

      {/* 2. Primary Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Orders Card */}
        <Link
          href="/user/orders"
          className="p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs hover:border-[#151515] transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-[#6B6B6B]">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Orders Placed
            </span>
            <div className="p-2 rounded-xl bg-[#F6F2EC] text-[#151515] group-hover:bg-[#151515] group-hover:text-white transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-serif text-3xl font-bold text-[#151515]">
              {isSummaryLoading ? '...' : isSummaryError ? '—' : summary?.ordersCount ?? 0}
            </div>
            <p className="text-xs text-[#6B6B6B] mt-1 flex items-center gap-1">
              <span>View order history</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </Link>

        {/* Wishlist Card */}
        <Link
          href="/user/wishlist"
          className="p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs hover:border-[#151515] transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-[#6B6B6B]">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Wishlist Items
            </span>
            <div className="p-2 rounded-xl bg-[#FCEEEE] text-[#B82A2E] group-hover:bg-[#B82A2E] group-hover:text-white transition-colors">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-serif text-3xl font-bold text-[#151515]">
              {isSummaryLoading ? '...' : isSummaryError ? '—' : summary?.wishlistCount ?? 0}
            </div>
            <p className="text-xs text-[#6B6B6B] mt-1 flex items-center gap-1">
              <span>Saved designs & pieces</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </Link>

        {/* Saved Addresses Card */}
        <Link
          href="/user/addresses"
          className="p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs hover:border-[#151515] transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-[#6B6B6B]">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Saved Addresses
            </span>
            <div className="p-2 rounded-xl bg-[#F6F2EC] text-[#151515] group-hover:bg-[#151515] group-hover:text-white transition-colors">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-serif text-3xl font-bold text-[#151515]">
              Delivery
            </div>
            <p className="text-xs text-[#6B6B6B] mt-1 flex items-center gap-1">
              <span>Manage shipping addresses</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </Link>

        {/* Notifications Card */}
        <Link
          href="/user/notifications"
          className="p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs hover:border-[#151515] transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-[#6B6B6B]">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Notifications
            </span>
            <div className="p-2 rounded-xl bg-[#F6F2EC] text-[#151515] group-hover:bg-[#151515] group-hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-serif text-3xl font-bold text-[#151515]">
              {isSummaryLoading ? '...' : isSummaryError ? '—' : summary?.unreadNotificationsCount ?? 0}
            </div>
            <p className="text-xs text-[#6B6B6B] mt-1 flex items-center gap-1">
              <span>Unread alerts</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </Link>
      </div>

      {/* 3. Latest Order Tracking Panel */}
      <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-[#151515]" />
            <h2 className="font-serif text-lg font-bold text-[#151515]">
              Most Recent Order
            </h2>
          </div>
          {latestOrder && getStatusBadge(latestOrder.status)}
        </div>

        {isOrdersLoading ? (
          <div className="py-8 text-center text-xs text-[#6B6B6B] animate-pulse">
            Loading recent order details...
          </div>
        ) : isOrdersError ? (
          <div role="alert" className="py-8 text-center space-y-3">
            <p className="text-xs text-[#8F1A1E]">
              {ordersError?.message || 'Could not load your recent order.'}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetchOrders()}>
              Try Again
            </Button>
          </div>
        ) : latestOrder ? (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#6B6B6B]">
                  Order Number:{' '}
                  <span className="font-mono text-[#151515] font-bold">
                    {latestOrder.orderNumber}
                  </span>
                </p>
                <p className="text-sm font-bold text-[#151515]">
                  {latestOrder.items?.map((item) => `${item.name || item.title || 'Item'} (${item.size || 'Standard'})`).join(', ') ||
                    'Order items'}
                </p>
                <p className="text-xs text-[#6B6B6B]">
                  Placed on {new Date(latestOrder.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })} &bull;{' '}
                  {latestOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Raast / Bank Transfer'}:{' '}
                  <span className="font-semibold text-[#151515]">
                    {formatPKR(latestOrder.pricing?.total || 0)}
                  </span>
                </p>
                <p className="text-xs text-[#6B6B6B]">
                  Payment Status: <span className="font-semibold text-[#151515]">{getPaymentStatusLabel(latestOrder.payment?.status)}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" asChild>
                  <Link
                    href={`/user/orders/${latestOrder.orderNumber || latestOrder._id}`}
                    className="flex items-center gap-1.5"
                  >
                    <span>Track Shipment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] flex items-center gap-2.5 text-xs text-[#3A3A3A]">
              <ShieldCheck className="w-4 h-4 text-[#B82A2E] shrink-0" />
              <span>Doorstep Open-Box Inspection guaranteed when parcel arrives.</span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
                <span>Shipment Progress</span>
                <span className="font-semibold text-[#151515]">{getOrderStatusLabel(latestOrder.status)}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5" aria-label={`Order progress: ${getOrderStatusLabel(latestOrder.status)}`}>
                {['placed', 'processing', 'dispatched', 'delivered'].map((status, index) => {
                  const currentStep = ['placed', 'awaiting_confirmation', 'awaiting_payment'].includes(latestOrder.status) ? 0 :
                    ['confirmed', 'processing'].includes(latestOrder.status) ? 1 :
                      ['dispatched', 'out_for_delivery'].includes(latestOrder.status) ? 2 :
                        latestOrder.status === 'delivered' ? 3 : -1;
                  return (
                    <span
                      key={status}
                      className={`h-2 rounded-full transition-colors ${index <= currentStep ? 'bg-emerald-700' : 'bg-[#E6E1DA]'}`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#F6F2EC]">
              {['dispatched', 'out_for_delivery'].includes(latestOrder.status) && (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={confirmDeliveryMutation.isPending}
                  onClick={() => confirmDeliveryMutation.mutate(latestOrder)}
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  {confirmDeliveryMutation.isPending ? 'Confirming…' : 'Confirm Received'}
                </Button>
              )}
              {latestOrder.status !== 'delivered' && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/user/orders/${latestOrder.orderNumber || latestOrder._id}?action=report`}>
                    <MessageSquare className="mr-1.5 h-4 w-4" />
                    Report Issue
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] text-[#6B6B6B] mx-auto flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#151515]">No active orders placed yet</p>
            <p className="text-xs text-[#6B6B6B] max-w-sm mx-auto">
              Explore our collection of authentic Pakistani womenswear, menswear, and home textiles with doorstep inspection.
            </p>
            <Button size="sm" className="bg-[#151515] text-white hover:bg-black rounded-xl text-xs" asChild>
              <Link href="/shop">Explore Collections</Link>
            </Button>
          </div>
        )}
      </div>

      {/* 4. Support & Account Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#151515]" />
            <h3 className="font-serif text-base font-bold text-[#151515]">
              Measurements & Sizing Profile
            </h3>
          </div>
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            Save personal chest, waist, and length measurements to receive automated size recommendations across all designs.
          </p>
          <Button variant="outline" size="sm" className="w-full rounded-xl text-xs" asChild>
            <Link href="/user/profile">Manage Measurements</Link>
          </Button>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#151515]" />
            <h3 className="font-serif text-base font-bold text-[#151515]">
              Customer Care & Inquiries
            </h3>
          </div>
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            Need help with an ongoing order, delivery inquiry, or product questions? Contact our team anytime.
          </p>
          <Button variant="outline" size="sm" className="w-full rounded-xl text-xs" asChild>
            <Link href="/user/complaints/new">Contact Customer Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}


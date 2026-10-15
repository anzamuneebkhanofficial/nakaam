'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/authClient';
import { apiClient } from '@/lib/apiClient';
import { formatPKR } from '@/lib/format';
import { getOrderStatusLabel } from '@/lib/orderStatus';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AccountNav } from './AccountNav';
import { Button } from '@/components/ui/Button';
import {
  Package,
  Heart,
  Users,
  Bell,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Ruler,
} from 'lucide-react';

export function AccountDashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    if (!isPending && !session) {
      // If session cookies are present, Better Auth is still resolving client session state
      const hasSessionCookie =
        typeof document !== 'undefined' &&
        (document.cookie.includes('better-auth.session_token') ||
          document.cookie.includes('__Secure-better-auth.session_token') ||
          document.cookie.includes('better-auth.session_data'));

      if (!hasSessionCookie) {
        router.replace('/login?next=/account');
      }
    }
  }, [session, isPending, router]);

  const {
    data: summary,
    isError: summaryError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ['account-summary', userId],
    queryFn: async () => await apiClient('/me/summary'),
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
  });

  const {
    data: profile,
    isError: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => await apiClient('/me/profile'),
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
  });

  const {
    data: ordersResponse,
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersErrorMessage,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['account-recent-orders', userId],
    queryFn: async () => await apiClient('/orders?limit=1'),
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  });

  const orders = Array.isArray(ordersResponse)
    ? ordersResponse
    : Array.isArray(ordersResponse?.items)
    ? ordersResponse.items
    : Array.isArray(ordersResponse?.data)
    ? ordersResponse.data
    : [];
  const latestOrder = orders[0] || null;

  if (isPending || !session) {
    return (
      <div className="min-h-screen bg-[#F6F2EC] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#151515] border-t-transparent animate-spin" />
        <p className="font-serif text-sm font-semibold text-[#151515]">Loading Account Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2EC] text-[#151515]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Path */}
        <nav className="text-xs text-[#6B6B6B] mb-6 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#151515]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#6B6B6B]" />
          <span className="text-[#151515] font-semibold">My Account</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Navigation */}
          <AccountNav />

          {/* Main Dashboard Panel */}
          <div className="flex-1 w-full space-y-8">
            {/* Greeting Header */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8F1A1E]">
                  Customer Account
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#151515]">
                  Welcome, {session.user?.name?.split(' ')[0] || 'there'}
                </h1>
                <p className="text-xs text-[#6B6B6B]">
                  Manage your saved sizes, addresses, and orders.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Link href="/account/profile" className="flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </div>

            {(summaryError || profileError) && (
              <div role="alert" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                <p>Some account details could not be loaded.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    refetchSummary();
                    refetchProfile();
                  }}
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                href="/account/orders"
                className="p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs hover:border-[#151515] transition-all group"
              >
                <div className="flex items-center justify-between text-[#6B6B6B] mb-2">
                  <Package className="w-5 h-5 group-hover:text-[#151515] transition-colors" />
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-2xl font-bold font-serif text-[#151515]">
                  {summaryError ? '—' : summary ? summary.ordersCount ?? 0 : '—'}
                </p>
                <p className="text-xs text-[#6B6B6B] font-medium mt-0.5">Orders</p>
              </Link>

              <Link
                href="/account/wishlist"
                className="p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs hover:border-[#151515] transition-all group"
              >
                <div className="flex items-center justify-between text-[#6B6B6B] mb-2">
                  <Heart className="w-5 h-5 group-hover:text-[#D12C2F] transition-colors" />
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-2xl font-bold font-serif text-[#151515]">
                  {summaryError ? '—' : summary ? summary.wishlistCount ?? 0 : '—'}
                </p>
                <p className="text-xs text-[#6B6B6B] font-medium mt-0.5">Wishlist</p>
              </Link>

              <Link
                href="/account/family"
                className="p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs hover:border-[#151515] transition-all group"
              >
                <div className="flex items-center justify-between text-[#6B6B6B] mb-2">
                  <Users className="w-5 h-5 group-hover:text-[#151515] transition-colors" />
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-2xl font-bold font-serif text-[#151515]">
                  {profileError ? '—' : profile ? profile.familyMembers?.length ?? 0 : '—'}
                </p>
                <p className="text-xs text-[#6B6B6B] font-medium mt-0.5">Saved Sizes</p>
              </Link>

              <Link
                href="/account/notifications"
                className="p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs hover:border-[#151515] transition-all group"
              >
                <div className="flex items-center justify-between text-[#6B6B6B] mb-2">
                  <Bell className="w-5 h-5 group-hover:text-[#151515] transition-colors" />
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-2xl font-bold font-serif text-[#151515]">
                  {summary ? summary.unreadNotificationsCount ?? 0 : '—'}
                </p>
                <p className="text-xs text-[#6B6B6B] font-medium mt-0.5">Notifications</p>
              </Link>
            </div>

            {/* Recent Order Spotlight */}
            <section className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#151515]" />
                  <h2 className="font-serif text-lg font-bold text-[#151515]">Latest Order</h2>
                </div>
                {latestOrder && (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#F6F2EC] text-[#151515] border border-[#E6E1DA]">
                    {getOrderStatusLabel(latestOrder.status)}
                  </span>
                )}
              </div>

              {ordersLoading ? (
                <p className="py-4 text-xs text-[#6B6B6B]" aria-live="polite">
                  Loading your recent order...
                </p>
              ) : ordersError ? (
                <div role="alert" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-[#8F1A1E]">
                    {ordersErrorMessage?.message || 'Your recent order could not be loaded.'}
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={() => refetchOrders()}>
                    Try Again
                  </Button>
                </div>
              ) : latestOrder ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#6B6B6B]">
                      Order Number:{' '}
                      <span className="font-mono text-[#151515]">{latestOrder.orderNumber}</span>
                    </p>
                    <p className="text-sm font-bold text-[#151515]">
                      {latestOrder.items?.map((item) => item.name || item.title || 'Item').join(', ') || 'Order details'}
                    </p>
                    <p className="text-xs text-[#6B6B6B]">
                      {latestOrder.createdAt
                        ? `Placed on ${new Date(latestOrder.createdAt).toLocaleDateString('en-PK')}`
                        : 'Order date unavailable'}
                      {' • '}
                      {latestOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Bank Transfer'}
                      {typeof latestOrder.pricing?.total === 'number'
                        ? `: ${formatPKR(latestOrder.pricing.total)}`
                        : ''}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" asChild>
                    <Link
                      href={`/account/orders/${latestOrder.orderNumber || latestOrder._id}`}
                      className="flex items-center gap-1.5"
                    >
                      View Order
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-[#6B6B6B]">You have not placed an order yet.</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/shop">Explore the collection</Link>
                  </Button>
                </div>
              )}
            </section>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#151515]" />
                  <h3 className="font-serif text-base font-bold text-[#151515]">
                    Family Size Book
                  </h3>
                </div>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  Store custom shirt lengths, bust, waist, and trouser measurements for your mother, sisters, or spouse.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Link href="/account/family" className="w-full text-center">
                    Manage Family Measurements
                  </Link>
                </Button>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#151515]" />
                  <h3 className="font-serif text-base font-bold text-[#151515]">
                    Customer Support & Inquiries
                  </h3>
                </div>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  Have questions regarding size alterations, fabric details, or custom order inquiries?
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Link href="/account/complaints/new" className="w-full text-center">
                    Contact Support
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

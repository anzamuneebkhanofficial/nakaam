'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut, clearRoleCookie } from '@/lib/authClient';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  TicketPercent,
  MessageSquare,
  Users,
  Settings,
  Store,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  Bell,
  Search,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: Package },
  { label: 'Products', href: '/admin/products', icon: Layers },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Discounts & Coupons', href: '/admin/sales', icon: TicketPercent },
  { label: 'Customer Support', href: '/admin/complaints', icon: MessageSquare },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Store Settings', href: '/admin/settings', icon: Settings },
];

export function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const { data: blinker } = useQuery({
    queryKey: ['admin', 'blinker-summary'],
    queryFn: async () => {
      try {
        return await apiClient('/admin/orders/stream/blinker');
      } catch {
        return null;
      }
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      } else if (session.user?.role !== 'admin') {
        toast.error('Access restricted: Administrator privileges required.');
        router.replace('/account');
      }
    }
  }, [session, isPending, pathname, router]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-PK', {
          timeZone: 'Asia/Karachi',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      clearRoleCookie();
      await signOut();
      router.replace('/login');
    } catch {
      router.replace('/login');
    }
  };

  const currentNavItem = NAV_ITEMS.find(
    (item) => item.href === pathname || (item.href !== '/admin' && pathname.startsWith(item.href))
  ) || NAV_ITEMS[0];

  if (isPending || !session || session.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F6F2EC] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#151515] border-t-transparent animate-spin" />
        <p className="font-serif text-sm font-semibold text-[#151515]">
          {!isPending && !session ? 'Redirecting to login...' : 'Verifying Admin Access...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F2EC] text-[#151515] flex flex-col lg:flex-row">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-white border-b border-[#E6E1DA] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-[#151515] hover:bg-[#F6F2EC]"
            aria-label="Toggle Navigation"
            aria-expanded={mobileOpen}
            aria-controls="admin-mobile-navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold">ناکام</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#151515] text-white">
              Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-mono font-medium text-[#6B6B6B]">{currentTime} PKT</span>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        id="admin-mobile-navigation"
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-[#E6E1DA] flex flex-col justify-between transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="px-5 py-4 border-b border-[#E6E1DA] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#151515]">ناکام</span>
              <span className="w-2 h-2 rounded-full bg-[#D12C2F]" />
            </div>
            {mobileOpen && (
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#151515]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 flex-1 min-h-0 overflow-y-auto no-scrollbar" aria-label="Admin Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#151515] text-white shadow-xs'
                      : 'text-[#555] hover:bg-[#F6F2EC] hover:text-[#151515]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D12C2F]' : 'text-[#777]'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70 shrink-0" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Bar: Storefront Link & User Info */}
          <div className="p-3 border-t border-[#E6E1DA] space-y-2 bg-[#F6F2EC]/30">
            <Link
              href="/"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#151515] bg-white border border-[#E6E1DA] hover:border-[#151515] hover:bg-[#F6F2EC] transition-all"
            >
              <div className="flex items-center gap-2">
                <Store className="w-3.5 h-3.5 text-[#D12C2F]" />
                <span>Back to Store</span>
              </div>
              <ChevronRight className="w-3 h-3 text-[#6B6B6B]" />
            </Link>

            <div className="p-2.5 rounded-lg bg-white border border-[#E6E1DA] flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#151515] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#151515] truncate">
                    {session?.user?.name || 'Store Admin'}
                  </p>
                  <span className="text-[10px] font-bold text-[#8F1A1E] uppercase tracking-wider block truncate">
                    {session?.user?.role || 'Admin'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out of admin"
                className="p-1 rounded-md text-[#6B6B6B] hover:text-[#D12C2F] hover:bg-[#FCEEEE] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Administrative Workstation Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-[#E6E1DA] sticky top-0 z-30 shadow-xs">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
            <Link href="/admin" className="hover:text-[#151515]">Admin</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#151515] font-semibold">{currentNavItem.label}</span>
          </div>

          {/* Quick Actions & Live Time */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#151515] bg-[#F6F2EC] hover:bg-[#EFEAE2] border border-[#E6E1DA] transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-[#D12C2F]" />
              <span>Back to Store</span>
            </Link>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F6F2EC] border border-[#E6E1DA] text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-[#151515]">System Active</span>
              <span className="text-[#6B6B6B]">&bull;</span>
              <span className="font-mono text-[#6B6B6B]">{currentTime} PKT</span>
            </div>

            <div className="flex items-center gap-3 relative">
              <button
                type="button"
                onClick={() => setBellOpen((prev) => !prev)}
                className={`p-2 rounded-xl transition-colors relative cursor-pointer ${
                  bellOpen
                    ? 'bg-[#151515] text-white'
                    : 'text-[#6B6B6B] hover:text-[#151515] hover:bg-[#F6F2EC]'
                }`}
                title="Pending Orders & Operational Alerts"
                aria-label="Toggle notifications dropdown"
              >
                <Bell className="w-4 h-4" />
                {blinker?.hasActionRequired && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D12C2F] animate-pulse" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {bellOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-[#E6E1DA] rounded-2xl shadow-xl z-50 p-4 space-y-3 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#D12C2F]" />
                      <h4 className="font-bold text-xs text-[#151515]">Operational Alerts</h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#F6F2EC] text-[#6B6B6B]">
                      {(blinker?.unverifiedProofs || 0) + (blinker?.unconfirmedCod || 0)} Pending
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href="/admin/orders?status=awaiting_confirmation"
                      onClick={() => setBellOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#F6F2EC] hover:bg-[#EFEAE2] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Package className="w-4 h-4 text-[#151515]" />
                        <div>
                          <p className="text-xs font-bold text-[#151515]">Unconfirmed COD Orders</p>
                          <p className="text-[11px] text-[#6B6B6B]">Orders awaiting phone confirmation</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#8F1A1E] px-2 py-0.5 rounded-md bg-white border border-[#E6E1DA]">
                        {blinker?.unconfirmedCod || 0}
                      </span>
                    </Link>

                    <Link
                      href="/admin/reconciliation"
                      onClick={() => setBellOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#F6F2EC] hover:bg-[#EFEAE2] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-[#D12C2F]" />
                        <div>
                          <p className="text-xs font-bold text-[#151515]">Unverified Raast Proofs</p>
                          <p className="text-[11px] text-[#6B6B6B]">Direct bank screenshots awaiting audit</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#8F1A1E] px-2 py-0.5 rounded-md bg-white border border-[#E6E1DA]">
                        {blinker?.unverifiedProofs || 0}
                      </span>
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-[#E6E1DA] flex items-center justify-between text-xs">
                    <Link
                      href="/admin/orders"
                      onClick={() => setBellOpen(false)}
                      className="text-[#8F1A1E] font-bold hover:underline flex items-center gap-1"
                    >
                      <span>View All Orders</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setBellOpen(false)}
                      className="text-[#6B6B6B] hover:text-[#151515] font-medium cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

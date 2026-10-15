'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut, clearRoleCookie } from '@/lib/authClient';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import {
  LayoutDashboard,
  Package,
  User,
  Users,
  MapPin,
  Heart,
  Bell,
  MessageSquare,
  ShieldCheck,
  Store,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const USER_NAV_ITEMS = [
  { label: 'User Dashboard', href: '/user', icon: LayoutDashboard },
  { label: 'My Orders', href: '/user/orders', icon: Package },
  { label: 'Profile & Measurements', href: '/user/profile', icon: User },
  { label: 'Family Size Book', href: '/user/family', icon: Users },
  { label: 'Saved Addresses', href: '/user/addresses', icon: MapPin },
  { label: 'Wishlist', href: '/user/wishlist', icon: Heart },
  { label: 'Notifications', href: '/user/notifications', icon: Bell },
  { label: 'Customer Support', href: '/user/complaints', icon: MessageSquare },
  { label: 'Security & Password', href: '/user/security', icon: ShieldCheck },
];

export function UserShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Protect User Dashboard from unauthenticated access
  useEffect(() => {
    if (!isPending) {
      if (!session) {
        const hasSessionCookie =
          typeof document !== 'undefined' &&
          (document.cookie.includes('better-auth.session_token') ||
            document.cookie.includes('__Secure-better-auth.session_token') ||
            document.cookie.includes('better-auth.session_data'));

        if (!hasSessionCookie) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        }
      }
    }
  }, [session, isPending, pathname, router]);

  // Live PKT clock sync (mirroring admin workstation)
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

  // Fetch summary to show unread notifications badge in top bar
  const { data: summary } = useQuery({
    queryKey: ['user-summary-badge'],
    queryFn: async () => {
      try {
        return await apiClient('/me/summary');
      } catch {
        return { unreadNotificationsCount: 0 };
      }
    },
    enabled: Boolean(session),
    staleTime: 30 * 1000,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['user-notifications-popover'],
    queryFn: async () => {
      try {
        const res = await apiClient('/me/notifications');
        return Array.isArray(res) ? res : (res?.data || []);
      } catch {
        return [];
      }
    },
    enabled: Boolean(session && bellOpen),
    refetchInterval: bellOpen ? 5000 : false,
  });

  const handleSignOut = async () => {
    try {
      clearRoleCookie();
      await signOut();
      router.replace('/login');
    } catch {
      router.replace('/login');
    }
  };

  const currentNavItem =
    USER_NAV_ITEMS.find(
      (item) => item.href === pathname || (item.href !== '/user' && pathname.startsWith(item.href))
    ) || USER_NAV_ITEMS[0];

  if (isPending || !session) {
    return (
      <div className="min-h-screen bg-[#F6F2EC] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#151515] border-t-transparent animate-spin" />
        <p className="font-serif text-sm font-semibold text-[#151515]">
          {!isPending && !session ? 'Redirecting to sign in...' : 'Loading User Dashboard...'}
        </p>
      </div>
    );
  }

  const unreadCount = summary?.unreadNotificationsCount || 0;

  return (
    <div className="min-h-screen bg-[#F6F2EC] text-[#151515] flex flex-col lg:flex-row">
      {/* Mobile Top Header Bar */}
      <div className="lg:hidden bg-white border-b border-[#E6E1DA] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-[#151515] hover:bg-[#F6F2EC]"
            aria-label="Toggle Navigation"
            aria-expanded={mobileOpen}
            aria-controls="user-mobile-navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold">ناکام</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#151515] text-white">
              Customer
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/user/notifications"
            className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#151515] relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D12C2F]" />
            )}
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-medium text-[#6B6B6B]">{currentTime} PKT</span>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation (Exact Match to Admin Dashboard UI) */}
      <aside
        id="user-mobile-navigation"
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
          <nav className="p-3 space-y-1 flex-1 min-h-0 overflow-y-auto no-scrollbar" aria-label="User Navigation">
            {USER_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/user'
                  ? pathname === '/user'
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

          {/* Bottom Bar: Back to Store & Customer Identity */}
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
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#151515] truncate">
                    {session?.user?.name || 'Customer'}
                  </p>
                  <span className="text-[10px] font-bold text-[#8F1A1E] uppercase tracking-wider block truncate">
                    {session?.user?.role === 'admin' ? 'Administrator' : 'Valued Patron'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                title="Sign Out"
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

      {/* Main Workstation / Dashboard Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header Bar (Matching Admin Dashboard) */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-[#E6E1DA] sticky top-0 z-30 shadow-xs">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
            <Link href="/user" className="hover:text-[#151515]">User</Link>
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
              <span className="font-medium text-[#151515]">Patron Session Active</span>
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
                title="Notifications & Updates"
                aria-label="Toggle notifications dropdown"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D12C2F]" />
                )}
              </button>

              {bellOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E6E1DA] rounded-2xl shadow-xl z-50 p-4 space-y-3 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#D12C2F]" />
                      <h4 className="font-bold text-xs text-[#151515]">Patron Notifications</h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#F6F2EC] text-[#6B6B6B]">
                      {unreadCount} Unread
                    </span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 3).map((notif) => (
                        <Link
                          key={notif._id}
                          href={notif.link || '/user/notifications'}
                          onClick={() => setBellOpen(false)}
                          className={`block p-2.5 rounded-xl border transition-colors ${
                            notif.readAt
                              ? 'bg-white border-[#E6E1DA] hover:bg-[#F6F2EC]'
                              : 'bg-[#FCEEEE]/50 border-[#F5C2C4] hover:bg-[#FCEEEE]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-[#151515] truncate">{notif.title}</p>
                            {!notif.readAt && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D12C2F] flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-[#6B6B6B] truncate mt-0.5">{notif.body}</p>
                        </Link>
                      ))
                    ) : (
                      <div className="py-2 text-center text-xs text-[#6B6B6B]">
                        No new notifications
                      </div>
                    )}

                    <Link
                      href="/user/orders"
                      onClick={() => setBellOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#F6F2EC] hover:bg-[#EFEAE2] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Package className="w-4 h-4 text-[#151515]" />
                        <div>
                          <p className="text-xs font-bold text-[#151515]">Orders & Exchanges</p>
                          <p className="text-[11px] text-[#6B6B6B]">Track parcels & view cutting slips</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#6B6B6B]" />
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-[#E6E1DA] flex items-center justify-between text-xs">
                    <Link
                      href="/user/notifications"
                      onClick={() => setBellOpen(false)}
                      className="text-[#8F1A1E] font-bold hover:underline"
                    >
                      View All Alerts
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

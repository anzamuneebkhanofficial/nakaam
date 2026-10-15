'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, clearRoleCookie } from '@/lib/authClient';
import {
  User,
  MapPin,
  Users,
  Package,
  Heart,
  Bell,
  MessageSquare,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', href: '/account', icon: LayoutDashboard },
  { label: 'My Profile', href: '/account/profile', icon: User },
  { label: 'Saved Family Sizes', href: '/account/family', icon: Users },
  { label: 'Saved Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'My Orders', href: '/account/orders', icon: Package },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
  { label: 'Notifications', href: '/account/notifications', icon: Bell },
  { label: 'Customer Support', href: '/account/complaints', icon: MessageSquare },
  { label: 'Security & Password', href: '/account/security', icon: ShieldCheck },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      clearRoleCookie();
      await signOut();
      router.replace('/login');
    } catch {
      router.replace('/login');
    }
  };

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 bg-white rounded-2xl border border-[#E6E1DA] p-3 shadow-xs">
      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0" aria-label="Account Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#151515] text-white shadow-xs'
                  : 'text-[#3A3A3A] hover:text-[#151515] hover:bg-[#F6F2EC]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6B6B6B]'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#8F1A1E] hover:bg-[#FCEEEE] transition-all cursor-pointer mt-2 border-t border-[#E6E1DA] pt-3 text-left w-full"
        >
          <LogOut className="w-4 h-4 text-[#8F1A1E]" />
          <span>Sign Out</span>
        </button>
      </nav>
    </aside>
  );
}

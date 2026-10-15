'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrandLogo } from '../shared/BrandLogo';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  LayoutDashboard,
  Layers,
  Package,
  LogOut,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useCart } from '@/lib/cartContext';
import { useSession, signOut, getSessionStatus, clearRoleCookie } from '@/lib/authClient';
import { useWishlist } from '@/lib/useWishlist';

const BASE_SECTIONS = [
  { id: 'women', label: 'Women', href: '/shop?audience=women' },
  { id: 'men', label: 'Men', href: '/shop?audience=men' },
  { id: 'kids', label: 'Kids', href: '/shop?audience=kids' },
  { id: 'footwear', label: 'Footwear', href: '/shop?audience=footwear' },
  { id: 'home', label: 'Bedding & Home', href: '/shop?audience=home' },
  { id: 'collections', label: 'Collections', href: '/shop?audience=collections' },
];


export function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeNavDropdown, setActiveNavDropdown] = useState(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState(null);
  const menuRef = useRef(null);

  const pathname = usePathname();
  const { itemCount, cartStatus, isAuthenticated: hasCartSession, openDrawer } = useCart();
  const { data: session, isPending } = useSession();
  const { wishlistCount, isCountReady: isWishlistCountReady } = useWishlist();
  const activeCartCount =
    getSessionStatus({ session, isPending }) === 'authenticated' &&
    hasCartSession &&
    cartStatus === 'ready'
      ? itemCount
      : null;

  const authStatus = getSessionStatus({ session, isPending });
  const role = session?.user?.role || 'user';
  const isAdmin = role === 'admin';
  const userName = session?.user?.name || (isAdmin ? 'Admin' : 'Customer');

  // Fetch real categories dynamically from backend
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await apiClient('/categories');
        return Array.isArray(res) ? res : res?.data || res?.items || [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  // Construct dynamic navigation menu from real categories
  const navMenu = React.useMemo(() => {
    const list = BASE_SECTIONS.map((sec) => {
      const sectionCats = categories.filter((c) => c.audience === sec.id);

      if (sec.id === 'collections') {
        const defaultItems = [
          { label: 'All Collections', href: '/shop' },
          { label: 'Summer Collection', href: '/shop?season=summer' },
          { label: 'Winter Collection', href: '/shop?season=winter' },
          { label: 'Eid Festive Collection', href: '/shop?occasion=eid' },
        ];
        const existingLabels = new Set(defaultItems.map((i) => i.label.toLowerCase().trim()));
        const customCatItems = sectionCats
          .filter((cat) => !existingLabels.has(cat.name?.toLowerCase().trim()))
          .map((cat) => ({
            label: cat.name,
            href: `/shop?category=${cat.slug}`,
          }));

        return {
          id: sec.id,
          label: sec.label,
          href: sec.href,
          items: [...defaultItems, ...customCatItems],
        };
      }

      const items = sectionCats.length > 0
        ? [
            { label: `All ${sec.label}`, href: sec.href },
            ...sectionCats.map((cat) => ({
              label: cat.name,
              href: `/shop?audience=${sec.id}&category=${cat.slug}`,
            })),
          ]
        : [];

      return {
        id: sec.id,
        label: sec.label,
        href: sec.href,
        items,
      };
    });

    list.push({
      id: 'sale',
      label: 'Sale',
      href: '/sale',
      isSpecial: true,
      items: [],
    });

    return list;
  }, [categories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      clearRoleCookie();
      await signOut();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EAE5DD] transition-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              className="lg:hidden p-2 -ml-2 text-[#141413] hover:text-[#B82A2E] focus:outline-none cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <BrandLogo />
          </div>

          {/* Center: Desktop Navigation Bar with Submenus */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-9" aria-label="Main Navigation">
            {navMenu.map((item) => {
              const isActive = pathname === item.href;
              const hasSubmenu = item.items && item.items.length > 0;

              if (item.isSpecial) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold tracking-wide rounded-full bg-[#FDF2F2] text-[#8A1A1E] hover:bg-[#FCE5E5] transition-colors border border-[#F5C2C4]"
                  >
                    Sale
                  </Link>
                );
              }

              return (
                <div
                  key={item.label}
                  className="relative group py-2"
                  onMouseEnter={() => hasSubmenu && setActiveNavDropdown(item.label)}
                  onMouseLeave={() => setActiveNavDropdown(null)}
                  onFocus={() => hasSubmenu && setActiveNavDropdown(item.label)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setActiveNavDropdown(null);
                    }
                  }}
                >
                  <Link
                    href={item.href}
                    aria-expanded={hasSubmenu ? activeNavDropdown === item.label : undefined}
                    className={`inline-flex items-center gap-1.5 text-[13px] font-medium tracking-normal transition-colors py-1 relative ${
                      isActive
                        ? 'text-[#141413] font-semibold'
                        : 'text-[#4A4742] hover:text-[#141413]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {hasSubmenu && (
                      <ChevronDown className="w-3.5 h-3.5 text-[#A6A095] group-hover:text-[#141413] transition-transform duration-200 group-hover:rotate-180" />
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#141413] rounded-full" />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {hasSubmenu && (() => {
                    const isWide = item.items.length > 7;
                    const isRightAligned = item.id === 'collections' || item.id === 'home';
                    return (
                      <div
                        className={`absolute ${isRightAligned ? 'right-0' : 'left-0'} top-full mt-1 ${
                          isWide ? 'w-[440px] p-3' : 'w-52 p-2'
                        } rounded-xl bg-white border border-[#EAE5DD] shadow-[0_8px_30px_rgba(20,20,19,0.08)] z-50 transition-all duration-150 ${
                          activeNavDropdown === item.label
                            ? 'opacity-100 visible translate-y-0'
                            : 'opacity-0 invisible -translate-y-1'
                        }`}
                      >
                        <div className={isWide ? 'grid grid-cols-2 gap-1 py-1' : 'py-1 space-y-0.5'}>
                          {item.items.map((sub, idx) => (
                            <Link
                              key={`${sub.label}-${sub.href}-${idx}`}
                              href={sub.href}
                              onClick={() => setActiveNavDropdown(null)}
                              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-[#4A4742] hover:text-[#141413] hover:bg-[#FAF8F5] rounded-lg transition-colors"
                            >
                              <span className="truncate">{sub.label}</span>
                              {sub.badge && (
                                <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FDF2F2] text-[#8A1A1E] shrink-0">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                        {isWide && (
                          <div className="pt-2 mt-1 border-t border-[#EAE5DD] flex items-center justify-between px-2 text-[11px]">
                            <span className="text-[#78736B]">{item.items.length} categories</span>
                            <Link
                              href={item.href}
                              onClick={() => setActiveNavDropdown(null)}
                              className="font-semibold text-[#B82A2E] hover:underline"
                            >
                              View All {item.label} &rarr;
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </nav>

          {/* Right: Actions (Search, Wishlist, Bag, Role-Aware Profile) */}
          <div className="flex items-center gap-1 sm:gap-3.5">
            <Link
              href="/search"
              className="p-2 text-[#3A3A3A] hover:text-[#151515] transition-colors rounded-full hover:bg-[#EFEAE2]"
              aria-label="Search catalog"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Link
              href="/account/wishlist"
              className="p-2 text-[#3A3A3A] hover:text-[#151515] transition-colors rounded-full hover:bg-[#EFEAE2] relative hidden sm:inline-flex"
              aria-label={isWishlistCountReady ? `Wishlist${wishlistCount ? `, ${wishlistCount} items` : ''}` : 'Wishlist'}
            >
              <Heart className="w-5 h-5" />
              {isWishlistCountReady && wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#151515] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={openDrawer}
              className="p-2 text-[#151515] hover:text-[#D12C2F] transition-colors rounded-full hover:bg-[#EFEAE2] relative inline-flex items-center gap-1.5 cursor-pointer"
              aria-label={cartStatus === 'error' ? 'Shopping bag unavailable' : 'Shopping Bag'}
            >
              <ShoppingBag className="w-5 h-5" />
              {activeCartCount > 0 ? (
                <span className="w-5 h-5 rounded-full bg-[#D12C2F] text-white text-xs font-bold flex items-center justify-center">
                  {activeCartCount}
                </span>
              ) : cartStatus === 'error' && hasCartSession ? (
                <span className="w-5 h-5 rounded-full bg-[#78736B] text-white text-xs font-bold flex items-center justify-center" aria-label="Unavailable">
                  !
                </span>
              ) : null}
            </button>

            {/* Profile & Dashboard Trigger */}
            {authStatus === 'initializing' ? (
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full border border-[#E6E1DA] bg-white text-xs font-semibold text-[#6B6B6B] shadow-2xs">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-[#151515] border-t-transparent animate-spin" />
                <span className="hidden sm:inline">Checking session</span>
              </div>
            ) : !session ? (
              <Link
                href="/login"
                aria-label="Sign in"
                className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full border border-[#E6E1DA] bg-white text-xs font-semibold text-[#151515] hover:bg-[#EFEAE2] transition-colors shadow-2xs"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-[#E6E1DA] bg-white hover:bg-[#EFEAE2] transition-all cursor-pointer shadow-2xs"
                  aria-expanded={userMenuOpen}
                  aria-label="Open User Menu"
                >
                  {isAdmin ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#151515] text-white">
                      Admin
                    </span>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#8F1A1E] text-white text-[10px] font-bold flex items-center justify-center">
                      {userName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-xs font-bold text-[#151515] max-w-[90px] truncate hidden sm:inline">
                    {userName.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B6B6B]" />
                </button>

                {/* Role-Specific Dropdown Menu (Clean English) */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-[#E6E1DA] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-[#E6E1DA]/60">
                      <p className="text-xs font-bold text-[#151515] truncate">{session.user.name}</p>
                      <p className="text-[11px] text-[#6B6B6B] truncate">{session.user.email}</p>
                      <span className={`inline-block mt-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${
                        isAdmin ? 'bg-[#151515] text-white' : 'bg-[#FCEEEE] text-[#8F1A1E]'
                      }`}>
                        {isAdmin ? 'Admin' : 'Customer'}
                      </span>
                    </div>

                    <div className="py-1">
                      {isAdmin ? (
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#151515] hover:bg-[#F6F2EC]"
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#6B6B6B]" />
                            Admin Dashboard
                          </Link>
                          <Link
                            href="/admin/products"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#151515] hover:bg-[#F6F2EC]"
                          >
                            <Layers className="w-4 h-4 text-[#6B6B6B]" />
                            Products
                          </Link>
                          <Link
                            href="/admin/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#151515] hover:bg-[#F6F2EC]"
                          >
                            <Package className="w-4 h-4 text-[#6B6B6B]" />
                            Orders
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/user"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#151515] hover:bg-[#F6F2EC]"
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#6B6B6B]" />
                            User Dashboard
                          </Link>
                          <Link
                            href="/user/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#151515] hover:bg-[#F6F2EC]"
                          >
                            <Package className="w-4 h-4 text-[#6B6B6B]" />
                            My Orders
                          </Link>
                          <Link
                            href="/user/wishlist"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#151515] hover:bg-[#F6F2EC]"
                          >
                            <Heart className="w-4 h-4 text-[#6B6B6B]" />
                            Wishlist
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-[#E6E1DA]/60 pt-1">
                      <a
                        href="https://muhammadanzamuneebkhan.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-2 text-[11px] font-medium text-[#6B6B6B] hover:text-[#151515] hover:bg-[#F6F2EC]"
                      >
                        <span>Created by Anza Muneeb</span>
                        <span className="text-[10px] text-[#8F1A1E] font-semibold">Portfolio &rarr;</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleSignOut();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#8F1A1E] hover:bg-[#FCEEEE] cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-[#8F1A1E]" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown */}
      <div
        id="mobile-navigation"
        hidden={!mobileMenuOpen}
        className={`lg:hidden border-t border-[#E6E1DA] bg-[#F6F2EC] px-6 py-6 space-y-6 ${
          mobileMenuOpen ? 'animate-in slide-in-from-top-4 duration-200' : 'hidden'
        }`}
      >
          <nav className="flex flex-col space-y-2" aria-label="Mobile Navigation">
            {navMenu.map((item) => {
              const hasSubmenu = item.items && item.items.length > 0;
              const isSubmenuOpen = openMobileSubmenu === item.label;

              if (item.isSpecial) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-bold text-[#D12C2F] py-2 flex items-center justify-between border-b border-[#E6E1DA]/60"
                  >
                    <span>Sale</span>
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#FCEEEE] text-[#8F1A1E]">
                      Sale
                    </span>
                  </Link>
                );
              }

              return (
                <div key={item.label} className="border-b border-[#E6E1DA]/60 pb-1">
                  <div className="flex items-center justify-between py-2">
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-medium text-[#151515] hover:text-[#D12C2F]"
                    >
                      {item.label}
                    </Link>
                    {hasSubmenu && (
                      <button
                        type="button"
                        onClick={() => setOpenMobileSubmenu(isSubmenuOpen ? null : item.label)}
                        className="p-1 text-[#6B6B6B]"
                        aria-label={`Toggle ${item.label} subcategories`}
                        aria-expanded={isSubmenuOpen}
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isSubmenuOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  {hasSubmenu && isSubmenuOpen && (
                    <div className="pl-4 pb-2 space-y-1.5">
                      {item.items.map((sub, idx) => (
                        <Link
                          key={`${sub.label}-${sub.href}-${idx}`}
                          href={sub.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-sm text-[#4A4A4A] hover:text-[#151515] py-1"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="pt-2 flex flex-col gap-3">
            {!session ? (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-sm font-semibold text-[#151515] py-2"
              >
                <User className="w-4 h-4" /> Sign In / Register
              </Link>
            ) : isAdmin ? (
              <>
                <div className="flex items-center justify-between py-1 border-b border-[#E6E1DA]/60">
                  <span className="text-xs font-bold text-[#151515]">{session.user.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#151515] text-white">Admin</span>
                </div>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-medium text-[#3A3A3A] hover:text-[#151515] py-2"
                >
                  <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-3 text-sm font-semibold text-[#8F1A1E] py-2 text-left"
                >
                  <LogOut className="w-4 h-4 text-[#8F1A1E]" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between py-1 border-b border-[#E6E1DA]/60">
                  <span className="text-xs font-bold text-[#151515]">{session.user.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FCEEEE] text-[#8F1A1E]">Customer</span>
                </div>
                <Link
                  href="/user"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-medium text-[#3A3A3A] hover:text-[#151515] py-2"
                >
                  <LayoutDashboard className="w-4 h-4" /> User Dashboard
                </Link>
                <Link
                  href="/user/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-medium text-[#3A3A3A] hover:text-[#151515] py-2"
                >
                  <Package className="w-4 h-4" /> My Orders
                </Link>
                <Link
                  href="/user/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-medium text-[#3A3A3A] hover:text-[#151515] py-2"
                >
                  <Heart className="w-4 h-4" /> Wishlist{isWishlistCountReady ? ` (${wishlistCount || 0})` : ''}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-3 text-sm font-semibold text-[#8F1A1E] py-2 text-left"
                >
                  <LogOut className="w-4 h-4 text-[#8F1A1E]" /> Sign Out
                </button>
              </>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E6E1DA] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#D12C2F] shrink-0" />
              <p className="text-xs text-[#3A3A3A]">
                <strong>Doorstep Inspection:</strong> Open and inspect parcel before COD handoff.
              </p>
            </div>
          </div>

          <div className="pt-2 pb-1 text-center">
            <a
              href="https://muhammadanzamuneebkhan.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#6B6B6B] hover:text-[#151515] transition-colors font-medium"
            >
              <span>Designed &amp; Engineered by</span>
              <span className="font-semibold text-[#151515] underline decoration-[#D12C2F]/50">
                Muhammad Anza Muneeb Khan
              </span>
            </a>
          </div>
        </div>
    </header>
  );
}

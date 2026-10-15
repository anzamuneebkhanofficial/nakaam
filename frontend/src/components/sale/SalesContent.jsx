'use client';

import React, { useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/shared/ProductCard';
import { ProductCardSkeleton } from '@/components/shared/ProductCardSkeleton';
import { Pagination } from '@/components/shared/Pagination';
import { apiClient } from '@/lib/apiClient';
import {
  Tag,
  Percent,
  Sparkles,
  ShoppingBag,
  SlidersHorizontal,
  ChevronRight,
  Flame,
} from 'lucide-react';

const AUDIENCES = [
  { id: 'all', label: 'All Departments' },
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
  { id: 'kids', label: 'Kids' },
  { id: 'footwear', label: 'Footwear' },
  { id: 'home', label: 'Bedding & Home' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest Marked Down' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'rating', label: 'Highest Rated' },
];

export function SalesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentAudience = searchParams.get('audience') || 'all';
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  // Build query string enforcing isSale=true and 15 items per page
  const queryParams = new URLSearchParams();
  queryParams.set('isSale', 'true');
  queryParams.set('limit', '15');
  queryParams.set('page', String(currentPage));
  if (currentAudience && currentAudience !== 'all') {
    queryParams.set('audience', currentAudience);
  }
  if (currentCategory) {
    queryParams.set('category', currentCategory);
  }
  if (currentSort) {
    queryParams.set('sort', currentSort);
  }

  const { data: salesResult, isLoading, isError } = useQuery({
    queryKey: ['products', 'sales', queryParams.toString()],
    queryFn: async () => {
      try {
        const res = await apiClient(`/products?${queryParams.toString()}`);
        const items = Array.isArray(res) ? res : res?.items || [];
        const paginationMeta = res?.pagination || res?.meta || {
          page: currentPage,
          totalPages: Math.ceil(items.length / 15) || 1,
          total: items.length,
          limit: 15,
        };
        return {
          items,
          pagination: {
            page: Number(paginationMeta.page) || currentPage,
            totalPages: Number(paginationMeta.totalPages) || 1,
            total: Number(paginationMeta.total) || items.length,
            limit: Number(paginationMeta.limit) || 15,
          },
        };
      } catch {
        return {
          items: [],
          pagination: { page: 1, totalPages: 1, total: 0, limit: 15 },
        };
      }
    },
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });

  const products = salesResult?.items || [];
  const pagination = salesResult?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 15,
  };

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 on filter or sort change
    if (key !== 'page') {
      params.delete('page');
    }
    startTransition(() => {
      router.push(`/sale?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage) => {
    updateParam('page', String(newPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#141413]">
      {/* 1. Global Announcement */}
      <AnnouncementBar />

      {/* 2. Global Header */}
      <Header />

      <main className="flex-1 pb-16">
        {/* Editorial Sale Hero Banner */}
        <div className="border-b border-[#EAE5DD] bg-gradient-to-b from-[#FDF2F2]/60 to-[#FAF8F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-[#78736B] mb-4" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#141413] transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 text-[#78736B]" />
              <span className="text-[#B82A2E] font-semibold">Special Offers &amp; Sale</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B82A2E]/10 border border-[#B82A2E]/20 text-[#B82A2E] text-xs font-bold uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 fill-[#B82A2E]" />
                  <span>Curated Markdown Catalog</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#141413]">
                  Special Offers &amp; Seasonal Markdowns
                </h1>
                <p className="text-sm sm:text-base text-[#78736B] leading-relaxed">
                  Authentic seasonal reductions across handcrafted unstitched lawn, tailored kurtas, footwear, and pure cotton bed linens. Every discount is verified with honest pricing.
                </p>
              </div>

              {/* Verified Count Badge */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-[#EAE5DD] shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-[#FAF0F0] text-[#B82A2E] flex items-center justify-center shrink-0">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[#A6A095]">Active Eligible Items</p>
                  <p className="text-base font-bold font-mono text-[#141413]">
                    {pagination.total.toLocaleString()} Products on Sale
                  </p>
                </div>
              </div>
            </div>

            {/* Department Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-6 no-scrollbar">
              {AUDIENCES.map((aud) => {
                const isActive = currentAudience === aud.id;
                return (
                  <button
                    key={aud.id}
                    type="button"
                    onClick={() => updateParam('audience', aud.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#B82A2E] text-white shadow-xs'
                        : 'bg-white text-[#4A4742] border border-[#EAE5DD] hover:border-[#141413] hover:text-[#141413]'
                    }`}
                  >
                    {aud.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Controls & Sorting Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE5DD]">
            <p className="text-xs text-[#78736B]">
              Showing <strong className="text-[#141413]">{products.length}</strong> of{' '}
              <strong className="text-[#141413]">{pagination.total}</strong> products on sale (15 per page)
            </p>

            <div className="flex items-center gap-3">
              <label htmlFor="sales-sort" className="text-xs font-semibold text-[#78736B]">
                Sort by:
              </label>
              <select
                id="sales-sort"
                value={currentSort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[#EAE5DD] bg-white text-xs font-medium text-[#141413] focus:outline-none focus:border-[#141413] cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid / Loading / Empty State */}
          <div className="pt-8">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {Array.from({ length: 15 }).map((_, idx) => (
                  <ProductCardSkeleton key={`sale-skeleton-${idx}`} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 px-4 rounded-xl bg-white border border-[#EAE5DD] max-w-2xl mx-auto my-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF0F0] text-[#B82A2E] flex items-center justify-center mx-auto">
                  <Tag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#141413]">
                  No products are currently on sale
                </h3>
                <p className="text-xs sm:text-sm text-[#78736B] max-w-md mx-auto leading-relaxed">
                  There are no products with an active sale matching your selected filters. Explore our complete handcrafted catalog in the main shop.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-[#141413] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
                  >
                    Browse Full Shop Catalog
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id || product.id}
                      product={product}
                      priority={false}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="pt-6 border-t border-[#E6E1DA] flex justify-center">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

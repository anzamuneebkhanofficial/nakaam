'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/shared/ProductCard';
import { ProductCardSkeleton } from '@/components/shared/ProductCardSkeleton';
import { Pagination } from '@/components/shared/Pagination';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/apiClient';
import {
  Filter,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  ChevronDown,
  Check,
  Tag,
  Layers,
} from 'lucide-react';

const AUDIENCES = [
  { id: 'all', label: 'All Departments' },
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
  { id: 'kids', label: 'Kids' },
  { id: 'footwear', label: 'Footwear' },
  { id: 'home', label: 'Bedding & Home' },
  { id: 'collections', label: 'Collections' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest Arrivals' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'rating', label: 'Highest Rated' },
];

export function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentAudience = searchParams.get('audience') || 'all';
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentFabric = searchParams.get('fabric') || '';
  const currentOccasion = searchParams.get('occasion') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch real categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await apiClient('/categories');
        return Array.isArray(res) ? res : res?.items || [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  // Categories matching current audience
  const audienceCategories = useMemo(() => {
    if (currentAudience === 'all') {
      return categories;
    }
    return categories.filter((c) => c.audience === currentAudience);
  }, [categories, currentAudience]);

  // Find active category label
  const activeCategoryObj = useMemo(() => {
    if (!currentCategory) return null;
    return categories.find(
      (c) =>
        c.slug?.toLowerCase() === currentCategory.toLowerCase() ||
        c._id === currentCategory
    );
  }, [categories, currentCategory]);

  const activeCategoryName =
    activeCategoryObj?.name ||
    (currentCategory ? currentCategory.replace(/-/g, ' ') : '');

  // Fetch Facets (available fabrics, occasions, prices)
  const { data: facets } = useQuery({
    queryKey: ['products', 'facets'],
    queryFn: async () => {
      try {
        return await apiClient('/products/facets');
      } catch {
        return {
          audiences: [],
          fabrics: [],
          occasions: [],
          priceRange: { min: 0, max: 0 },
        };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Products based on search params (Enforce 12 items per page)
  const queryParams = new URLSearchParams(searchParams.toString());
  if (!queryParams.has('limit')) {
    queryParams.set('limit', '12');
  }
  const queryString = queryParams.toString();

  const { data: catalogResult, isLoading } = useQuery({
    queryKey: ['products', 'shop', queryString],
    queryFn: async () => {
      try {
        const queryUrl = `/products?${queryString}`;
        const res = await apiClient(queryUrl);
        const items = Array.isArray(res) ? res : res?.items || [];
        const paginationMeta = res?.pagination || res?.meta || {
          page: currentPage,
          totalPages: 1,
          total: items.length,
          limit: 12,
        };
        return {
          items,
          pagination: {
            page: Number(paginationMeta.page) || currentPage,
            totalPages: Number(paginationMeta.totalPages) || 1,
            total: Number(paginationMeta.total) || items.length,
            limit: Number(paginationMeta.limit) || 12,
          },
        };
      } catch {
        return {
          items: [],
          pagination: { page: 1, totalPages: 1, total: 0, limit: 12 },
        };
      }
    },
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });

  const products = catalogResult?.items || [];
  const pagination = catalogResult?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 12,
  };

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // If changing audience, reset category if it's not in the new audience
    if (key === 'audience' && value !== 'all' && currentCategory) {
      const matchInNewAud = categories.some(
        (c) =>
          c.audience === value &&
          (c.slug === currentCategory || c._id === currentCategory)
      );
      if (!matchInNewAud) {
        params.delete('category');
      }
    }

    // Reset to page 1 whenever filters change
    params.set('page', '1');

    startTransition(() => {
      router.push(`/shop?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    if (!params.has('limit')) {
      params.set('limit', '12');
    }

    startTransition(() => {
      router.push(`/shop?${params.toString()}`);
    });

    // Smooth scroll to top of catalog
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push('/shop');
    });
  };

  const hasActiveFilters =
    currentAudience !== 'all' ||
    Boolean(currentCategory) ||
    Boolean(currentFabric) ||
    Boolean(currentOccasion) ||
    Boolean(currentMinPrice) ||
    Boolean(currentMaxPrice);

  const activeAudienceMeta = AUDIENCES.find((a) => a.id === currentAudience);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#141413]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb & Header */}
        <div className="border-b border-[#EAE5DD] pb-6 mb-8">
          <nav
            className="text-xs text-[#78736B] mb-2 flex items-center gap-1.5"
            aria-label="Breadcrumb"
          >
            <button
              type="button"
              onClick={() => router.push('/')}
              className="hover:text-[#141413] cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => router.push('/shop')}
              className="hover:text-[#141413] cursor-pointer"
            >
              Shop
            </button>
            {currentAudience !== 'all' && (
              <>
                <span>/</span>
                <span className="text-[#4A4742] font-medium">
                  {activeAudienceMeta?.label}
                </span>
              </>
            )}
            {activeCategoryName && (
              <>
                <span>/</span>
                <span className="text-[#141413] font-semibold">
                  {activeCategoryName}
                </span>
              </>
            )}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold font-jakarta text-[#141413] tracking-tight">
                {activeCategoryName
                  ? activeCategoryName
                  : currentAudience === 'all'
                  ? 'All Products'
                  : activeAudienceMeta?.label || 'Products'}
              </h1>
              <p className="text-xs sm:text-sm text-[#78736B] mt-1 font-normal">
                Authentic Pakistani textiles photographed under natural daylight. Doorstep inspection permitted before payment.
              </p>
            </div>

            {/* Sort & Mobile Filter Trigger */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden h-10 px-4 rounded-xl border border-[#EAE5DD] bg-white text-xs font-medium flex items-center gap-2 hover:bg-[#FAF8F5] cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#B82A2E]" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B82A2E]" />
                )}
              </button>

              <div className="relative">
                <select
                  value={currentSort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="h-10 pl-3.5 pr-9 rounded-xl border border-[#EAE5DD] bg-white text-xs font-medium text-[#141413] appearance-none focus:outline-none focus:border-[#141413] cursor-pointer shadow-xs"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#78736B] absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout: Filter Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
            <div className="p-5 rounded-xl bg-white border border-[#EAE5DD] space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DD]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#141413] flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#B82A2E]" /> Filters
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs text-[#8A1A1E] font-medium hover:underline cursor-pointer"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Department */}
              <div>
                <p className="text-[11px] font-semibold uppercase text-[#78736B] mb-2">
                  Department
                </p>
                <div className="flex flex-col space-y-1">
                  {AUDIENCES.map((a) => {
                    const isSelected = currentAudience === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => updateParam('audience', a.id)}
                        className={`text-left text-xs px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#141413] text-white font-semibold'
                            : 'text-[#4A4742] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <span>{a.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categories for Selected Audience */}
              {audienceCategories.length > 0 && (
                <div className="pt-2 border-t border-[#EAE5DD]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-semibold uppercase text-[#78736B]">
                      Categories
                    </p>
                    {currentCategory && (
                      <button
                        type="button"
                        onClick={() => updateParam('category', '')}
                        className="text-[11px] text-[#8A1A1E] hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col space-y-0.5 max-h-56 overflow-y-auto pr-1">
                    {audienceCategories.map((cat) => {
                      const isSelected =
                        currentCategory.toLowerCase() ===
                          cat.slug?.toLowerCase() ||
                        currentCategory === cat._id;
                      return (
                        <button
                          key={cat.slug || cat._id}
                          type="button"
                          onClick={() =>
                            updateParam(
                              'category',
                              isSelected ? '' : cat.slug || cat._id
                            )
                          }
                          className={`text-left text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#B82A2E] text-white font-semibold'
                              : 'text-[#4A4742] hover:bg-[#FAF8F5]'
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          {isSelected && <Check className="w-3 h-3 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </aside>

          {/* Product Grid Area (9 cols) */}
          <div className="lg:col-span-9 flex flex-col justify-between">
            {/* Active Filters Bar */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-white border border-[#E6E1DA]">
                <span className="text-xs text-[#8E8B85] font-semibold mr-1">
                  Active Filters:
                </span>

                {currentAudience !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F6F2EC] border border-[#E6E1DA] text-xs font-medium text-[#151515]">
                    Dept: {activeAudienceMeta?.label}
                    <button
                      type="button"
                      onClick={() => updateParam('audience', 'all')}
                      className="hover:text-[#D12C2F] cursor-pointer"
                      aria-label="Remove department filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {activeCategoryName && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FCEEEE] border border-[#F8DADA] text-xs font-medium text-[#8F1A1E]">
                    Category: {activeCategoryName}
                    <button
                      type="button"
                      onClick={() => updateParam('category', '')}
                      className="hover:text-black cursor-pointer"
                      aria-label="Remove category filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {currentFabric && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F6F2EC] border border-[#E6E1DA] text-xs font-medium text-[#151515]">
                    Fabric: {currentFabric}
                    <button
                      type="button"
                      onClick={() => updateParam('fabric', '')}
                      className="hover:text-[#D12C2F] cursor-pointer"
                      aria-label="Remove fabric filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {currentOccasion && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F6F2EC] border border-[#E6E1DA] text-xs font-medium text-[#151515]">
                    Occasion: {currentOccasion}
                    <button
                      type="button"
                      onClick={() => updateParam('occasion', '')}
                      className="hover:text-[#D12C2F] cursor-pointer"
                      aria-label="Remove occasion filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-[#8F1A1E] font-semibold hover:underline ml-auto cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} isHome={currentAudience === 'home'} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((p, idx) => (
                    <ProductCard key={p._id || p.slug} product={p} priority={idx < 4} />
                  ))}
                </div>

                {/* Numbered Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  pageSize={12}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <div className="p-12 sm:p-16 text-center rounded-2xl bg-white border border-[#E6E1DA] space-y-4">
                <Layers className="w-10 h-10 text-[#6B6B6B] mx-auto opacity-40" />
                <h3 className="text-lg font-bold font-jakarta text-[#151515]">
                  {activeCategoryName
                    ? `No products found in "${activeCategoryName}"`
                    : 'No products match your current filters'}
                </h3>
                <p className="text-xs text-[#6B6B6B] max-w-sm mx-auto leading-relaxed">
                  {activeCategoryName
                    ? `We are currently restocking ${activeCategoryName}. Try viewing other categories in ${activeAudienceMeta?.label || 'our catalogue'}.`
                    : 'Try clearing some of your filters to discover more items.'}
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  {currentCategory && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateParam('category', '')}
                    >
                      View All {activeAudienceMeta?.label || 'Products'}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={clearAllFilters}>
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 right-0 max-w-full w-80 bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E6E1DA]">
                <h3 className="text-base font-bold font-jakarta text-[#151515]">
                  Filters
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-[#6B6B6B] hover:text-[#151515]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Department */}
              <div>
                <p className="text-xs font-bold uppercase text-[#6B6B6B] mb-2.5">
                  Department
                </p>
                <div className="flex flex-col space-y-1">
                  {AUDIENCES.map((a) => {
                    const isSelected = currentAudience === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => updateParam('audience', a.id)}
                        className={`text-left text-xs px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#151515] text-white font-semibold'
                            : 'text-[#3A3A3A] hover:bg-[#F6F2EC]'
                        }`}
                      >
                        <span>{a.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categories */}
              {audienceCategories.length > 0 && (
                <div className="pt-2 border-t border-[#E6E1DA]">
                  <p className="text-xs font-bold uppercase text-[#6B6B6B] mb-2.5">
                    Categories
                  </p>
                  <div className="flex flex-col space-y-1 max-h-48 overflow-y-auto">
                    {audienceCategories.map((cat) => {
                      const isSelected =
                        currentCategory.toLowerCase() ===
                          cat.slug?.toLowerCase() ||
                        currentCategory === cat._id;
                      return (
                        <button
                          key={cat.slug || cat._id}
                          type="button"
                          onClick={() =>
                            updateParam(
                              'category',
                              isSelected ? '' : cat.slug || cat._id
                            )
                          }
                          className={`text-left text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#D12C2F] text-white font-semibold'
                              : 'text-[#3A3A3A] hover:bg-[#F6F2EC]'
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          {isSelected && <Check className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            <div className="pt-6 border-t border-[#E6E1DA] flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="w-1/2"
                onClick={clearAllFilters}
              >
                Reset All
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-1/2"
                onClick={() => setMobileFilterOpen(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

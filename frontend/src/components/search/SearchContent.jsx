'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/shared/ProductCard';
import { ProductCardSkeleton } from '@/components/shared/ProductCardSkeleton';
import { apiClient } from '@/lib/apiClient';
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Check,
  Tag,
  ArrowUpDown,
} from 'lucide-react';

const POPULAR_SEARCHES = [
  'Embroidered Lawn',
  'Raw Silk Kurta',
  'Men Shalwar Kameez',
  'Tilla Khussa',
  'King Bedsheet',
  'Summer Pret',
  'Waistcoat',
];

const AUDIENCES = [
  { id: 'all', label: 'All Departments' },
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
  { id: 'kids', label: 'Kids' },
  { id: 'footwear', label: 'Footwear' },
  { id: 'home', label: 'Home & Bedding' },
  { id: 'collections', label: 'Collections' },
];

const PRICE_PRESETS = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under PKR 3,000', min: '', max: '3000' },
  { label: 'PKR 3,000 – 6,000', min: '3000', max: '6000' },
  { label: 'PKR 6,000 – 10,000', min: '6000', max: '10000' },
  { label: 'Over PKR 10,000', min: '10000', max: '' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest Arrivals' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'rating', label: 'Top Rated' },
];

const PAGE_SIZE = 12;

export function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state initialization
  const initialQuery = searchParams.get('q') || '';
  const initialAudience = searchParams.get('audience') || 'all';
  const initialCategory = searchParams.get('category') || '';
  const initialFabric = searchParams.get('fabric') || '';
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [audience, setAudience] = useState(initialAudience);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedFabric, setSelectedFabric] = useState(initialFabric);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Custom price input state for sidebar
  const [customMin, setCustomMin] = useState(initialMinPrice);
  const [customMax, setCustomMax] = useState(initialMaxPrice);

  const resultsTopRef = useRef(null);

  // Debounce input search query by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Sync state to URL without refreshing
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (audience && audience !== 'all') params.set('audience', audience);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedFabric) params.set('fabric', selectedFabric);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sort && sort !== 'newest') params.set('sort', sort);
    if (page > 1) params.set('page', String(page));

    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [debouncedQuery, audience, selectedCategory, selectedFabric, minPrice, maxPrice, sort, page, router]);

  // Fetch categories for sidebar filter
  const { data: allCategories = [] } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      try {
        const res = await apiClient('/categories');
        return Array.isArray(res) ? res : res?.items || [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Filter categories relevant to the current audience
  const relevantCategories = useMemo(() => {
    if (audience === 'all') return allCategories;
    return allCategories.filter((c) => c.audience === audience);
  }, [allCategories, audience]);

  // Fetch catalog facets (fabrics, price bounds)
  const { data: facets } = useQuery({
    queryKey: ['products', 'facets'],
    queryFn: async () => {
      try {
        return await apiClient('/products/facets');
      } catch {
        return { fabrics: [], audiences: [] };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Build query string for products list
  const productQueryUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (audience && audience !== 'all') params.set('audience', audience);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedFabric) params.set('fabric', selectedFabric);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sort) params.set('sort', sort);
    params.set('page', String(page));
    params.set('limit', String(PAGE_SIZE));

    return `/products?${params.toString()}`;
  }, [debouncedQuery, audience, selectedCategory, selectedFabric, minPrice, maxPrice, sort, page]);

  // Fetch products with full filtering & pagination
  const { data: catalogResult, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['products', 'search', productQueryUrl],
    queryFn: async () => {
      try {
        const res = await apiClient(productQueryUrl);
        const items = Array.isArray(res) ? res : res?.items || [];
        const pagination = res?.pagination || res?.meta || {
          page,
          limit: PAGE_SIZE,
          total: items.length,
          totalPages: 1,
        };
        return { items, pagination };
      } catch {
        return {
          items: [],
          pagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 },
        };
      }
    },
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });

  const products = catalogResult?.items || [];
  const pagination = catalogResult?.pagination || {
    page: 1,
    limit: PAGE_SIZE,
    total: products.length,
    totalPages: 1,
  };

  // Active filter count (excluding default audience 'all' and sort 'newest')
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (debouncedQuery) count += 1;
    if (audience && audience !== 'all') count += 1;
    if (selectedCategory) count += 1;
    if (selectedFabric) count += 1;
    if (minPrice || maxPrice) count += 1;
    return count;
  }, [debouncedQuery, audience, selectedCategory, selectedFabric, minPrice, maxPrice]);

  const handleResetFilters = () => {
    setQuery('');
    setDebouncedQuery('');
    setAudience('all');
    setSelectedCategory('');
    setSelectedFabric('');
    setMinPrice('');
    setMaxPrice('');
    setCustomMin('');
    setCustomMax('');
    setSort('newest');
    setPage(1);
  };

  const handleApplyCustomPrice = (e) => {
    e.preventDefault();
    setMinPrice(customMin);
    setMaxPrice(customMax);
    setPage(1);
  };

  const handlePricePreset = (preset) => {
    setMinPrice(preset.min);
    setMaxPrice(preset.max);
    setCustomMin(preset.min);
    setCustomMax(preset.max);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === page) return;
    setPage(newPage);
    if (resultsTopRef.current) {
      resultsTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#141413]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Search Hero Header */}
        <div className="max-w-3xl mx-auto mb-10 text-center">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#B82A2E] block mb-2">
            Catalog & Discovery
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#141413] mb-4 tracking-tight">
            Search Collections
          </h1>
          <p className="text-xs sm:text-sm text-[#78736B] max-w-xl mx-auto mb-6">
            Find unstitched lawn, ready-to-wear kurtas, footwear, and home textiles across all categories.
          </p>

          {/* Search Box Input */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="w-5 h-5 text-[#78736B] absolute left-4 top-4 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lawn, kurta, shalwar kameez, khussa, bedsheet, silk..."
              autoFocus
              className="w-full h-13 pl-12 pr-12 rounded-xl border border-[#EAE5DD] bg-white text-base text-[#141413] placeholder:text-[#A6A095] focus:outline-none focus:border-[#141413] shadow-xs transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setDebouncedQuery('');
                }}
                className="absolute right-4 top-3.5 text-[#78736B] hover:text-[#141413] p-1 rounded-full hover:bg-[#F3EFEA] cursor-pointer transition-colors"
                aria-label="Clear search query"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Roman-Urdu Search Hint */}
          <div className="mt-2.5 flex items-center justify-center gap-2 text-xs text-[#78736B]">
            <Search className="w-3.5 h-3.5 text-[#B82A2E]" />
            <span>Understands Roman-Urdu: <em>kurti, kamiz, jooti, chadar, khaddar</em></span>
          </div>

          {/* Trending Inquiries */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A6A095] mr-1">
              Trending:
            </span>
            {POPULAR_SEARCHES.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setQuery(tag);
                  setDebouncedQuery(tag);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  debouncedQuery.toLowerCase() === tag.toLowerCase()
                    ? 'bg-[#141413] text-white shadow-xs'
                    : 'bg-white border border-[#EAE5DD] text-[#4A4742] hover:border-[#141413] hover:text-[#141413]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Department Pills / Segmented Controls */}
        <div className="mb-8 border-b border-[#EAE5DD] pb-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {AUDIENCES.map((aud) => {
              const active = audience === aud.id;
              return (
                <button
                  key={aud.id}
                  type="button"
                  onClick={() => {
                    setAudience(aud.id);
                    setSelectedCategory('');
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    active
                      ? 'bg-[#141413] text-white shadow-xs'
                      : 'bg-white border border-[#EAE5DD] text-[#4A4742] hover:bg-[#F3EFEA] hover:text-[#141413]'
                  }`}
                >
                  {aud.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Control Bar: Active Count, Sort & Mobile Filter Button */}
        <div ref={resultsTopRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-[#EAE5DD]">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold font-jakarta text-[#141413]">
              {debouncedQuery ? (
                <>Results for &ldquo;<span className="text-[#B82A2E]">{debouncedQuery}</span>&rdquo;</>
              ) : audience !== 'all' ? (
                <span className="capitalize">{audience} Collection</span>
              ) : (
                'All Curated Catalog'
              )}
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#F0ECE4] text-[#78736B] font-semibold">
              {pagination.total} piece{pagination.total === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-[#EAE5DD] text-xs font-bold text-[#141413] hover:bg-[#F3EFEA] cursor-pointer transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#B82A2E] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="search-sort" className="text-xs text-[#78736B] hidden sm:inline">
                Sort by:
              </label>
              <select
                id="search-sort"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-3 rounded-lg border border-[#EAE5DD] bg-white text-xs font-semibold text-[#141413] focus:outline-none focus:border-[#141413] cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-white border border-[#EAE5DD]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A6A095] mr-1">
              Active Filters:
            </span>

            {debouncedQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF8F5] text-xs font-medium text-[#141413] border border-[#EAE5DD]">
                &ldquo;{debouncedQuery}&rdquo;
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setDebouncedQuery('');
                  }}
                  className="hover:text-[#B82A2E] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {audience !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF8F5] text-xs font-medium text-[#141413] border border-[#EAE5DD] capitalize">
                Dept: {audience}
                <button
                  type="button"
                  onClick={() => {
                    setAudience('all');
                    setPage(1);
                  }}
                  className="hover:text-[#B82A2E] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF8F5] text-xs font-medium text-[#141413] border border-[#EAE5DD]">
                Category: {allCategories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('');
                    setPage(1);
                  }}
                  className="hover:text-[#B82A2E] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {selectedFabric && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF8F5] text-xs font-medium text-[#141413] border border-[#EAE5DD]">
                Fabric: {selectedFabric}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFabric('');
                    setPage(1);
                  }}
                  className="hover:text-[#B82A2E] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF8F5] text-xs font-medium text-[#141413] border border-[#EAE5DD]">
                Price: {minPrice ? `PKR ${Number(minPrice).toLocaleString()}` : '0'} – {maxPrice ? `PKR ${Number(maxPrice).toLocaleString()}` : 'Any'}
                <button
                  type="button"
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                    setCustomMin('');
                    setCustomMax('');
                    setPage(1);
                  }}
                  className="hover:text-[#B82A2E] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-[#B82A2E] hover:underline ml-auto cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Main Layout: Filter Sidebar (Desktop) + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="p-5 rounded-xl bg-white border border-[#EAE5DD] space-y-6 sticky top-24 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DD]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#141413]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#141413]">
                    Refine Catalog
                  </span>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[11px] font-semibold text-[#B82A2E] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Categories Facet */}
              {relevantCategories.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#78736B] block">
                    Categories
                  </span>
                  <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('');
                        setPage(1);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !selectedCategory
                          ? 'bg-[#141413] text-white font-bold'
                          : 'text-[#4A4742] hover:bg-[#F3EFEA] hover:text-[#141413]'
                      }`}
                    >
                      <span>All Categories</span>
                      {!selectedCategory && <Check className="w-3.5 h-3.5" />}
                    </button>
                    {relevantCategories.map((cat) => {
                      const isSelected = selectedCategory === cat.slug;
                      return (
                        <button
                          key={cat._id || cat.slug}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(isSelected ? '' : cat.slug);
                            setPage(1);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#141413] text-white font-bold'
                              : 'text-[#4A4742] hover:bg-[#F3EFEA] hover:text-[#141413]'
                          }`}
                        >
                          <span className="truncate text-left">{cat.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Fabric Facet */}
              {facets?.fabrics && facets.fabrics.length > 0 && (
                <div className="space-y-2.5 pt-4 border-t border-[#EAE5DD]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#78736B] block">
                    Fabric
                  </span>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFabric('');
                        setPage(1);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !selectedFabric
                          ? 'bg-[#141413] text-white font-bold'
                          : 'text-[#4A4742] hover:bg-[#F3EFEA] hover:text-[#141413]'
                      }`}
                    >
                      <span>All Fabrics</span>
                      {!selectedFabric && <Check className="w-3.5 h-3.5" />}
                    </button>
                    {facets.fabrics.map((fab) => {
                      const isSelected = selectedFabric === fab;
                      return (
                        <button
                          key={fab}
                          type="button"
                          onClick={() => {
                            setSelectedFabric(isSelected ? '' : fab);
                            setPage(1);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#141413] text-white font-bold'
                              : 'text-[#4A4742] hover:bg-[#F3EFEA] hover:text-[#141413]'
                          }`}
                        >
                          <span className="truncate text-left">{fab}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              <div className="space-y-3 pt-4 border-t border-[#EAE5DD]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#78736B] block">
                  Price (PKR)
                </span>

                {/* Preset Chips */}
                <div className="space-y-1">
                  {PRICE_PRESETS.map((preset) => {
                    const activePreset = minPrice === preset.min && maxPrice === preset.max;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePricePreset(preset)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          activePreset
                            ? 'bg-[#141413] text-white font-bold'
                            : 'text-[#4A4742] hover:bg-[#F3EFEA]'
                        }`}
                      >
                        <span>{preset.label}</span>
                        {activePreset && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Min / Max Inputs */}
                <form onSubmit={handleApplyCustomPrice} className="pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={customMin}
                      onChange={(e) => setCustomMin(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#EAE5DD] bg-white focus:outline-none focus:border-[#141413]"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={customMax}
                      onChange={(e) => setCustomMax(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#EAE5DD] bg-white focus:outline-none focus:border-[#141413]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-lg bg-[#141413] text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
                  >
                    Apply Price
                  </button>
                </form>
              </div>
            </div>
          </aside>

          {/* Product Grid Area (3 Columns on Desktop) */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} isHome={audience === 'home'} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((p, idx) => (
                    <ProductCard key={p._id || p.slug} product={p} priority={idx < 4} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="mt-12 pt-6 border-t border-[#EAE5DD] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs text-[#78736B]">
                      Showing Page <strong className="text-[#141413]">{pagination.page}</strong> of{' '}
                      <strong className="text-[#141413]">{pagination.totalPages}</strong> ({pagination.total} items)
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                        className="px-3 py-1.5 rounded-lg border border-[#EAE5DD] bg-white text-xs font-semibold text-[#141413] hover:bg-[#F3EFEA] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Prev</span>
                      </button>

                      {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        if (
                          pagination.totalPages > 7 &&
                          Math.abs(pageNum - page) > 2 &&
                          pageNum !== 1 &&
                          pageNum !== pagination.totalPages
                        ) {
                          if (pageNum === 2 || pageNum === pagination.totalPages - 1) {
                            return (
                              <span key={pageNum} className="px-1 text-xs text-[#A6A095]">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        const isCurrent = pageNum === page;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-[#141413] text-white shadow-xs'
                                : 'bg-white border border-[#EAE5DD] text-[#4A4742] hover:bg-[#F3EFEA]'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= pagination.totalPages}
                        className="px-3 py-1.5 rounded-lg border border-[#EAE5DD] bg-white text-xs font-semibold text-[#141413] hover:bg-[#F3EFEA] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-16 text-center rounded-xl bg-white border border-[#EAE5DD] space-y-4">
                <Tag className="w-10 h-10 text-[#A6A095] mx-auto opacity-40" />
                <h3 className="text-base font-bold font-jakarta text-[#141413]">
                  No matching pieces found
                </h3>
                <p className="text-xs text-[#78736B] max-w-sm mx-auto">
                  {debouncedQuery
                    ? `No pieces found matching "${debouncedQuery}". Try searching with broader keywords or removing specific filters.`
                    : 'No pieces currently available under this specific filter criteria.'}
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#141413] text-white text-xs font-bold hover:bg-black cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filters Slide-Over Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DD]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#141413]" />
                  <span className="text-sm font-bold uppercase tracking-wider text-[#141413]">
                    Catalog Filters
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-full text-[#78736B] hover:text-[#141413] hover:bg-[#F3EFEA]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#78736B] block">
                  Department
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {AUDIENCES.map((aud) => (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => {
                        setAudience(aud.id);
                        setSelectedCategory('');
                        setPage(1);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold text-center ${
                        audience === aud.id
                          ? 'bg-[#141413] text-white'
                          : 'bg-[#F3EFEA] text-[#4A4742]'
                      }`}
                    >
                      {aud.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              {relevantCategories.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-[#EAE5DD]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#78736B] block">
                    Category
                  </span>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {relevantCategories.map((cat) => {
                      const isSelected = selectedCategory === cat.slug;
                      return (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(isSelected ? '' : cat.slug);
                            setPage(1);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${
                            isSelected
                              ? 'bg-[#141413] text-white font-bold'
                              : 'text-[#4A4742] hover:bg-[#F3EFEA]'
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Fabric */}
              {facets?.fabrics && facets.fabrics.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-[#EAE5DD]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#78736B] block">
                    Fabric
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {facets.fabrics.map((fab) => {
                      const isSelected = selectedFabric === fab;
                      return (
                        <button
                          key={fab}
                          type="button"
                          onClick={() => {
                            setSelectedFabric(isSelected ? '' : fab);
                            setPage(1);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${
                            isSelected
                              ? 'bg-[#141413] text-white font-bold'
                              : 'text-[#4A4742] hover:bg-[#F3EFEA]'
                          }`}
                        >
                          <span className="truncate">{fab}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-[#EAE5DD] space-y-2 mt-4">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-2.5 rounded-lg bg-[#141413] text-white text-xs font-bold text-center cursor-pointer hover:bg-black transition-colors"
              >
                Show {pagination.total} Results
              </button>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full py-2 text-xs font-bold text-[#B82A2E] text-center cursor-pointer hover:underline"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

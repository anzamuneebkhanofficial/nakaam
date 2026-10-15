'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { apiClient } from '@/lib/apiClient';
import {
  Search,
  Sparkles,
  ArrowRight,
  Layers,
  ShoppingBag,
} from 'lucide-react';

const DEPARTMENTS = [
  { id: 'all', label: 'All Departments' },
  { id: 'women', label: 'Women', tag: 'Women' },
  { id: 'men', label: 'Men', tag: 'Men' },
  { id: 'kids', label: 'Kids', tag: 'Kids' },
  { id: 'footwear', label: 'Footwear', tag: 'Footwear' },
  { id: 'home', label: 'Bedding & Home', tag: 'Bedding & Home' },
  { id: 'collections', label: 'Collections', tag: 'Collections' },
];

export function CategoriesContent() {
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories = [], isLoading } = useQuery({
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

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesDept =
        selectedDept === 'all' || cat.audience === selectedDept;
      const matchesSearch =
        !searchQuery.trim() ||
        cat.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        cat.slug?.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesDept && matchesSearch;
    });
  }, [categories, selectedDept, searchQuery]);

  const groupedByDept = useMemo(() => {
    if (selectedDept !== 'all') {
      const deptMeta = DEPARTMENTS.find((d) => d.id === selectedDept);
      return [
        {
          id: selectedDept,
          label: deptMeta?.label || selectedDept,
          items: filteredCategories,
        },
      ];
    }

    const groups = [];
    DEPARTMENTS.filter((d) => d.id !== 'all').forEach((d) => {
      const items = filteredCategories.filter((c) => c.audience === d.id);
      if (items.length > 0) {
        groups.push({
          id: d.id,
          label: d.label,
          items,
        });
      }
    });

    // Any categories without matched audience
    const unassigned = filteredCategories.filter(
      (c) => !DEPARTMENTS.some((d) => d.id === c.audience)
    );
    if (unassigned.length > 0) {
      groups.push({
        id: 'other',
        label: 'Other Categories',
        items: unassigned,
      });
    }

    return groups;
  }, [filteredCategories, selectedDept]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#141413]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb & Header */}
        <div className="border-b border-[#EAE5DD] pb-8 mb-8">
          <nav className="text-xs text-[#78736B] mb-2 flex items-center gap-1.5" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#141413] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#141413] font-semibold">Categories</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#B82A2E]">
                Store Directory
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#141413] mt-1 tracking-tight">
                All Product Categories
              </h1>
              <p className="text-sm text-[#78736B] mt-1 max-w-xl">
                Browse our complete collection by department. Select any category to view all available products.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-[#EAE5DD] bg-white text-xs text-[#141413] placeholder-[#A6A095] focus:outline-none focus:border-[#141413] transition-colors"
              />
              <Search className="w-4 h-4 text-[#A6A095] absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Department Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-6 scrollbar-none">
            {DEPARTMENTS.map((dept) => {
              const isActive = selectedDept === dept.id;
              const count =
                dept.id === 'all'
                  ? categories.length
                  : categories.filter((c) => c.audience === dept.id).length;

              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => setSelectedDept(dept.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#141413] text-white shadow-xs'
                      : 'bg-white border border-[#EAE5DD] text-[#4A4742] hover:bg-[#F3EFEA]'
                  }`}
                >
                  <span>{dept.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#F0ECE4] text-[#78736B]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#F0ECE4] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#EAE5DD] bg-white p-12 text-center max-w-lg mx-auto">
            <Layers className="w-10 h-10 text-[#78736B] mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-bold text-[#141413]">No categories found</h3>
            <p className="text-xs text-[#78736B] mt-1">
              {searchQuery
                ? `No categories match "${searchQuery}". Try clearing your search.`
                : 'No categories are currently assigned to this department.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 text-xs font-bold rounded-lg bg-[#141413] text-white hover:bg-black transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {groupedByDept.map((group) => (
              <section key={group.id} className="space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DD]">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold font-jakarta text-[#141413] tracking-tight">
                      {group.label}
                    </h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F0ECE4] text-[#78736B]">
                      {group.items.length} {group.items.length === 1 ? 'category' : 'categories'}
                    </span>
                  </div>
                  <Link
                    href={`/shop?audience=${group.id === 'all' ? '' : group.id}`}
                    className="text-xs font-semibold text-[#B82A2E] hover:underline flex items-center gap-1"
                  >
                    <span>View all products</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {group.items.map((cat) => (
                    <Link
                      key={cat.slug || cat._id}
                      href={`/shop?audience=${cat.audience || ''}&category=${cat.slug || cat._id}`}
                      className="group flex flex-col rounded-lg border border-[#EAE5DD] bg-white overflow-hidden transition-all duration-300 hover:shadow-[0_8px_24px_rgba(20,20,19,0.08)] hover:border-[#141413]"
                    >
                      <div className="relative aspect-[3/4] w-full bg-[#F0ECE4] overflow-hidden flex items-center justify-center">
                        {cat.image ? (
                          <Image
                            src={cat.image}
                            alt={cat.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[#78736B] bg-[#F0ECE4] p-4 text-center">
                            <Sparkles className="w-8 h-8 mb-2 opacity-50 text-[#B82A2E]" />
                            <span className="text-xs font-medium text-[#141413]">{cat.name}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
                        <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                          <p className="text-base font-bold leading-tight font-jakarta drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] !text-white">
                            {cat.name}
                          </p>
                          <span className="text-[11px] font-semibold text-white/90 flex items-center gap-1 mt-1">
                            <span>Browse products</span>
                            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

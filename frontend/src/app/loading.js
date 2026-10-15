import React from 'react';
import { ProductCardSkeleton } from '@/components/shared/ProductCardSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F6F2EC] text-[#151515] flex flex-col">
      {/* Announcement Skeleton */}
      <div className="h-8 bg-[#151515] w-full" />

      {/* Header Skeleton */}
      <div className="h-20 bg-[#F6F2EC] border-b border-[#E6E1DA] px-6 max-w-7xl mx-auto w-full flex items-center justify-between animate-pulse">
        <div className="h-8 w-32 bg-[#E6E1DA] rounded-lg" />
        <div className="hidden lg:flex gap-6">
          <div className="h-4 w-16 bg-[#E6E1DA] rounded-sm" />
          <div className="h-4 w-16 bg-[#E6E1DA] rounded-sm" />
          <div className="h-4 w-16 bg-[#E6E1DA] rounded-sm" />
          <div className="h-4 w-16 bg-[#E6E1DA] rounded-sm" />
        </div>
        <div className="flex gap-3">
          <div className="h-8 w-8 bg-[#E6E1DA] rounded-full" />
          <div className="h-8 w-8 bg-[#E6E1DA] rounded-full" />
        </div>
      </div>

      {/* Hero Skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center animate-pulse">
        <div className="lg:col-span-7 space-y-4">
          <div className="h-6 w-48 bg-[#E6E1DA] rounded-full" />
          <div className="h-16 w-4/5 bg-[#E6E1DA] rounded-xl" />
          <div className="h-12 w-3/4 bg-[#E6E1DA] rounded-lg" />
          <div className="flex gap-4 pt-4">
            <div className="h-12 w-40 bg-[#E6E1DA] rounded-xl" />
            <div className="h-12 w-40 bg-[#E6E1DA] rounded-xl" />
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="aspect-[3/4] bg-[#EFEAE2] rounded-3xl border border-[#E6E1DA]" />
        </div>
      </div>

      {/* Product Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="h-8 w-64 bg-[#E6E1DA] rounded-lg mb-8 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

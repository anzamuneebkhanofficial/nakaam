import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-[8px] bg-[#EAE5DD]', className)}
      {...props}
    />
  );
}

/**
 * Exact aspect-[3/4] product card skeleton preventing layout shift in catalog and sliders
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      {/* 3:4 Portrait Image Placeholder */}
      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#EAE5DD] animate-pulse">
        <div className="absolute top-3 left-3 w-12 h-5 rounded-full bg-[#DFD9D0]" />
      </div>

      {/* Product Meta */}
      <div className="space-y-1.5 px-1">
        <div className="h-3 w-16 rounded bg-[#DFD9D0] animate-pulse" />
        <div className="h-4 w-4/5 rounded bg-[#DFD9D0] animate-pulse" />
        <div className="h-4 w-24 rounded bg-[#DFD9D0] animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Grid of product card skeletons for initial category page loading
 */
export function CatalogGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Zero-CLS PDP skeleton with split image gallery and purchasing console
 */
export function PDPSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        {/* Gallery Placeholder (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="aspect-[3/4] rounded-3xl bg-[#EAE5DD] animate-pulse" />
          <div className="hidden sm:block aspect-[3/4] rounded-3xl bg-[#EAE5DD] animate-pulse" />
        </div>

        {/* Purchase Info Placeholder (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-[#DFD9D0] animate-pulse" />
            <div className="h-8 w-3/4 rounded bg-[#DFD9D0] animate-pulse" />
            <div className="h-6 w-32 rounded bg-[#DFD9D0] animate-pulse" />
          </div>

          <div className="h-20 rounded-2xl bg-[#EAE5DD] animate-pulse" />

          {/* Size Pills */}
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-[#DFD9D0] animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="w-12 h-10 rounded-xl bg-[#DFD9D0] animate-pulse" />
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-4">
            <div className="h-12 w-full rounded-xl bg-[#DFD9D0] animate-pulse" />
            <div className="h-12 w-full rounded-xl bg-[#EAE5DD] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Admin Table Skeleton for Operations, Complaints, and Catalog Lists
 */
export function AdminTableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="bg-white border border-[#E6E1DA] rounded-2xl overflow-hidden shadow-xs">
      <div className="bg-[#F6F2EC] p-4 border-b border-[#E6E1DA] flex gap-4">
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="h-3.5 flex-1 rounded bg-[#DFD9D0] animate-pulse" />
        ))}
      </div>
      <div className="divide-y divide-[#E6E1DA]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className={`h-4 flex-1 rounded bg-[#EAE5DD] animate-pulse ${
                  c === 0 ? 'w-24' : ''
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { ProductCardSkeleton } from './ProductCardSkeleton';

export function ProductCarouselSkeleton({ count = 4 }) {
  return (
    <div className="relative overflow-hidden" aria-hidden="true">
      <div className="flex gap-4 sm:gap-6 overflow-x-hidden py-1">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="min-w-[260px] sm:min-w-[280px] max-w-[280px] flex-shrink-0">
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

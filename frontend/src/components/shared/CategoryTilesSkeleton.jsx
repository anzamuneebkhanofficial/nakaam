import React from 'react';

export function CategoryTilesSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="relative aspect-[4/5] rounded-2xl bg-[#EFEAE2] border border-[#E6E1DA] overflow-hidden animate-pulse flex flex-col justify-end p-4"
        >
          <div className="h-4 w-3/4 bg-[#E6E1DA] rounded-sm mb-2" />
          <div className="h-3 w-1/2 bg-[#E6E1DA] rounded-sm" />
        </div>
      ))}
    </div>
  );
}

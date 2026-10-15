import React from 'react';

export function ProductCardSkeleton({ isHome = false }) {
  const aspectClass = isHome ? 'aspect-[4/3]' : 'aspect-[3/4]';

  return (
    <div className="rounded-[16px] border border-[#E6E1DA] bg-[#FFFFFF] overflow-hidden flex flex-col animate-pulse">
      {/* Media skeleton */}
      <div className={`w-full ${aspectClass} bg-[#EFEAE2]`} />

      {/* Details skeleton */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="h-3 w-16 bg-[#E6E1DA] rounded-sm" />
            <div className="h-3 w-20 bg-[#E6E1DA] rounded-sm" />
          </div>
          <div className="h-5 w-4/5 bg-[#E6E1DA] rounded-md" />
        </div>

        <div className="pt-2 border-t border-[#E6E1DA]/80 space-y-2">
          <div className="h-6 w-24 bg-[#E6E1DA] rounded-md" />
          <div className="h-5 w-full bg-[#EFEAE2] rounded-md" />
        </div>
      </div>
    </div>
  );
}

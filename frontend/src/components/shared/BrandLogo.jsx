import React from 'react';
import Link from 'next/link';

export function BrandLogo({ className = '', withText = true, size = 'default' }) {
  const isSmall = size === 'sm';

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Brand Monogram Mark with Red Dot Seal */}
      <div className="relative flex items-center justify-center">
        <div
          className={`relative rounded-xl border border-[#151515] bg-[#151515] text-[#F6F2EC] flex items-center justify-center font-bold font-jakarta transition-all duration-200 group-hover:bg-[#3A3A3A] group-hover:border-[#3A3A3A] shadow-xs ${isSmall ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
            }`}
        >
          <span>N</span>
          {/* Vermilion Red Dot Seal */}
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#D12C2F] ring-2 ring-[#F6F2EC]" />
        </div>
      </div>

      {/* English Wordmark & Subtitle */}
      {withText && (
        <div className="flex flex-col">
          <span className="font-bold text-lg sm:text-xl tracking-tight font-jakarta leading-none text-[#151515]">
            NAKAAM
          </span>
          {/* <span className="text-[10px] tracking-widest uppercase text-[#6B6B6B] font-semibold leading-tight mt-0.5">
            Editorial Store
          </span> */}
        </div>
      )}
    </Link>
  );
}

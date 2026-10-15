'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from './Button';
import {
  ShoppingBag,
  Heart,
  Search,
  Package,
  Sparkles,
  Inbox,
  FilterX,
  FileQuestion,
} from 'lucide-react';

const ICON_MAP = {
  cart: ShoppingBag,
  wishlist: Heart,
  search: Search,
  orders: Package,
  reviews: Sparkles,
  inbox: Inbox,
  filter: FilterX,
  default: FileQuestion,
};

export function EmptyState({
  icon = 'default',
  badge = 'Notice',
  title = 'No Items Found',
  description = 'There are no active entries matching your criteria.',
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
  className = '',
}) {
  const IconComponent = ICON_MAP[icon] || ICON_MAP.default;

  return (
    <div
      className={`bg-white border border-[#E6E1DA] rounded-3xl p-8 sm:p-14 text-center max-w-xl mx-auto space-y-5 shadow-xs ${className}`}
    >
      {/* Decorative Icon Container */}
      <div className="relative inline-flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-[#F6F2EC] border border-[#E6E1DA] flex items-center justify-center text-[#151515] transition-transform duration-300 hover:scale-105">
          <IconComponent className="w-7 h-7 text-[#151515]" />
        </div>
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#D12C2F] ring-4 ring-white" />
      </div>

      {/* Typography */}
      <div className="space-y-1.5">
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D12C2F] block">
            {badge}
          </span>
        )}
        <h3 className="font-serif text-2xl font-bold tracking-tight text-[#151515]">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[#6B6B6B] max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action Buttons */}
      {(actionLabel || secondaryLabel) && (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {actionLabel &&
            (actionHref ? (
              <Button asChild size="default" className="w-full sm:w-auto bg-[#151515] hover:bg-[#2A2A2A] text-white text-xs">
                <Link href={actionHref}>{actionLabel}</Link>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={onAction}
                size="default"
                className="w-full sm:w-auto bg-[#151515] hover:bg-[#2A2A2A] text-white text-xs"
              >
                {actionLabel}
              </Button>
            ))}

          {secondaryLabel && secondaryHref && (
            <Link
              href={secondaryHref}
              className="text-xs font-semibold text-[#6B6B6B] hover:text-[#151515] underline underline-offset-4 py-2"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable pagination component.
 *
 * @param {object} props
 * @param {number}  props.currentPage   - Current active page (1-indexed).
 * @param {number}  props.totalPages    - Total number of pages.
 * @param {number}  [props.totalItems]  - Total record count (for "Showing X to Y of Z" summary).
 * @param {number}  [props.pageSize]    - Records per page (for summary calculation).
 * @param {Function} props.onPageChange - Called with the new page number when user navigates.
 * @param {'full'|'compact'} [props.variant='full']
 *   - 'full'    : Numbered page buttons with ellipsis (default; for shop / user-facing pages).
 *   - 'compact' : Simple "Prev · Page X of Y · Next" bar (for admin data tables).
 */
export function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 20,
  onPageChange,
  variant = 'full',
}) {
  // ── Compact variant ──────────────────────────────────────────────────────
  if (variant === 'compact') {
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="p-4 border-t border-[#E6E1DA] bg-[#FBF9F5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6B6B]">
        <div className="flex items-center gap-2">
          <span>
            Page{' '}
            <span className="font-semibold text-[#151515]">{currentPage}</span>
            {' '}of{' '}
            <span className="font-semibold text-[#151515]">{totalPages || 1}</span>
            {totalItems > 0 && (
              <> ({' '}<span className="font-semibold text-[#151515]">{totalItems}</span> total)</>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E6E1DA] bg-white text-xs font-semibold text-[#151515] hover:bg-[#F6F2EC] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {pages.map((p) => {
            const isActive = p === currentPage;
            return (
              <button
                key={`compact-page-${p}`}
                type="button"
                onClick={() => onPageChange(p)}
                className={`h-7 min-w-7 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#151515] text-white shadow-xs'
                    : 'bg-white border border-[#E6E1DA] text-[#3A3A3A] hover:bg-[#F6F2EC]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {p}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E6E1DA] bg-white text-xs font-semibold text-[#151515] hover:bg-[#F6F2EC] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // ── Full variant (numbered with ellipsis) ─────────────────────────────────
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= Math.max(1, totalPages); i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-[#E6E1DA] my-8">
      {/* Item summary */}
      <p className="text-xs text-[#6B6B6B]">
        Showing <span className="font-semibold text-[#151515]">{startItem}</span> to{' '}
        <span className="font-semibold text-[#151515]">{endItem}</span> of{' '}
        <span className="font-semibold text-[#151515]">{totalItems}</span> pieces
      </p>

      {/* Numbered Pagination Buttons */}
      <nav className="flex items-center gap-1.5" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-10 w-10 rounded-xl border border-[#E6E1DA] bg-white flex items-center justify-center text-[#151515] hover:bg-[#F6F2EC] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPages().map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="h-10 w-8 flex items-center justify-center text-xs text-[#6B6B6B]">
                …
              </span>
            );
          }

          const isActive = p === currentPage;
          return (
            <button
              key={`page-${p}`}
              type="button"
              onClick={() => onPageChange(p)}
              className={`h-10 min-w-10 px-3.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#151515] text-white shadow-xs'
                  : 'bg-white border border-[#E6E1DA] text-[#3A3A3A] hover:bg-[#F6F2EC]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-10 w-10 rounded-xl border border-[#E6E1DA] bg-white flex items-center justify-center text-[#151515] hover:bg-[#F6F2EC] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}


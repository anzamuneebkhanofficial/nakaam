import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function AnnouncementBar({
  text = 'Doorstep inspection before payment across Lahore • Free shipping on orders over PKR 5,000',
  link = '/shipping-returns',
  isActive = true,
}) {
  if (!isActive) return null;

  return (
    <aside
      aria-label="Announcement"
      className="bg-[#141413] text-[#FAF8F5] text-[11px] sm:text-xs font-medium py-2.5 px-4 text-center transition-colors border-b border-[#262624]"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-[#B82A2E] animate-pulse" />
        <p className="truncate sm:text-clip">{text}</p>
        {link && (
          <Link
            href={link}
            className="inline-flex items-center gap-1 underline underline-offset-4 decoration-[#B82A2E]/50 hover:decoration-[#B82A2E] hover:text-[#FAF8F5] transition-colors ml-1.5 font-medium"
          >
            <span>Policy</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </aside>
  );
}

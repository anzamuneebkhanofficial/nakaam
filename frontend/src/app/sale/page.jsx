import React, { Suspense } from 'react';
import { SalesContent } from '@/components/sale/SalesContent';
import { CatalogGridSkeleton } from '@/components/ui/Skeleton';

export const metadata = {
  title: 'Special Offers & Clearance Sale | Nakaam Store (ناکام)',
  description: 'Shop curated clearance deals, festive markdowns, and special offers across luxury menswear, womenswear, and bedding.',
};

export default function SalePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F2EC] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="h-10 w-48 bg-[#EAE5DD] rounded-xl animate-pulse" />
          <CatalogGridSkeleton count={10} />
        </div>
      }
    >
      <SalesContent />
    </Suspense>
  );
}

import React, { Suspense } from 'react';
import { ShopContent } from '@/components/shop/ShopContent';
import { CatalogGridSkeleton } from '@/components/ui/Skeleton';

export const metadata = {
  title: 'Shop Catalog & Pret Collections | Nakaam (ناکام)',
  description: 'Browse handcrafted lawn, festive raw silk, and home textiles with honest pricing and doorstep inspection.',
};

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F2EC] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="h-10 w-48 bg-[#EAE5DD] rounded-xl animate-pulse" />
          <CatalogGridSkeleton count={8} />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}

import React, { Suspense } from 'react';
import { SearchContent } from '@/components/search/SearchContent';
import { CatalogGridSkeleton } from '@/components/ui/Skeleton';

export const metadata = {
  title: 'Search Catalog & Collections | Nakaam (ناکام)',
  description: 'Search lawn, unstitched fabric, footwear, and bedding with smart synonyms.',
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F2EC] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="h-12 max-w-xl mx-auto bg-[#EAE5DD] rounded-2xl animate-pulse" />
          <CatalogGridSkeleton count={8} />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

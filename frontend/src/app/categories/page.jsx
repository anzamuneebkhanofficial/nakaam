import React, { Suspense } from 'react';
import { CategoriesContent } from '@/components/categories/CategoriesContent';

export const metadata = {
  title: 'All Categories | Nakaam',
  description: 'Explore all product categories across womenswear, menswear, kids, footwear, bedding, and seasonal collections.',
};

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <CategoriesContent />
    </Suspense>
  );
}

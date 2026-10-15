import React, { Suspense } from 'react';
import { ProductDetailsContent } from '@/components/admin/ProductDetailsContent';

export const instant = false;

export const metadata = {
  title: 'Product Dossier | Nakaam Admin (ناکام)',
  description: 'View full garment specifications, imagery gallery, pricing, and variants.',
};

export default async function ViewProductPage({ params }) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="text-xs text-[#6B6B6B] py-16 text-center">
          Loading product dossier...
        </div>
      }
    >
      <ProductDetailsContent productId={id} />
    </Suspense>
  );
}

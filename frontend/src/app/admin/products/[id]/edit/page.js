import React, { Suspense } from 'react';
import { ProductEditorContent } from '@/components/admin/ProductEditorContent';

export const instant = false;

export const metadata = {
  title: 'Edit Product | Nakaam Admin (ناکام)',
  description: 'Manage garment specifications, inventory, pricing, and variants.',
};

export default async function EditProductPage({ params }) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading editor...</div>}>
      <ProductEditorContent productId={id} />
    </Suspense>
  );
}

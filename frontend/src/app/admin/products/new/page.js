import { Suspense } from 'react';
import { ProductEditorContent } from '@/components/admin/ProductEditorContent';

// Route segment config — must stay in a Server Component (no 'use client')
export const instant = false;

// In Next.js App Router, searchParams is available as a prop on page.js Server Components.
// No useSearchParams hook needed — that was the root of all the conflicts.
//
// The "+ Add Product" button navigates to /admin/products/new?t=<timestamp>.
// Each unique `t` value becomes a unique `resetKey`, which React uses as the `key`
// prop on ProductEditorForm — guaranteeing a full remount and a blank form every time.
export default async function NewProductPage({ searchParams }) {
  const params = await searchParams;
  const resetKey = params?.t || 'new';

  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading editor...</div>}>
      <ProductEditorContent productId="new" resetKey={resetKey} />
    </Suspense>
  );
}

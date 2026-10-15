import React, { Suspense } from 'react';
import { ProductDetailContent } from '@/components/pdp/ProductDetailContent';
import { PDPSkeleton } from '@/components/ui/Skeleton';

async function PDPContainer({ paramsPromise }) {
  const { slug } = await paramsPromise;
  return <ProductDetailContent slug={slug} />;
}

export default function ProductDetailPage({ params }) {
  return (
    <Suspense fallback={<PDPSkeleton />}>
      <PDPContainer paramsPromise={params} />
    </Suspense>
  );
}


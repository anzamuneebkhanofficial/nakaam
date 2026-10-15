import React, { Suspense } from 'react';
import { OrderDetailContent } from '@/components/account/OrderDetailContent';

export const instant = false;

export const metadata = {
  title: 'Order Slip & Tracking | Nakaam E-Commerce',
  description: 'View order cutting slip, items breakdown, and courier tracking.',
};

export default async function OrderDetailPage({ params, searchParams }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <OrderDetailContent orderId={id} initialAction={query?.action === 'report' ? 'report' : ''} />
    </Suspense>
  );
}

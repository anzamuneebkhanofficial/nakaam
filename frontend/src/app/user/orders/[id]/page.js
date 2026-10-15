import React, { Suspense } from 'react';
import { OrderDetailContent } from '@/components/account/OrderDetailContent';

export const instant = false;

export const metadata = {
  title: 'Order Slip & Tracking | Nakaam Store',
  description: 'View order cutting slip, items breakdown, and courier tracking.',
};

export default async function UserOrderDetailPage({ params, searchParams }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading order details...</div>}>
      <OrderDetailContent orderId={id} initialAction={query?.action === 'report' ? 'report' : ''} />
    </Suspense>
  );
}

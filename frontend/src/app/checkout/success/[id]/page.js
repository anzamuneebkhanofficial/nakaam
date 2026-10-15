import React, { Suspense } from 'react';
import { OrderSuccessContent } from '@/components/checkout/OrderSuccessContent';

export const instant = false;

export const metadata = {
  title: 'Order Confirmation | Nakaam E-Commerce Platform',
  description: 'Your order details, doorstep inspection tracking, and payment verification.',
};

export default async function OrderSuccessPage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <OrderSuccessContent orderId={id} />
    </Suspense>
  );
}

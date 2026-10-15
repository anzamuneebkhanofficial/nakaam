import React, { Suspense } from 'react';
import { OrdersContent } from '@/components/account/OrdersContent';

export const metadata = {
  title: 'Order History & Exchanges | Nakaam E-Commerce',
  description: 'View past orders, track active dispatches, and request doorstep size exchanges.',
};

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <OrdersContent />
    </Suspense>
  );
}

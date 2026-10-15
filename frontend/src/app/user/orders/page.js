import React, { Suspense } from 'react';
import { OrdersContent } from '@/components/account/OrdersContent';

export const instant = false;

export const metadata = {
  title: 'My Orders & Dispatches | Nakaam Store',
  description: 'View past orders, track active dispatches, and request doorstep size exchanges.',
};

export default function UserOrdersPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}

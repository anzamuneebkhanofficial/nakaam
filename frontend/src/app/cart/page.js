import React, { Suspense } from 'react';
import { CartContent } from '@/components/cart/CartContent';

export const metadata = {
  title: 'Shopping Bag | Nakaam E-Commerce',
  description: 'Review your selected pret, festive unstitched suits, and home textiles with doorstep open-box inspection.',
};

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <CartContent />
    </Suspense>
  );
}

import React, { Suspense } from 'react';
import { CheckoutContent } from '@/components/checkout/CheckoutContent';

export const metadata = {
  title: 'Checkout | Nakaam E-Commerce Platform',
  description: 'Enter your shipping address and choose Cash on Delivery (COD) or Direct Bank Transfer with doorstep inspection.',
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <CheckoutContent />
    </Suspense>
  );
}

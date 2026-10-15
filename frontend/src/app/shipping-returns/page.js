import React, { Suspense } from 'react';
import { ShippingReturnsContent } from '@/components/editorial/ShippingReturnsContent';

export const metadata = {
  title: 'Shipping, Open-Box Inspection & Returns | Nakaam (ناکام)',
  description: 'Our 6-Promises Consumer Charter: doorstep open-box inspection in Lahore, Rs 250 flat-rate delivery, and 7-day size exchange covering sale items.',
};

export default function ShippingReturnsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <ShippingReturnsContent />
    </Suspense>
  );
}

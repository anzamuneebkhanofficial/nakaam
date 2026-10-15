import React, { Suspense } from 'react';
import { SizeGuideContent } from '@/components/editorial/SizeGuideContent';

export const metadata = {
  title: 'Size Guide & Fit Matrix | Nakaam (ناکام)',
  description: 'Detailed measurements in cm and inches for lawn pret kurtas, trousers, men’s festive suits, and handcrafted leather khussas.',
};

export default function SizeGuidePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <SizeGuideContent />
    </Suspense>
  );
}

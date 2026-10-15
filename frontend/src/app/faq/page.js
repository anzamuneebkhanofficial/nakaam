import React, { Suspense } from 'react';
import { FaqContent } from '@/components/editorial/FaqContent';

export const metadata = {
  title: 'Frequently Asked Questions (FAQ) | Nakaam (ناکام)',
  description: 'Answers to all your questions regarding doorstep inspection, honest size measurements, Raast payments, shipping transit, and 7-day exchanges.',
};

export default function FaqPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <FaqContent />
    </Suspense>
  );
}

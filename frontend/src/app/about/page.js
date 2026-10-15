import React, { Suspense } from 'react';
import { AboutContent } from '@/components/editorial/AboutContent';

export const metadata = {
  title: 'Our Heritage & Craft | Nakaam (ناکام)',
  description: 'The story of Nakaam: handloom textiles, precision tailoring, pure unbleached cotton, and fair artisan wages in Lahore, Pakistan.',
};

export default function AboutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <AboutContent />
    </Suspense>
  );
}

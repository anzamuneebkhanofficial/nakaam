import React, { Suspense } from 'react';
import { HomeContent } from '@/components/home/HomeContent';

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <HomeContent />
    </Suspense>
  );
}

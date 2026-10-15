import React, { Suspense } from 'react';
import { FamilySizeBookContent } from '@/components/account/FamilySizeBookContent';

export const metadata = {
  title: 'Family Size Book | Nakaam E-Commerce',
  description: 'Manage family tailoring measurements for lawn suits, kurtas, and footwear gifting.',
};

export default function FamilyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <FamilySizeBookContent />
    </Suspense>
  );
}

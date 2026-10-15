import React, { Suspense } from 'react';
import { FamilySizeBookContent } from '@/components/account/FamilySizeBookContent';

export const instant = false;

export const metadata = {
  title: 'Family Size Book | Nakaam Store',
  description: 'Manage family tailoring measurements for lawn suits, kurtas, and footwear gifting.',
};

export default function UserFamilyPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading family size book...</div>}>
      <FamilySizeBookContent />
    </Suspense>
  );
}

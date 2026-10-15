import React, { Suspense } from 'react';
import { ComplaintsContent } from '@/components/account/ComplaintsContent';

export const metadata = {
  title: 'Customer Support & Inquiries | Nakaam',
  description: 'Direct communication regarding custom tailoring, sizing guidance, and order questions.',
};

export default function ComplaintsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <ComplaintsContent />
    </Suspense>
  );
}

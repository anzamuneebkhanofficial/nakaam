import React, { Suspense } from 'react';
import { ComplaintsContent } from '@/components/account/ComplaintsContent';

export const instant = false;

export const metadata = {
  title: 'Customer Support & Inquiries | Nakaam Store',
  description: 'Direct communication regarding custom tailoring, sizing guidance, and order questions.',
};

export default function UserComplaintsPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading support tickets...</div>}>
      <ComplaintsContent />
    </Suspense>
  );
}

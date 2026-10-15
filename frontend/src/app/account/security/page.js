import React, { Suspense } from 'react';
import { SecurityContent } from '@/components/account/SecurityContent';

export const metadata = {
  title: 'Security & Payment Methods | Nakaam E-Commerce',
  description: 'Manage account security, password updates, and saved payment preferences.',
};

export default function SecurityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <SecurityContent />
    </Suspense>
  );
}

import React, { Suspense } from 'react';
import { SecurityContent } from '@/components/account/SecurityContent';

export const instant = false;

export const metadata = {
  title: 'Security & Payment Methods | Nakaam Store',
  description: 'Manage account security, password updates, and saved payment preferences.',
};

export default function UserSecurityPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading security settings...</div>}>
      <SecurityContent />
    </Suspense>
  );
}

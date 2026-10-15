import React, { Suspense } from 'react';
import { ProfileContent } from '@/components/account/ProfileContent';

export const metadata = {
  title: 'Profile & Measurements | Nakaam E-Commerce',
  description: 'Manage personal profile details and tailoring measurements for size helper recommendations.',
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <ProfileContent />
    </Suspense>
  );
}

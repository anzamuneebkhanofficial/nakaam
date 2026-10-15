import React, { Suspense } from 'react';
import { ProfileContent } from '@/components/account/ProfileContent';

export const instant = false;

export const metadata = {
  title: 'Profile & Measurements | Nakaam Store',
  description: 'Manage personal profile details and tailoring measurements for size helper recommendations.',
};

export default function UserProfilePage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}

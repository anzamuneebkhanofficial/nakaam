import React, { Suspense } from 'react';
import { AddressesContent } from '@/components/account/AddressesContent';

export const metadata = {
  title: 'Saved Delivery Addresses | Nakaam E-Commerce',
  description: 'Manage verified doorstep delivery addresses for express and standard orders.',
};

export default function AddressesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <AddressesContent />
    </Suspense>
  );
}

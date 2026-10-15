import React, { Suspense } from 'react';
import { AddressesContent } from '@/components/account/AddressesContent';

export const instant = false;

export const metadata = {
  title: 'Saved Delivery Addresses | Nakaam Store',
  description: 'Manage verified doorstep delivery addresses for express and standard orders.',
};

export default function UserAddressesPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading addresses...</div>}>
      <AddressesContent />
    </Suspense>
  );
}

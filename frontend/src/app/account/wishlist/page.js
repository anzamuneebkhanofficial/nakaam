import React, { Suspense } from 'react';
import { WishlistContent } from '@/components/account/WishlistContent';

export const metadata = {
  title: 'My Wishlist | Nakaam',
  description: 'View and manage your saved lawn suits, footwear, and festive favorites.',
};

export default function WishlistPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <WishlistContent />
    </Suspense>
  );
}

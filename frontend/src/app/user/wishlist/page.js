import React, { Suspense } from 'react';
import { WishlistContent } from '@/components/account/WishlistContent';

export const instant = false;

export const metadata = {
  title: 'My Wishlist | Nakaam Store',
  description: 'View and manage your saved lawn suits, footwear, and festive favorites.',
};

export default function UserWishlistPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading wishlist...</div>}>
      <WishlistContent />
    </Suspense>
  );
}

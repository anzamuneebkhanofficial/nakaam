import React, { Suspense } from 'react';
import { AdminCouponsContent } from '@/components/admin/AdminCouponsContent';

export const instant = false;

export const metadata = {
  title: 'Discount Coupons & Vouchers | Nakaam Admin (ناکام)',
  description: 'Issue discount codes, manage redemption limits, and promotional vouchers.',
};

export default function AdminCouponsPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading coupons...</div>}>
      <AdminCouponsContent />
    </Suspense>
  );
}

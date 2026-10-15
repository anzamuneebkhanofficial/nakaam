import React, { Suspense } from 'react';
import { AdminSalesContent } from '@/components/admin/AdminSalesContent';

export const instant = false;

export const metadata = {
  title: 'Flash Sales & Campaigns | Nakaam Admin (ناکام)',
  description: 'Manage seasonal promotions, percentage discounts, and marketing campaigns.',
};

export default function AdminSalesPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading sales...</div>}>
      <AdminSalesContent />
    </Suspense>
  );
}

import React, { Suspense } from 'react';
import { AdminOrderDetailContent } from '@/components/admin/AdminOrderDetailContent';

export const instant = false;

export const metadata = {
  title: 'Order Workstation | Nakaam Admin (ناکام)',
  description: 'Manage order fulfillment, verify payment receipts, and assign delivery riders.',
};

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading order workstation...</div>}>
      <AdminOrderDetailContent orderId={id} />
    </Suspense>
  );
}

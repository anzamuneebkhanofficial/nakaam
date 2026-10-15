import React, { Suspense } from 'react';
import { AdminOrdersContent } from '@/components/admin/AdminOrdersContent';

export const instant = false;

export const metadata = {
  title: 'Order Dispatch & Fulfillment | Nakaam Admin (ناکام)',
  description: 'Manage customer orders, fast blinker notifications, and courier dispatches.',
};

export default async function AdminOrdersPage({ searchParams }) {
  const params = await searchParams;
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading orders console...</div>}>
      <AdminOrdersContent
        initialStatus={params?.status || ''}
        initialHasProof={params?.hasProof === 'true'}
        initialActionRequired={params?.filter === 'action_required'}
      />
    </Suspense>
  );
}

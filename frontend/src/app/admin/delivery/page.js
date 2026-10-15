import React, { Suspense } from 'react';
import { AdminDeliveryContent } from '@/components/admin/AdminDeliveryContent';

export const instant = false;

export const metadata = {
  title: 'City Logistics Hub | Nakaam Admin (ناکام)',
  description: 'Manage Lahore express riders, nationwide courier manifests, and regional delivery routing.',
};

export default function AdminDeliveryPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading logistics hub...</div>}>
      <AdminDeliveryContent />
    </Suspense>
  );
}

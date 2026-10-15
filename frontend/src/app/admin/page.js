import React, { Suspense } from 'react';
import { DashboardContent } from '@/components/admin/DashboardContent';

export const instant = false;

export const metadata = {
  title: 'Admin Dashboard | Nakaam Store',
  description: 'Real-time sales, order fulfillment, and store inventory.',
};

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-xs text-[#6B6B6B]">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

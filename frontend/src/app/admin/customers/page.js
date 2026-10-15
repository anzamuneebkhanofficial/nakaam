import React, { Suspense } from 'react';
import { AdminCustomersContent } from '@/components/admin/AdminCustomersContent';

export const instant = false;

export const metadata = {
  title: 'Customer Directory & Risk Analysis | Nakaam Admin (ناکام)',
  description: 'Manage patron roster, lifetime PKR spend, and Cash-on-Delivery risk scores.',
};

export default function AdminCustomersPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading patrons directory...</div>}>
      <AdminCustomersContent />
    </Suspense>
  );
}

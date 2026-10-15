import React, { Suspense } from 'react';
import { AdminComplaintsContent } from '@/components/admin/AdminComplaintsContent';

export const instant = false;

export const metadata = {
  title: 'Customer Support & Complaints | Nakaam Admin (ناکام)',
  description: 'Manage customer complaints, return requests, and support tickets.',
};

export default function AdminComplaintsPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading support tickets...</div>}>
      <AdminComplaintsContent />
    </Suspense>
  );
}

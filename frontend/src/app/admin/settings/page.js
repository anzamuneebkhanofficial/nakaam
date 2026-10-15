import React, { Suspense } from 'react';
import { AdminSettingsContent } from '@/components/admin/AdminSettingsContent';

export const instant = false;

export const metadata = {
  title: 'Store Settings | Nakaam Admin (ناکام)',
  description: 'Manage store settings, WhatsApp contact, free shipping thresholds, and announcement banners.',
};

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading store settings...</div>}>
      <AdminSettingsContent />
    </Suspense>
  );
}

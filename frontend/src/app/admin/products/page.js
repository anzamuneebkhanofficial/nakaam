import React, { Suspense } from 'react';
import { AdminProductsContent } from '@/components/admin/AdminProductsContent';

export const instant = false;

export const metadata = {
  title: 'Products Directory | Nakaam Admin (ناکام)',
  description: 'Manage garment catalog, inventory levels, SKUs, and pricing.',
};

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading catalogue...</div>}>
      <AdminProductsContent />
    </Suspense>
  );
}

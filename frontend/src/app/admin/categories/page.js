import React, { Suspense } from 'react';
import { AdminCategoriesContent } from '@/components/admin/AdminCategoriesContent';

export const instant = false;

export const metadata = {
  title: 'Categories & Curations | Nakaam Admin (ناکام)',
  description: 'Manage store categories, collections, and audience taxonomy.',
};

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading categories...</div>}>
      <AdminCategoriesContent />
    </Suspense>
  );
}

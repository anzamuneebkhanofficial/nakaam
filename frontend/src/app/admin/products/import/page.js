import React, { Suspense } from 'react';
import { CsvImportContent } from '@/components/admin/CsvImportContent';

export const instant = false;

export const metadata = {
  title: 'CSV Bulk Stock Import | Nakaam Admin (ناکام)',
  description: 'Bulk update garment inventory, SKUs, and integer PKR prices.',
};

export default function CsvImportPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading import wizard...</div>}>
      <CsvImportContent />
    </Suspense>
  );
}

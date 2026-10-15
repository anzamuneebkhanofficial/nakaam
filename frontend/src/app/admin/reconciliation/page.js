import React, { Suspense } from 'react';
import { AdminReconciliationContent } from '@/components/admin/AdminReconciliationContent';

export const instant = false;

export const metadata = {
  title: 'Financial Reconciliation | Nakaam Admin (ناکام)',
  description: 'Raast P2P bank verification ledger and COD cash reconciliations.',
};

export default function AdminReconciliationPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading reconciliation ledger...</div>}>
      <AdminReconciliationContent />
    </Suspense>
  );
}

import React, { Suspense } from 'react';
import { UserDashboardContent } from '@/components/user/UserDashboardContent';

export const instant = false;

export const metadata = {
  title: 'Customer Dashboard | Nakaam Store',
  description: 'Manage personal orders, measurements, family sizes, and delivery addresses.',
};

export default function UserDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-xs text-[#6B6B6B]">
          Loading customer dashboard...
        </div>
      }
    >
      <UserDashboardContent />
    </Suspense>
  );
}

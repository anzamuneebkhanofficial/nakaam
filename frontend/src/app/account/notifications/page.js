import React, { Suspense } from 'react';
import { NotificationsContent } from '@/components/account/NotificationsContent';

export const metadata = {
  title: 'Notifications & Alerts | Nakaam E-Commerce',
  description: 'Real-time order dispatch updates, shipping status, and account notifications.',
};

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F2EC]" />}>
      <NotificationsContent />
    </Suspense>
  );
}

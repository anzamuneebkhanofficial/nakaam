import React, { Suspense } from 'react';
import { NotificationsContent } from '@/components/account/NotificationsContent';

export const instant = false;

export const metadata = {
  title: 'Notifications & Alerts | Nakaam Store',
  description: 'Real-time order dispatch updates, shipping status, and account notifications.',
};

export default function UserNotificationsPage() {
  return (
    <Suspense fallback={<div className="text-xs text-[#6B6B6B] py-12 text-center">Loading notifications...</div>}>
      <NotificationsContent />
    </Suspense>
  );
}

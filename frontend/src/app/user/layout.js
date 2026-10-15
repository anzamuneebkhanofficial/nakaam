import React from 'react';
import { UserShell } from '@/components/user/UserShell';

export const instant = false;

export const metadata = {
  title: 'Customer Dashboard | Nakaam Store',
  description: 'Manage personal orders, measurements, family sizes, and delivery addresses.',
};

export default function UserLayout({ children }) {
  return <UserShell>{children}</UserShell>;
}

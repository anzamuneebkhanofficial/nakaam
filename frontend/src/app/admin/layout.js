import React from 'react';
import { AdminShell } from '@/components/admin/AdminShell';

export const instant = false;

export const metadata = {
  title: 'Admin Workstation | Nakaam Store',
  description: 'Store operations, order management, and inventory.',
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}

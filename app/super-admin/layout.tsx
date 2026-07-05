'use client';

import { DashboardLayout } from '@/components/common/DashboardLayout';
import { LayoutDashboard, Users, ClipboardCheck, BarChart3, FileText, Settings, User as UserIcon, Plus, BarChart2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

const sidebarItems = [
  { name: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
  { name: 'Admin Management', href: '/super-admin/admins', icon: Users },
  { name: 'Exam Management', href: '/super-admin/exams', icon: ClipboardCheck },
  { name: 'Results', href: '/super-admin/results', icon: BarChart3 },
  { name: 'Reports', href: '/super-admin/reports', icon: FileText },
  { name: 'System Settings', href: '/super-admin/settings', icon: Settings },
  { name: 'Profile', href: '/super-admin/profile', icon: UserIcon },
];

import { Button } from '@/components/ui/button';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard';
  const capitalizedTitle = title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <DashboardLayout sidebarItems={sidebarItems} title={capitalizedTitle}>
      {children}
    </DashboardLayout>
  );
}

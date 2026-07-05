'use client';

import { DashboardLayout } from '@/components/common/DashboardLayout';
import { LayoutDashboard, GraduationCap, ClipboardCheck, CalendarDays, BarChart3, FileText, Settings, User as UserIcon, Plus, Upload, Calendar, Users as UsersIcon, BarChart2, MessageSquare } from 'lucide-react';
import { usePathname } from 'next/navigation';

const sidebarItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/admin/students', icon: GraduationCap },
  { name: 'Exams', href: '/admin/exams', icon: ClipboardCheck },
  { name: 'Exam Mapping', href: '/admin/exam-mapping', icon: CalendarDays },
  { name: 'Results', href: '/admin/results', icon: BarChart3 },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Profile', href: '/admin/profile', icon: UserIcon },
];

import { Button } from '@/components/ui/button';

export default function AdminLayout({
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

'use client';

import { DashboardLayout } from '@/components/common/DashboardLayout';
import { LayoutDashboard, Calendar, PlayCircle, CheckCircle2, BarChart3, Award, Bell, User as UserIcon, FileText, Monitor, BarChart2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

const sidebarItems = [
  { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Upcoming Exams', href: '/student/upcoming-exams', icon: Calendar },
  { name: 'Active Exams', href: '/student/active-exams', icon: PlayCircle },
  { name: 'Completed Exams', href: '/student/completed-exams', icon: CheckCircle2 },
  { name: 'My Results', href: '/student/results', icon: BarChart2 },
  { name: 'Notifications', href: '/student/notifications', icon: Bell },
  { name: 'Profile', href: '/student/profile', icon: UserIcon },
];

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function StudentLayout({
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

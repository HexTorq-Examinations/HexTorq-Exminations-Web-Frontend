import React from 'react';
import { NetworkPing } from '@/components/common/NetworkPing';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/50 bg-[bottom_1px_center] dark:bg-[bottom_1px_center] bg-[length:24px_24px] pointer-events-none" />
      <div className="z-10 w-full max-w-md">
        {children}
        <NetworkPing />
      </div>
    </div>
  );
}

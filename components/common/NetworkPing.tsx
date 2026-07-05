'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NetworkPing() {
  const [ping, setPing] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkPing = async () => {
      const start = Date.now();
      try {
        await api.get('/health', { timeout: 3000 });
        if (mounted) {
          setPing(Date.now() - start);
        }
      } catch (err) {
        if (mounted) setPing(999);
      }
    };
    checkPing();
    const interval = setInterval(checkPing, 10000); // Check every 10 seconds
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (ping === null) return null;

  const getPingColor = () => {
    if (ping < 100) return 'text-emerald-500';
    if (ping < 300) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div 
      className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-sm"
      title={`Network Latency: ${ping}ms`}
    >
      <Wifi className={cn("w-3.5 h-3.5", getPingColor())} />
      <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
        {ping}ms
      </span>
    </div>
  );
}

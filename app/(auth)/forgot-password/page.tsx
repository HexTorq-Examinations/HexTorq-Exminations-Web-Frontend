'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { identifier });
      setMessage(data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-slate-950/80 p-8 shadow-xl border space-y-6">
      <div><h1 className="text-2xl font-bold">Reset password</h1><p className="text-sm text-slate-500 mt-1">Enter your email address or Student ID.</p></div>
      {message ? <p className="p-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm">{message}</p> : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="identifier">Email or Student ID</Label><Input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required /></div>
          <Button className="w-full" disabled={loading}>{loading ? 'Sending...' : 'Email Reset Link'}</Button>
        </form>
      )}
      <Link href="/login" className="block text-center text-sm text-blue-600">Back to login</Link>
    </div>
  );
}

'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function ResetPasswordForm() {
  const token = useSearchParams().get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { token, newPassword: password });
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-slate-950/80 p-8 shadow-xl border space-y-6">
      <div><h1 className="text-2xl font-bold">Choose a new password</h1><p className="text-sm text-slate-500 mt-1">This reset link can be used once.</p></div>
      {message ? <p className="p-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm">{message}</p> : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="password">New password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="confirm">Confirm password</Label><Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button className="w-full" disabled={loading || !token}>{loading ? 'Resetting...' : 'Reset Password'}</Button>
        </form>
      )}
      <Link href="/login" className="block text-center text-sm text-blue-600">Back to login</Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetPasswordForm /></Suspense>;
}

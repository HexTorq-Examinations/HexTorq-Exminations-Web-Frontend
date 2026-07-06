'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

type Profile = { user: any; student: { registerNumber: string; className: string; departmentName: string; schoolName: string; batchName: string; joinedAt: string; extraTimeMinutes: number; accessibilityNotes?: string; completedExams: number; upcomingExams: number; activeExams: number } | null };

export default function StudentProfile() {
  const router = useRouter();
  const authUser = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState(authUser?.name || '');
  const [phone, setPhone] = useState(authUser?.phone || '');
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  useEffect(() => { api.get('/users/me/profile').then(({ data }) => { setProfile(data); setName(data.user.name); setPhone(data.user.phone || ''); }); }, []);

  const saveProfile = async () => {
    const { data } = await api.patch('/users/me', { name, phone });
    useAuthStore.setState({ user: data.user });
    setProfile(p => p ? { ...p, user: data.user } : p);
    toast.success('Profile updated');
  };
  const changePassword = async () => {
    if (passwords.next.length < 6) return toast.error('New password must be at least 6 characters');
    if (passwords.next !== passwords.confirm) return toast.error('Passwords do not match');
    await api.post('/users/me/password', { currentPassword: passwords.current, newPassword: passwords.next });
    toast.success('Password updated. Sign in again.');
    await logout(); router.replace('/login');
  };

  const student = profile?.student;
  return <div className="space-y-6 pb-10">
    <PageHeader title="Student Profile" description="Your verified account and examination accommodations." breadcrumbs={[{ label: 'Student', href: '/student/dashboard' }, { label: 'Profile' }]} showSearch={false} />
    <div className="grid gap-6 lg:grid-cols-3">
      <Card><CardHeader><CardTitle>{profile?.user.name || authUser?.name || 'Loading...'}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
        <p>{profile?.user.email || authUser?.email}</p><Badge>{student?.registerNumber || 'Student'}</Badge>
        <p>{student?.className} · {student?.departmentName}</p><p>{student?.schoolName} · Batch {student?.batchName}</p>
        {student?.joinedAt && <p className="text-slate-500">Joined {new Date(student.joinedAt).toLocaleDateString()}</p>}
      </CardContent></Card>
      <Card className="lg:col-span-2"><CardHeader><CardTitle>Exam statistics</CardTitle></CardHeader><CardContent className="grid grid-cols-3 gap-3 text-center">
        {[['Upcoming', student?.upcomingExams], ['Active', student?.activeExams], ['Completed', student?.completedExams]].map(([label, value]) => <div className="rounded-lg bg-slate-50 p-4" key={label as string}><strong className="block text-2xl">{value ?? '—'}</strong><span className="text-sm text-slate-500">{label}</span></div>)}
      </CardContent></Card>
      <Card className="lg:col-span-2"><CardHeader><CardTitle>Personal information</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
        <div><Label htmlFor="profile-name">Full name</Label><Input id="profile-name" value={name} onChange={e => setName(e.target.value)} /></div>
        <div><Label htmlFor="profile-phone">Phone</Label><Input id="profile-phone" value={phone} onChange={e => setPhone(e.target.value)} /></div>
        <div className="md:col-span-2"><Label>Email</Label><Input value={profile?.user.email || authUser?.email || ''} readOnly aria-readonly="true" /></div>
        <Button onClick={saveProfile}>Save profile</Button>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Accessibility accommodations</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
        <p><strong>Extra exam time:</strong> {student?.extraTimeMinutes || 0} minutes</p>
        <p className="text-slate-600">{student?.accessibilityNotes || 'No additional accommodations recorded.'}</p>
        <p className="text-xs text-slate-500">Contact your administrator to change approved accommodations.</p>
      </CardContent></Card>
      <Card className="lg:col-span-3"><CardHeader><CardTitle>Change password</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-3">
        <div><Label htmlFor="current-password">Current password</Label><Input id="current-password" type="password" autoComplete="current-password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} /></div>
        <div><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" autoComplete="new-password" value={passwords.next} onChange={e => setPasswords({ ...passwords, next: e.target.value })} /></div>
        <div><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" autoComplete="new-password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} /></div>
        <Button onClick={changePassword}>Update password</Button>
      </CardContent></Card>
    </div>
  </div>;
}

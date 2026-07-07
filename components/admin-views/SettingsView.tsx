'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings as SettingsIcon, Shield, Bell, HardDrive, Palette, FileText, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface SettingsViewProps { role: 'admin' | 'super-admin'; }
type Settings = {
  platformName: string; supportEmail: string; timezone: string; strictFullscreen: boolean; disableClipboard: boolean;
  defaultGraceMinutes: number; theme: string; primaryColor: string; emailNotifications: boolean; systemAlerts: boolean;
  examSubmissionAlerts: boolean; sessionTimeoutMinutes: number; ipWhitelistEnabled: boolean; backupFrequency: string; includeMedia: boolean;
};
const defaults: Settings = { platformName: 'HexTorq Examinations', supportEmail: '', timezone: 'Asia/Kolkata', strictFullscreen: true, disableClipboard: true, defaultGraceMinutes: 5, theme: 'system', primaryColor: 'blue', emailNotifications: true, systemAlerts: true, examSubmissionAlerts: false, sessionTimeoutMinutes: 30, ipWhitelistEnabled: false, backupFrequency: 'daily', includeMedia: true };

export function SettingsView({ role }: SettingsViewProps) {
  const isSuperAdmin = role === 'super-admin'; const { setTheme } = useTheme();
  const [settings, setSettings] = useState<Settings>(defaults); const [saving, setSaving] = useState(false);
  const [backup, setBackup] = useState<{ name: string; bytes: number; createdAt: string } | null>(null); const [runningBackup, setRunningBackup] = useState(false);
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings(current => ({ ...current, [key]: value }));
  const loadBackup = () => isSuperAdmin && api.get('/settings/backup').then(({ data }) => setBackup(data.latest));
  useEffect(() => { api.get('/settings').then(({ data }) => setSettings({ ...defaults, ...data })); loadBackup(); }, [isSuperAdmin]);
  const save = async () => { setSaving(true); try { const { data } = await api.patch('/settings', settings); setSettings({ ...defaults, ...data }); setTheme(data.theme); toast.success('Settings saved'); } finally { setSaving(false); } };
  const runBackup = async () => { setRunningBackup(true); try { await api.post('/settings/backup'); await loadBackup(); toast.success('Database backup completed'); } finally { setRunningBackup(false); } };
  const downloadBackup = async () => { const { data } = await api.get('/settings/backup/download', { responseType: 'blob' }); const url = URL.createObjectURL(data); const link = document.createElement('a'); link.href = url; link.download = backup?.name || 'hextorq-backup.dump'; link.click(); URL.revokeObjectURL(url); };
  const Toggle = ({ field, title, text }: { field: keyof Settings; title: string; text: string }) => <div className="flex items-center justify-between gap-4"><div><Label className="text-base">{title}</Label><p className="text-sm text-slate-500">{text}</p></div><Switch checked={Boolean(settings[field])} onCheckedChange={value => set(field, value as never)} /></div>;

  return <div className="space-y-6 pb-10">
    <PageHeader title="System Settings" description="Persisted platform and organization settings." breadcrumbs={[{ label: isSuperAdmin ? 'Super Admin' : 'Admin', href: `/${role}/dashboard` }, { label: 'Settings' }]} showSearch={false} actions={<Button disabled={saving} onClick={save}><Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : 'Save Changes'}</Button>} />
    <Tabs defaultValue="general" orientation="vertical" className="flex flex-col gap-6 md:flex-row">
      <TabsList className="flex h-auto shrink-0 flex-col bg-transparent md:w-64"><TabsTrigger value="general"><SettingsIcon className="mr-2 h-4 w-4" />General</TabsTrigger><TabsTrigger value="exam"><FileText className="mr-2 h-4 w-4" />Exam Rules</TabsTrigger><TabsTrigger value="theme"><Palette className="mr-2 h-4 w-4" />Theme</TabsTrigger><TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>{isSuperAdmin && <><TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" />Security</TabsTrigger><TabsTrigger value="backup"><HardDrive className="mr-2 h-4 w-4" />Backup</TabsTrigger></>}</TabsList>
      <div className="min-w-0 flex-1">
        <TabsContent value="general"><Card><CardHeader><CardTitle>General Information</CardTitle><CardDescription>Platform identity and localization.</CardDescription></CardHeader><CardContent className="space-y-5"><div><Label>Platform Name</Label><Input value={settings.platformName} onChange={e => set('platformName', e.target.value)} /></div><div><Label>Support Email</Label><Input type="email" value={settings.supportEmail} onChange={e => set('supportEmail', e.target.value)} /></div><div><Label>Timezone</Label><Input value={settings.timezone} onChange={e => set('timezone', e.target.value)} placeholder="Asia/Kolkata" /></div></CardContent></Card></TabsContent>
        <TabsContent value="exam"><Card><CardHeader><CardTitle>Default Exam Rules</CardTitle></CardHeader><CardContent className="space-y-6"><Toggle field="strictFullscreen" title="Strict Fullscreen" text="Use fullscreen enforcement for newly created exams." /><Toggle field="disableClipboard" title="Disable Clipboard" text="Block copy, paste and cut during exams." /><div><Label>Default Grace Period (minutes)</Label><Input type="number" min="0" max="1440" value={settings.defaultGraceMinutes} onChange={e => set('defaultGraceMinutes', Number(e.target.value))} /></div></CardContent></Card></TabsContent>
        <TabsContent value="theme"><Card><CardHeader><CardTitle>Appearance</CardTitle></CardHeader><CardContent className="space-y-5"><div><Label>Theme</Label><select className="flex h-10 w-full rounded-md border bg-background px-3" value={settings.theme} onChange={e => set('theme', e.target.value)}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></div><div><Label>Primary Color</Label><select className="flex h-10 w-full rounded-md border bg-background px-3" value={settings.primaryColor} onChange={e => set('primaryColor', e.target.value)}><option value="blue">Blue</option><option value="emerald">Emerald</option><option value="purple">Purple</option><option value="slate">Slate</option></select></div></CardContent></Card></TabsContent>
        <TabsContent value="notifications"><Card><CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader><CardContent className="space-y-6"><Toggle field="emailNotifications" title="Email Notifications" text="Receive email summaries." /><Toggle field="systemAlerts" title="System Alerts" text="Show critical in-app alerts." /><Toggle field="examSubmissionAlerts" title="Exam Submission Alerts" text="Notify when exam submissions complete." /></CardContent></Card></TabsContent>
        {isSuperAdmin && <TabsContent value="security"><Card><CardHeader><CardTitle>Security Policy</CardTitle><CardDescription>2FA is intentionally excluded until a complete enrollment and recovery flow is implemented.</CardDescription></CardHeader><CardContent className="space-y-6"><Toggle field="ipWhitelistEnabled" title="IP Whitelisting" text="Persist the IP restriction policy flag." /><div><Label>Session Timeout (minutes)</Label><Input type="number" min="5" max="1440" value={settings.sessionTimeoutMinutes} onChange={e => set('sessionTimeoutMinutes', Number(e.target.value))} /></div></CardContent></Card></TabsContent>}
        {isSuperAdmin && <TabsContent value="backup"><Card><CardHeader><CardTitle>Database Backup</CardTitle><CardDescription>Real PostgreSQL backup state from the configured backup directory.</CardDescription></CardHeader><CardContent className="space-y-6"><div className="rounded-lg border bg-slate-50 p-4"><p className="font-semibold">Latest Backup</p><p className="text-sm text-slate-500">{backup ? `${new Date(backup.createdAt).toLocaleString()} · ${(backup.bytes / 1024 / 1024).toFixed(2)} MB · ${backup.name}` : 'No backup found'}</p></div><div><Label>Frequency</Label><select className="flex h-10 w-full rounded-md border bg-background px-3" value={settings.backupFrequency} onChange={e => set('backupFrequency', e.target.value)}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div><Toggle field="includeMedia" title="Include Media" text="Persist whether deployment backup jobs should include uploaded media." /><div className="flex gap-3"><Button disabled={runningBackup} onClick={runBackup}>{runningBackup ? 'Running...' : 'Run Backup Now'}</Button><Button variant="outline" disabled={!backup} onClick={downloadBackup}><Download className="mr-2 h-4 w-4" />Download Latest</Button></div></CardContent></Card></TabsContent>}
      </div>
    </Tabs>
  </div>;
}

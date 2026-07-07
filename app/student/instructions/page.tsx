'use client';

import { useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Monitor, Wifi, Clock, Calculator, AlertTriangle } from 'lucide-react';
import { useExamStore } from '@/store/examStore';

export default function StudentInstructionsPage() {
  const { myMappings, fetchMyMappings } = useExamStore();
  useEffect(() => { fetchMyMappings(); }, [fetchMyMappings]);
  return <div className="space-y-6 pb-10">
    <PageHeader title="Exam Instructions" description="Read the general rules and the settings for each assigned examination." breadcrumbs={[{ label: 'Student', href: '/student/dashboard' }, { label: 'Instructions' }]} showSearch={false} />
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[['Secure environment', 'Stay in fullscreen and do not switch tabs.', Monitor], ['Connectivity', 'Answers save locally and synchronize automatically.', Wifi], ['Server deadline', 'The server submits the attempt when time expires.', Clock], ['Academic integrity', 'Shortcuts and prohibited actions are recorded.', ShieldCheck]].map(([title, text, Icon]: any) => <Card key={title}><CardContent className="p-5"><Icon className="mb-3 h-6 w-6 text-blue-600" /><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-slate-500">{text}</p></CardContent></Card>)}
    </div>
    <Card><CardHeader><CardTitle>Assigned Exam Rules</CardTitle></CardHeader><CardContent className="space-y-4">
      {myMappings.length === 0 ? <p className="text-sm text-slate-500">No examinations are currently assigned.</p> : myMappings.map(mapping => <section key={mapping.id} className="rounded-xl border p-5">
        <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold">{mapping.examTitle}</h3>{mapping.examIsTest && <Badge className="bg-amber-100 text-amber-700">TEST EXAM</Badge>}</div>
        <p className="mt-1 text-sm text-slate-500">{mapping.date} · {mapping.startTime}–{mapping.endTime} · {mapping.examDuration} minutes</p>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><p className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" />Auto-submit at {mapping.examMaxViolations || 5} violations</p><p className="flex items-center gap-2"><Calculator className="h-4 w-4 text-blue-600" />Calculator {mapping.examCalculatorEnabled ? 'allowed' : 'not allowed'}</p><p className="flex items-center gap-2"><Clock className="h-4 w-4 text-purple-600" />Grace: {mapping.graceMinutes || 0} minutes</p></div>
      </section>)}
    </CardContent></Card>
  </div>;
}

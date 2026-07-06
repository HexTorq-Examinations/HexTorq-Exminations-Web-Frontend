'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminStore } from '@/store/adminStore';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';

export default function CreateExamPage() {
  const router = useRouter();
  const { addExam } = useAdminStore();
  
  const [formData, setFormData] = useState({
    title: '',
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
    status: 'Draft' as const,
    maxViolations: 5,
    calculatorEnabled: false,
    isTestExam: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    await addExam({
      title: formData.title,
      subject: 'General',
      duration: Number(formData.duration),
      totalMarks: Number(formData.totalMarks),
      passingMarks: Number(formData.passingMarks),
      status: formData.status,
      shuffleQuestions: false,
      shuffleOptions: false,
      negativeMarking: false,
      maxViolations: formData.maxViolations,
      calculatorEnabled: formData.calculatorEnabled,
      isTestExam: formData.isTestExam,
    });

    router.push('/admin/exams');
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Create Exam" 
        description="Configure a new examination for students."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' }, 
          { label: 'Exams', href: '/admin/exams' },
          { label: 'Create' }
        ]}
        showSearch={false}
        actions={
          <Link href="/admin/exams" passHref>
            <Button variant="outline" className="shadow-sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exams
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <CardTitle className="text-lg font-bold">Exam Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Exam Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. Software Engineering Midterm" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Minutes)</Label>
                <Input 
                  id="duration" 
                  type="number"
                  min="10"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input 
                  id="totalMarks" 
                  type="number"
                  min="1"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({...formData, totalMarks: Number(e.target.value)})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingMarks">Passing Marks</Label>
                <Input 
                  id="passingMarks" 
                  type="number"
                  min="1"
                  value={formData.passingMarks}
                  onChange={(e) => setFormData({...formData, passingMarks: Number(e.target.value)})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxViolations">Maximum Violations</Label>
                <Input id="maxViolations" type="number" min="1" max="50" value={formData.maxViolations} onChange={(e) => setFormData({...formData, maxViolations: Number(e.target.value)})} required />
                <p className="text-xs text-slate-500">The attempt auto-submits when this count is reached.</p>
              </div>
            </div>
            <div className="space-y-4 rounded-lg border bg-slate-50 p-4 dark:bg-slate-900/50">
              <div className="flex items-center justify-between"><div><Label htmlFor="calculatorEnabled">Allow Calculator</Label><p className="text-xs text-slate-500">Shows the built-in calculator during this exam.</p></div><Switch id="calculatorEnabled" checked={formData.calculatorEnabled} onCheckedChange={(value) => setFormData({...formData, calculatorEnabled: value})} /></div>
              <div className="flex items-center justify-between"><div><Label htmlFor="isTestExam">Test Exam</Label><p className="text-xs text-slate-500">Labels this as a practice/testing examination.</p></div><Switch id="isTestExam" checked={formData.isTestExam} onCheckedChange={(value) => setFormData({...formData, isTestExam: value})} /></div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 p-6 flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/admin/exams')}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="mr-2 h-4 w-4" /> Create Exam
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

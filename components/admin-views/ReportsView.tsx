'use client';

import React, { useEffect, useState } from 'react';

import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, ClipboardCheck, BarChart2, Download, TrendingUp, Filter, Search, LineChart, PieChart, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar
} from 'recharts';
import { api } from '@/lib/api';
import { useAcademicStore } from '@/store/academicStore';

interface ReportsViewProps {
  role: 'admin' | 'super-admin';
}

interface StatsData {
  totalStudents: number;
  totalExams: number;
  publishedResults: number;
  totalAttempts: number;
}

export function ReportsView({ role }: ReportsViewProps) {
  const isSuperAdmin = role === 'super-admin';
  const { selectedBatchId } = useAcademicStore();
  const [studentsByDepartment, setStudentsByDepartment] = useState<{ name: string; students: number }[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<{ name: string; attempts: number }[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    const params = !isSuperAdmin && selectedBatchId ? { batchId: selectedBatchId } : {};
    Promise.all([
      api.get('/dashboard/overview', { params }),
      api.get(isSuperAdmin ? '/dashboard/super-admin' : '/dashboard/admin', { params }),
    ]).then(([overviewRes, statsRes]) => {
      setStudentsByDepartment(overviewRes.data.studentsByDepartment || []);
      setWeeklyActivity(overviewRes.data.weeklyActivity || []);
      setStats(statsRes.data);
    });
  }, [isSuperAdmin, selectedBatchId]);

  const handleExport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Students', String(stats?.totalStudents ?? 0)],
      ['Total Exams', String(stats?.totalExams ?? 0)],
      ['Published Results', String(stats?.publishedResults ?? 0)],
      ['Exam Attempts', String(stats?.totalAttempts ?? 0)],
      [],
      ['Department', 'Students'],
      ...studentsByDepartment.map((d) => [d.name, String(d.students)]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.setAttribute('download', `platform-report-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statTiles = [
    { title: 'Total Students', value: (stats?.totalStudents ?? 0).toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Exams', value: (stats?.totalExams ?? 0).toLocaleString(), icon: ClipboardCheck, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Published Results', value: (stats?.publishedResults ?? 0).toLocaleString(), icon: BarChart2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Exam Attempts', value: (stats?.totalAttempts ?? 0).toLocaleString(), icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  const reportCategories = [
    { 
      title: 'Student Performance', 
      desc: 'Detailed breakdown of student grades, percentiles, and improvement over time.',
      icon: TrendingUp,
      color: 'text-blue-600', bg: 'bg-blue-100'
    },
    { 
      title: 'Attendance & Activity', 
      desc: 'Login history, exam completion rates, and system engagement metrics.',
      icon: Users,
      color: 'text-emerald-600', bg: 'bg-emerald-100'
    },
    { 
      title: 'Exam Analysis', 
      desc: 'Difficulty distribution, completion time, and overall exam success rates.',
      icon: ClipboardCheck,
      color: 'text-purple-600', bg: 'bg-purple-100'
    },
    { 
      title: 'Question Analytics', 
      desc: 'Most failed questions, subject mastery, and question bank health.',
      icon: AlertCircle,
      color: 'text-amber-600', bg: 'bg-amber-100'
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Reports & Analytics" 
        description="Generate and download comprehensive system reports."
        breadcrumbs={[
          { label: isSuperAdmin ? 'Super Admin' : 'Admin', href: `/${role}/dashboard` },
          { label: 'Reports' }
        ]}
        showSearch={false}
        actions={
          <Button onClick={handleExport} className="bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        }
      />
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statTiles.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg} dark:bg-opacity-20`}>
                <stat.icon className={`w-8 h-8 ${stat.color} dark:text-opacity-80`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Exam Attempts Chart (real data, this week) */}
        <div className="lg:col-span-8">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold">Exam Attempts (This Week)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-70 w-full mt-4">
                {weeklyActivity.every((d) => d.attempts === 0) ? (
                  <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">No exam attempts this week</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyActivity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} allowDecimals={false} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="attempts" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAttempts)" name="Exam Attempts" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Report Generate */}
        <div className="lg:col-span-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Custom Report Builder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Report Type</label>
                <select className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300">
                  <option>Student Performance</option>
                  <option>Exam Completion</option>
                  <option>System Logs</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date Range</label>
                <select className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Quarter</option>
                  <option>This Year</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Format</label>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">PDF</Button>
                  <Button variant="outline" className="flex-1">Excel</Button>
                  <Button variant="outline" className="flex-1">CSV</Button>
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Students per Department (real data) */}
        <div className="lg:col-span-12">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Students per Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-70 w-full">
                {studentsByDepartment.length === 0 ? (
                  <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">No students enrolled yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={studentsByDepartment} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="students" fill="#3b82f6" name="Students" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Downloadable Report Cards */}
        <div className="lg:col-span-12">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 mt-2">Standard Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportCategories.map((category, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800 flex flex-col h-full">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${category.bg} dark:bg-opacity-20`}>
                    <category.icon className={`w-6 h-6 ${category.color} dark:text-opacity-80`} />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{category.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-1">
                    {category.desc}
                  </p>
                  <Button variant="outline" className="w-full mt-auto">
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

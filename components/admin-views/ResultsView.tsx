'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileBarChart, Trophy, TrendingUp, AlertTriangle, CheckCircle, Download, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAdminStore } from '@/store/adminStore';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonTable } from '@/components/common/SkeletonTable';
import { api } from '@/lib/api';

interface ResultsViewProps {
  role: 'admin' | 'super-admin';
}

interface ResultsAnalytics {
  totalStudents: number;
  overallPassRate: number;
  averageScorePercent: number;
  needsAttention: number;
  subjectPerformance: { subject: string; average: number; highest: number }[];
  gradeDistribution: { name: string; value: number; color: string }[];
}

export function ResultsView({ role }: ResultsViewProps) {
  const isSuperAdmin = role === 'super-admin';
  const { results, isLoading, fetchResults, publishResult } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [analytics, setAnalytics] = useState<ResultsAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingAnalytics(true);
    api.get('/results/analytics')
      .then(({ data }) => { if (!cancelled) setAnalytics(data); })
      .finally(() => { if (!cancelled) setIsLoadingAnalytics(false); });
    return () => { cancelled = true; };
  }, []);

  const barData = analytics?.subjectPerformance || [];
  const pieData = analytics?.gradeDistribution || [];
  const hasGrades = pieData.some((d) => d.value > 0);

  const handlePublishAll = () => {
    results.filter(r => r.status !== 'Published').forEach(r => {
      if (r.id) publishResult(r.id);
    });
  };

  // Filtering
  const filteredResults = results.filter(r => 
    r.examName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.examId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalRecords = filteredResults.length;
  const startIndex = (currentPage - 1) * pageSize;
  const currentResults = filteredResults.slice(startIndex, startIndex + pageSize);

  const stats = [
    { title: 'Total Results', value: results.length, icon: FileBarChart, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Overall Pass Rate', value: `${analytics?.overallPassRate ?? 0}%`, icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Average Score', value: `${analytics?.averageScorePercent ?? 0}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Needs Attention', value: analytics?.needsAttention ?? 0, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Results & Analytics" 
        description="Review exam performance, generate result sheets, and analyze statistics."
        breadcrumbs={[
          { label: isSuperAdmin ? 'Super Admin' : 'Admin', href: `/${role}/dashboard` },
          { label: 'Results' }
        ]}
        showSearch={true}
        onSearch={setSearchTerm}
        actions={
          <Button onClick={handlePublishAll} className="bg-teal-600 hover:bg-teal-700 text-white">
            <Share2 className="w-4 h-4 mr-2" /> Publish Results
          </Button>
        }
      />
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Subject Performance Averages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-70 w-full mt-4">
              {isLoadingAnalytics ? (
                <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">Loading...</div>
              ) : barData.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">No completed exams yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
                    <Tooltip
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="average" name="Average Score %" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                    <Bar dataKey="highest" name="Highest Score %" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-70">
            {isLoadingAnalytics ? (
              <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">Loading...</div>
            ) : !hasGrades ? (
              <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">No completed exams yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center text-xs text-slate-600">
                      <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: item.color }} />
                      {item.name} ({item.value})
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Table Area */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Exam Results Registry</h3>
          <Button variant="outline" size="sm" className="h-8 shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Download All
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4"><SkeletonTable rows={5} cols={5} /></div>
          ) : currentResults.length > 0 ? (
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Exam Name</TableHead>
                  <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Candidates</TableHead>
                  <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Date Published</TableHead>
                  <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-200">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentResults.map((result) => (
                  <TableRow key={result.id} className="border-slate-200 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-slate-100">{result.examName}</span>
                        <span className="text-xs text-slate-500">ID: {result.examId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400 font-medium">
                      {result.totalStudents} Evaluated
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {result.status === 'Published' ? new Date(result.publishedDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={`
                          ${result.status === 'Published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : ''}
                          ${result.status === 'Pending Evaluation' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : ''}
                          ${result.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : ''}
                          font-medium border-0
                        `}
                      >
                        {result.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {result.status === 'Pending Evaluation' ? (
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => publishResult(result.id!)}
                          disabled={isLoading}
                        >
                          <Share2 className="w-4 h-4 mr-1.5" /> Publish
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="shadow-sm">
                          <Eye className="w-4 h-4 mr-1.5 text-slate-500" /> View Report
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState 
              title="No results found" 
              description={searchTerm ? `No results match your search "${searchTerm}".` : "There are currently no exam results available."}
              actionLabel={searchTerm ? "Clear Search" : undefined}
              onAction={searchTerm ? () => setSearchTerm('') : undefined}
            />
          )}
        </div>
        
        <Pagination 
          currentPage={currentPage}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  );
}

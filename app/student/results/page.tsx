'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, BarChart2, FileText, Download, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEffect } from 'react';
import { api } from '@/lib/api';

import { useExamStore } from '@/store/examStore';

const gradeColor: Record<string, string> = {
  'A+': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'A': 'bg-green-100 text-green-700 border-green-200',
  'B+': 'bg-blue-100 text-blue-700 border-blue-200',
  'B': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'C': 'bg-amber-100 text-amber-700 border-amber-200',
  'F': 'bg-red-100 text-red-700 border-red-200',
};
const GRADE_ORDER = ['A+', 'A', 'B+', 'B', 'C', 'F'];

const gradeFromPct = (pct: number) => (pct > 90 ? 'A+' : pct > 80 ? 'A' : pct > 70 ? 'B+' : pct > 60 ? 'B' : 'C');

export default function StudentResults() {
  const { examHistory, fetchExamHistory } = useExamStore();

  useEffect(() => {
    fetchExamHistory();
  }, [fetchExamHistory]);

  // Scores/grades are only computed for exams the Admin has actually published a
  // Result for (h.resultStatus, from the server) — score is null otherwise, and we
  // never guess or reveal a percentage from it.
  const results = (examHistory || []).map((h, i) => {
    const isPublished = h.resultStatus === 'Published' && h.score !== null;
    const scorePct = isPublished && h.totalMarks ? (h.score! / h.totalMarks) * 100 : null;

    return {
      id: i,
      examId: h.examId,
      exam: h.examTitle || 'Unknown Exam',
      subject: h.examSubject || 'Unknown',
      date: new Date(h.date).toLocaleDateString(),
      score: isPublished ? h.score! : null,
      total: h.totalMarks || 0,
      grade: scorePct !== null ? gradeFromPct(scorePct) : null,
      status: isPublished ? 'Published' as const : 'Pending Evaluation' as const,
    };
  });

  const published = results.filter(r => r.status === 'Published');
  const totalObtained = published.reduce((s, r) => s + (r.score || 0), 0);
  const totalPossible = published.reduce((s, r) => s + r.total, 0);
  const overallPct = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100) : 0;
  const bestGrade = published.reduce<string | null>((best, r) => {
    if (!r.grade) return best;
    if (!best) return r.grade;
    return GRADE_ORDER.indexOf(r.grade) < GRADE_ORDER.indexOf(best) ? r.grade : best;
  }, null) || '—';

  const metrics = [
    { title: 'Exams Completed', value: results.length.toString(), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Overall Score', value: `${overallPct}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Best Grade', value: bestGrade, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Pending Results', value: results.filter(r => r.status !== 'Published').length.toString(), icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const handleDownload = async (examId: string, exam: string) => {
    const { data } = await api.get(`/exams/${examId}/scorecard.pdf`, { responseType: 'blob' });
    const href = URL.createObjectURL(data);
    const anchor = document.createElement('a');
    anchor.href = href; anchor.download = `${exam}-scorecard.pdf`; anchor.click();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="My Results"
        description="View your examination results and performance analytics."
        breadcrumbs={[{ label: 'Student', href: '/student/dashboard' }, { label: 'Results' }]}
        showSearch={false}
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${m.bg} dark:bg-opacity-20`}>
                <m.icon className={`w-8 h-8 ${m.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{m.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{m.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Results Table */}
        <div className="lg:col-span-8">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-bold">Examination Results</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                  <TableRow>
                    <TableHead>Exam</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r) => (
                    <TableRow key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{r.exam}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">{r.subject}</TableCell>
                      <TableCell className="text-slate-500 text-sm">{r.date}</TableCell>
                      <TableCell>
                        {r.status === 'Published' ? (
                          <div className="space-y-1 min-w-[80px]">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{r.score}/{r.total}</span>
                            <Progress value={(r.score! / r.total) * 100} className="h-1.5" />
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Awaiting publication</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {r.status === 'Published' && r.grade ? (
                          <Badge variant="outline" className={gradeColor[r.grade] || ''}>{r.grade}</Badge>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={r.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {r.status === 'Published' ? (
                          <Button variant="ghost" size="sm" onClick={() => handleDownload(r.examId, r.exam)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Download className="h-4 w-4 mr-1" /> PDF
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400 px-3">Pending</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <div className="lg:col-span-4 space-y-6">

          {/* Overall Performance */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" /> Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-slate-900 dark:text-slate-100">{overallPct}%</div>
                <p className="text-slate-500 mt-1 text-sm">Cumulative Score (Published Only)</p>
              </div>
              <Progress value={overallPct} className="h-3 mt-2" />
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Published</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{published.length}</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Pending</p>
                  <p className="font-bold text-amber-600">{results.length - published.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Scores */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-bold">Subject Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {published.length === 0 ? (
                <p className="text-sm text-slate-400">No published results yet.</p>
              ) : (
                published.map((r) => (
                  <div key={r.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{r.subject}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{Math.round((r.score! / r.total) * 100)}%</span>
                    </div>
                    <Progress value={(r.score! / r.total) * 100} className="h-2" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

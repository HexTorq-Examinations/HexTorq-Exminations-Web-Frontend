'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, MapPin, Users, MoreVertical, Edit, Trash2, CheckCircle, Plus } from 'lucide-react';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import { useAdminStore } from '@/store/adminStore';
import { Schedule } from '@/types/admin';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonTable } from '@/components/common/SkeletonTable';
import { toast } from 'sonner';

interface SchedulesViewProps {
  role: 'admin' | 'super-admin';
}

export function SchedulesView({ role }: SchedulesViewProps) {
  const isSuperAdmin = role === 'super-admin';
  const { exams, isLoading, fetchExams, updateExam } = useAdminStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Derive schedules from exams
  const derivedSchedules = exams
    .filter(e => e.startDate && e.status !== 'Draft')
    .map(e => ({
      id: e.id,
      examId: e.id,
      examName: e.title,
      batch: 'All Batches',
      department: e.subject,
      date: new Date(e.startDate).toISOString().split('T')[0],
      startTime: new Date(e.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: new Date(e.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hall: 'Online',
      status: e.status
    }));

  // Filtering
  const filteredSchedules = derivedSchedules.filter(s => {
    const matchesSearch = s.examName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesDate = !date || new Date(s.date).toDateString() === date.toDateString();
    
    return matchesSearch && matchesDate;
  });

  // Pagination
  const totalRecords = filteredSchedules.length;
  const startIndex = (currentPage - 1) * pageSize;
  const currentSchedules = filteredSchedules.slice(startIndex, startIndex + pageSize);

  const handleComplete = async (schedule: any) => {
    if (schedule.id) {
      await updateExam(schedule.id, { status: 'Completed' });
      toast.success(`Exam marked as completed`);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Examination Schedules" 
        description="Plan, assign, and track examination timings and venues."
        breadcrumbs={[
          { label: isSuperAdmin ? 'Super Admin' : 'Admin', href: `/${role}/dashboard` },
          { label: 'Schedules' }
        ]}
        showSearch={true}
        onSearch={setSearchTerm}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Widget */}
        <Card className="col-span-1 border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-indigo-500" /> Exam Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              modifiers={{ scheduled: derivedSchedules.map(s => new Date(s.date)) }}
              modifiersClassNames={{ scheduled: "bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 rounded-md" }}
              className="rounded-md border border-slate-200 dark:border-slate-800"
            />
          </CardContent>
        </Card>

        {/* Schedule Table */}
        <Card className="col-span-1 lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-4"><SkeletonTable rows={5} cols={5} /></div>
            ) : currentSchedules.length > 0 ? (
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                  <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Exam Name</TableHead>
                    <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Batch / Dept</TableHead>
                    <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Date & Time</TableHead>
                    <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Status</TableHead>
                    <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-200">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSchedules.map((schedule) => (
                    <TableRow key={schedule.id} className="border-slate-200 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-slate-100">{schedule.examName}</span>
                          <span className="text-xs text-slate-500 flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" /> {schedule.hall}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">{schedule.batch}</span>
                          <span className="text-xs text-slate-500 flex items-center mt-1">
                            <Users className="w-3 h-3 mr-1" /> {schedule.department}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{new Date(schedule.date).toLocaleDateString()}</span>
                          <span className="text-xs text-slate-500">{schedule.startTime} - {schedule.endTime}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={`
                            ${schedule.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : ''}
                            ${schedule.status === 'Scheduled' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' : ''}
                            ${schedule.status === 'Completed' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : ''}
                            ${schedule.status === 'Draft' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : ''}
                            font-medium border-0
                          `}
                        >
                          {schedule.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 focus:outline-none">
                              <MoreVertical className="h-4 w-4" />
                            </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {schedule.status !== 'Completed' && (
                              <DropdownMenuItem className="cursor-pointer text-emerald-600 focus:text-emerald-600" onClick={() => handleComplete(schedule)}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Mark Complete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState 
                title="No schedules found" 
                description={searchTerm ? `No schedules match your search "${searchTerm}".` : "There are currently no scheduled exams."}
                actionLabel={searchTerm ? "Clear Search" : undefined}
                onAction={() => searchTerm ? setSearchTerm('') : undefined}
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
    </div>
  );
}

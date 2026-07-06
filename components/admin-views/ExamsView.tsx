'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardCheck, PlayCircle, CalendarClock, Edit3, MoreVertical, Settings, Eye, Copy, Trash2, Send, Users, Edit, Plus, ListChecks } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import { useAdminStore } from '@/store/adminStore';
import { Exam } from '@/types/admin';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonTable } from '@/components/common/SkeletonTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ExamFormModal } from './modals/ExamFormModal';
import { toast } from 'sonner';

interface ExamsViewProps {
  role: 'admin' | 'super-admin';
}

export function ExamsView({ role }: ExamsViewProps) {
  const isSuperAdmin = role === 'super-admin';
  const router = useRouter();
  const { exams, isLoading, fetchExams, deleteExam, updateExam } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState<Exam | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleAdd = () => {
    setExamToEdit(null);
    setEditModalOpen(true);
  };

  // Filtering
  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalRecords = filteredExams.length;
  const startIndex = (currentPage - 1) * pageSize;
  const currentExams = filteredExams.slice(startIndex, startIndex + pageSize);

  const stats = [
    { title: 'Total Exams', value: exams.length, icon: ClipboardCheck, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Published', value: exams.filter(e => e.status === 'Published').length, icon: PlayCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Completed', value: exams.filter(e => e.status === 'Completed').length, icon: CalendarClock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Drafts', value: exams.filter(e => e.status === 'Draft').length, icon: Edit3, color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  const handleEdit = (exam: Exam) => {
    setExamToEdit(exam);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setExamToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (examToDelete) {
      await deleteExam(examToDelete);
      setDeleteConfirmOpen(false);
      setExamToDelete(null);
    }
  };

  const handleDuplicate = async (exam: Exam) => {
    // Duplicate exam implies calling addExam or just a toast for now to simulate.
    toast.success(`Duplicated exam: ${exam.title}`);
  };

  const handleManageQuestions = (exam: Exam) => {
    router.push(`/${role}/exams/questions?examId=${exam.id}`);
  };

  const handlePublish = async (exam: Exam) => {
    if (exam.id) {
      if (!exam.questionCount) {
        toast.error('Add questions before publishing this exam');
        return;
      }
      await updateExam(exam.id, { status: 'Published' });
      toast.success(`Exam ${exam.title} published`);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Exam Management" 
        description="Create, configure, and monitor examinations."
        breadcrumbs={[
          { label: isSuperAdmin ? 'Super Admin' : 'Admin', href: `/${role}/dashboard` },
          { label: 'Exams' }
        ]}
        showSearch={true}
        onSearch={setSearchTerm}
        actions={
          <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Create Exam
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

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4"><SkeletonTable rows={5} cols={7} /></div>
          ) : currentExams.length > 0 ? (
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Exam Details</TableHead>
                  <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Subject</TableHead>
                  <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Duration</TableHead>
                  <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Mappings</TableHead>
                  <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-200">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentExams.map((exam) => (
                  <TableRow key={exam.id} className="border-slate-200 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-slate-100">{exam.title}</span>
                        <span className="text-xs text-slate-500">{exam.questionCount || 0} Questions • {exam.totalMarks} Marks</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{exam.subject}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{exam.duration} mins</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Users className="w-3.5 h-3.5" /> {exam.mappingCount || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`
                          ${exam.status === 'Published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : ''}
                          ${exam.status === 'Completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : ''}
                          ${exam.status === 'Draft' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : ''}
                          font-medium border-0
                        `}
                      >
                        {exam.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 focus:outline-none">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {exam.status === 'Draft' && (
                            <DropdownMenuItem className="cursor-pointer text-emerald-600 focus:text-emerald-600" onClick={() => handlePublish(exam)}>
                              <Send className="mr-2 h-4 w-4" /> Publish Exam
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4 text-slate-500" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleEdit(exam)}>
                            <Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleManageQuestions(exam)}>
                            <ListChecks className="mr-2 h-4 w-4 text-purple-500" /> Manage Questions
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleDuplicate(exam)}>
                            <Copy className="mr-2 h-4 w-4 text-indigo-500" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4 text-slate-500" /> Configure Rules
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950" onClick={() => handleDeleteClick(exam.id!)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Exam
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState 
              title="No exams found" 
              description={searchTerm ? `No exams match your search "${searchTerm}".` : "There are currently no exams in the system."}
              actionLabel={searchTerm ? "Clear Search" : "Create Exam"}
              onAction={() => searchTerm ? setSearchTerm('') : setEditModalOpen(true)}
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

      <ExamFormModal 
        open={editModalOpen} 
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setTimeout(() => setExamToEdit(null), 200);
        }}
        examToEdit={examToEdit}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Exam"
        description="Are you sure you want to delete this exam? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </div>
  );
}

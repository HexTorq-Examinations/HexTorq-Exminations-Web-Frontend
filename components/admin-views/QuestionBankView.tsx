'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Database, Plus, Tags, Layers, FileQuestion, MoreVertical, Edit, Trash2, Eye, ListPlus, UploadCloud } from 'lucide-react';
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
import { Question } from '@/types/admin';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonTable } from '@/components/common/SkeletonTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { QuestionFormModal } from './modals/QuestionFormModal';
import { BulkQuestionEntryModal } from './modals/BulkQuestionEntryModal';
import { FileImportQuestionsModal } from './modals/FileImportQuestionsModal';

interface QuestionBankViewProps {
  role: 'admin' | 'super-admin';
}

export function QuestionBankView({ role }: QuestionBankViewProps) {
  const isSuperAdmin = role === 'super-admin';
  const { questions, isLoading, fetchQuestions, deleteQuestion } = useAdminStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);

  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleAdd = () => {
    setQuestionToEdit(null);
    setEditModalOpen(true);
  };

  // Filtering
  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalRecords = filteredQuestions.length;
  const startIndex = (currentPage - 1) * pageSize;
  const currentQuestions = filteredQuestions.slice(startIndex, startIndex + pageSize);

  const stats = [
    { title: 'Total Questions', value: questions.length, icon: Database, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Subjects', value: new Set(questions.map(q => q.subject)).size, icon: Tags, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Multiple Choice', value: questions.filter(q => q.type === 'Multiple Choice').length, icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Descriptive', value: questions.filter(q => q.type === 'Descriptive').length, icon: FileQuestion, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  const handleEdit = (question: Question) => {
    setQuestionToEdit(question);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setQuestionToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (questionToDelete) {
      await deleteQuestion(questionToDelete);
      setDeleteConfirmOpen(false);
      setQuestionToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Question Bank" 
        description="Centralized repository of questions for all examinations."
        breadcrumbs={[
          { label: isSuperAdmin ? 'Super Admin' : 'Admin', href: `/${role}/dashboard` },
          { label: 'Question Bank' }
        ]}
        showSearch={true}
        onSearch={setSearchTerm}
        actions={
          <div className="flex gap-3">
            <Button onClick={() => setImportModalOpen(true)} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950">
              <UploadCloud className="w-4 h-4 mr-2" /> Import File
            </Button>
            <Button onClick={() => setBulkModalOpen(true)} variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950">
              <ListPlus className="w-4 h-4 mr-2" /> Bulk Add
            </Button>
            <Button onClick={handleAdd} className="bg-orange-600 hover:bg-orange-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Question
            </Button>
          </div>
        }
      />
      
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
            <div className="p-4"><SkeletonTable rows={5} cols={5} /></div>
          ) : currentQuestions.length > 0 ? (
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="w-[400px] font-semibold text-slate-900 dark:text-slate-200">Question Text</TableHead>
                  <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Subject</TableHead>
                  <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Type</TableHead>
                  <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Difficulty</TableHead>
                  <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-200">Marks</TableHead>
                  <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-200">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentQuestions.map((q) => (
                  <TableRow key={q.id} className="border-slate-200 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <TableCell>
                      <div className="line-clamp-2 font-medium text-slate-900 dark:text-slate-100">
                        {q.text}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{q.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                        {q.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={`
                          ${q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : ''}
                          ${q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : ''}
                          ${q.difficulty === 'Hard' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : ''}
                          font-medium border-0
                        `}
                      >
                        {q.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-900 dark:text-slate-100">{q.marks}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 focus:outline-none">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4 text-slate-500" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleEdit(q)}>
                            <Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit Question
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950" onClick={() => handleDeleteClick(q.id!)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Question
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
              title="No questions found" 
              description={searchTerm ? `No questions match your search "${searchTerm}".` : "There are currently no questions in the repository."}
              actionLabel={searchTerm ? "Clear Search" : "Add Question"}
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

      <QuestionFormModal 
        open={editModalOpen} 
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setTimeout(() => setQuestionToEdit(null), 200);
        }}
        questionToEdit={questionToEdit}
      />

      <BulkQuestionEntryModal
        open={bulkModalOpen}
        onOpenChange={setBulkModalOpen}
      />

      <FileImportQuestionsModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
      />

      <ConfirmDialog 
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </div>
  );
}

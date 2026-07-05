import React, { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { Exam, Question } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ExamQuestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: Exam | null;
}

export function ExamQuestionsModal({ open, onOpenChange, exam }: ExamQuestionsModalProps) {
  const { questions, updateExam, isLoading } = useAdminStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Update selected questions when exam changes
  useEffect(() => {
    if (open && exam) {
      setSelectedIds(exam.questions || []);
      setSearchTerm('');
    }
  }, [open, exam]);

  if (!exam) return null;

  // Filter questions by subject and search term
  const availableQuestions = questions.filter(q => q.subject === exam.subject);
  const filteredQuestions = availableQuestions.filter(q => 
    q.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate marks
  const selectedQuestions = availableQuestions.filter(q => selectedIds.includes(q.id!));
  const currentTotalMarks = selectedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
  const targetMarks = exam.totalMarks || 0;
  
  const isMatch = currentTotalMarks === targetMarks;
  const isOver = currentTotalMarks > targetMarks;

  const handleToggle = (questionId: string) => {
    setSelectedIds(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuestions.map(q => q.id!));
    }
  };

  const handleSave = async () => {
    await updateExam(exam.id!, { questions: selectedIds });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Manage Questions: {exam.title}</DialogTitle>
          <DialogDescription>
            Assign questions from the Question Bank matching the subject <strong>{exam.subject}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col mt-4 space-y-4">
          
          {/* Status Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
            <div>
              <p className="text-sm text-slate-500 font-medium">Selected Questions</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{selectedIds.length}</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-slate-500 font-medium">Total Marks</p>
              <p className={`text-2xl font-bold ${
                isMatch ? 'text-emerald-600' : isOver ? 'text-red-600' : 'text-amber-600'
              }`}>
                {currentTotalMarks} / {targetMarks}
              </p>
            </div>
            
            <div className="w-full sm:w-auto relative shrink-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search questions..." 
                className="pl-9 w-full sm:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Warning Banner */}
          {!isMatch && (
            <div className={`p-3 rounded-md text-sm shrink-0 border ${
              isOver 
                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:border-red-900 dark:text-red-300' 
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-300'
            }`}>
              {isOver 
                ? "Warning: Selected marks exceed the exam's total marks." 
                : "Note: Selected marks are less than the exam's total marks."}
            </div>
          )}

          {/* Questions List */}
          <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-md">
            {availableQuestions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No questions found in the Question Bank for the subject "{exam.subject}".
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No questions match your search.
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10 shadow-sm border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3 w-12 text-center">
                      <Checkbox 
                        checked={filteredQuestions.length > 0 && filteredQuestions.every(q => selectedIds.includes(q.id!))}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-3">Question</th>
                    <th className="p-3 w-24">Type</th>
                    <th className="p-3 w-24">Diff.</th>
                    <th className="p-3 w-20 text-right">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.map(q => (
                    <tr 
                      key={q.id} 
                      className={`border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors ${
                        selectedIds.includes(q.id!) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                      onClick={() => handleToggle(q.id!)}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={selectedIds.includes(q.id!)}
                          onCheckedChange={() => handleToggle(q.id!)}
                        />
                      </td>
                      <td className="p-3">
                        <p className="line-clamp-2 text-slate-900 dark:text-slate-100 font-medium">
                          {q.text}
                        </p>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                          {q.type === 'Multiple Choice' ? 'MCQ' : q.type}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs font-semibold ${
                          q.difficulty === 'Easy' ? 'text-emerald-600' :
                          q.difficulty === 'Medium' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                        {q.marks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? 'Saving...' : 'Save Questions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

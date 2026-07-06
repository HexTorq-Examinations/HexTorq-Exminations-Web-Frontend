import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExamSchema, type Exam } from '@/types/admin';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface ExamFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examToEdit?: Exam | null;
}

export function ExamFormModal({ open, onOpenChange, examToEdit }: ExamFormModalProps) {
  const { addExam, updateExam, isLoading } = useAdminStore();
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Exam>({
    resolver: zodResolver(ExamSchema) as any,
    defaultValues: examToEdit || {
      status: 'Draft',
      shuffleQuestions: false,
      shuffleOptions: false,
      negativeMarking: false,
      maxViolations: 5,
      calculatorEnabled: false,
      isTestExam: false,
    }
  });

  React.useEffect(() => {
    if (open) {
      if (examToEdit) {
        reset(examToEdit);
      } else {
        reset({ status: 'Draft', shuffleQuestions: false, shuffleOptions: false, negativeMarking: false, maxViolations: 5, calculatorEnabled: false, isTestExam: false });
      }
    }
  }, [open, examToEdit, reset]);

  const onSubmit = async (data: Exam) => {
    if (examToEdit?.id) {
      await updateExam(examToEdit.id, data);
    } else {
      await addExam(data);
    }
    onOpenChange(false);
  };

  const watchShuffle = watch('shuffleQuestions');
  const watchShuffleOptions = watch('shuffleOptions');
  const watchNegative = watch('negativeMarking');
  const watchCalculator = watch('calculatorEnabled');
  const watchTestExam = watch('isTestExam');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{examToEdit ? 'Edit Exam' : 'Create New Exam'}</DialogTitle>
          <DialogDescription>
            {examToEdit ? 'Update the details for this examination.' : 'Configure a new examination. You can add questions later.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label htmlFor="title">Exam Title *</Label>
              <Input id="title" {...register('title')} placeholder="e.g., Data Structures Final" />
              {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input id="subject" {...register('subject')} placeholder="e.g., Computer Science" />
              {errors.subject && <p className="text-red-500 text-xs">{errors.subject.message}</p>}
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" {...register('description')} placeholder="Brief instruction or overview..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Minutes) *</Label>
              <Input id="duration" type="number" {...register('duration')} placeholder="e.g., 60" />
              {errors.duration && <p className="text-red-500 text-xs">{errors.duration.message}</p>}
            </div>

            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="totalMarks">Total Marks *</Label>
                <Input id="totalMarks" type="number" {...register('totalMarks')} placeholder="100" />
                {errors.totalMarks && <p className="text-red-500 text-xs">{errors.totalMarks.message}</p>}
              </div>
              <div className="space-y-2 flex-1">
                <Label htmlFor="passingMarks">Passing Marks *</Label>
                <Input id="passingMarks" type="number" {...register('passingMarks')} placeholder="40" />
                {errors.passingMarks && <p className="text-red-500 text-xs">{errors.passingMarks.message}</p>}
              </div>
            </div>

            {/* Rules */}
            <div className="space-y-4 col-span-1 md:col-span-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
              <h4 className="font-semibold text-sm">Exam Rules</h4>
              <div className="flex items-center justify-between">
                <Label htmlFor="shuffle" className="font-normal cursor-pointer text-sm">Shuffle Questions for each candidate</Label>
                <Switch id="shuffle" checked={watchShuffle} onCheckedChange={(val) => setValue('shuffleQuestions', val)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="shuffleOptions" className="font-normal cursor-pointer text-sm">Shuffle Answer Options for each candidate</Label>
                <Switch id="shuffleOptions" checked={watchShuffleOptions} onCheckedChange={(val) => setValue('shuffleOptions', val)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="negative" className="font-normal cursor-pointer text-sm">Enable Negative Marking (25% deduction)</Label>
                <Switch id="negative" checked={watchNegative} onCheckedChange={(val) => setValue('negativeMarking', val)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_150px] sm:items-end">
                <div>
                  <Label htmlFor="maxViolations" className="text-sm">Maximum violations before auto-submit</Label>
                  <p className="mt-1 text-xs text-slate-500">The attempt is terminated when this count is reached.</p>
                </div>
                <Input id="maxViolations" type="number" min="1" max="50" {...register('maxViolations')} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="calculatorEnabled" className="font-normal cursor-pointer text-sm">Allow calculator during the exam</Label>
                <Switch id="calculatorEnabled" checked={watchCalculator} onCheckedChange={(val) => setValue('calculatorEnabled', val)} />
              </div>
              <div className="flex items-center justify-between">
                <div><Label htmlFor="isTestExam" className="font-normal cursor-pointer text-sm">Mark as test exam</Label><p className="text-xs text-slate-500">Clearly identifies practice/testing exams to admins and students.</p></div>
                <Switch id="isTestExam" checked={watchTestExam} onCheckedChange={(val) => setValue('isTestExam', val)} />
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading ? 'Saving...' : (examToEdit ? 'Save Changes' : 'Create Exam')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

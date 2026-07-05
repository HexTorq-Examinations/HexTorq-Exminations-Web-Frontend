import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScheduleSchema, type Schedule } from '@/types/admin';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScheduleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleToEdit?: Schedule | null;
}

export function ScheduleFormModal({ open, onOpenChange, scheduleToEdit }: ScheduleFormModalProps) {
  const { addSchedule, updateSchedule, exams, isLoading } = useAdminStore();
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Schedule>({
    resolver: zodResolver(ScheduleSchema) as any,
    defaultValues: scheduleToEdit || {
      status: 'Scheduled',
      hall: 'Virtual',
    }
  });

  React.useEffect(() => {
    if (open) {
      if (scheduleToEdit) {
        reset(scheduleToEdit);
      } else {
        reset({
          status: 'Scheduled',
          hall: 'Virtual',
        });
      }
    }
  }, [open, scheduleToEdit, reset]);

  const onSubmit = async (data: Schedule) => {
    if (scheduleToEdit?.id) {
      await updateSchedule(scheduleToEdit.id, data);
    } else {
      await addSchedule(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{scheduleToEdit ? 'Edit Schedule' : 'Schedule Exam'}</DialogTitle>
          <DialogDescription>
            {scheduleToEdit ? 'Update the exam schedule details.' : 'Assign a batch to an exam and set the timing.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          
          <div className="space-y-2">
            <Label>Select Exam *</Label>
            <Select 
              defaultValue={scheduleToEdit?.examId || ''} 
              onValueChange={(val) => setValue('examId', val || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an exam" />
              </SelectTrigger>
              <SelectContent>
                {exams.map(exam => (
                  <SelectItem key={exam.id} value={exam.id || ''}>{exam.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.examId && <p className="text-red-500 text-xs">{errors.examId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch">Batch *</Label>
              <Input id="batch" {...register('batch')} placeholder="e.g., 2024-2028" />
              {errors.batch && <p className="text-red-500 text-xs">{errors.batch.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input id="department" {...register('department')} placeholder="e.g., CSE" />
              {errors.department && <p className="text-red-500 text-xs">{errors.department.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input id="date" type="date" {...register('date')} />
            {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input id="startTime" type="time" {...register('startTime')} />
              {errors.startTime && <p className="text-red-500 text-xs">{errors.startTime.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input id="endTime" type="time" {...register('endTime')} />
              {errors.endTime && <p className="text-red-500 text-xs">{errors.endTime.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hall">Hall / Venue</Label>
            <Input id="hall" {...register('hall')} placeholder="e.g., Virtual Hall A" />
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading ? 'Saving...' : 'Save Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

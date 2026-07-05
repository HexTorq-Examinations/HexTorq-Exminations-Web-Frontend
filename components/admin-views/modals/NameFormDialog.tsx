import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface NameFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  label: string;
  initialValue?: string;
  isLoading?: boolean;
  onSubmit: (name: string) => Promise<void>;
}

export function NameFormDialog({ open, onOpenChange, title, description, label, initialValue, isLoading, onSubmit }: NameFormDialogProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(initialValue || '');
      setError('');
    }
  }, [open, initialValue]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError(`${label} is required`);
      return;
    }
    await onSubmit(name.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          <Label htmlFor="name-form-input">{label} *</Label>
          <Input
            id="name-form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={`e.g., ${label}`}
            autoFocus
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { tokens } from '@/lib/tokens';

interface FormActionsProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  isLoading?: boolean;
  isDirty?: boolean;
  className?: string;
  align?: 'left' | 'center' | 'right';
  submitVariant?: 'default' | 'secondary' | 'destructive';
  submitDisabled?: boolean;
}

const alignClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  cancelLabel = 'Cancel',
  submitLabel = 'Save',
  isLoading,
  isDirty = true,
  className,
  align = 'right',
  submitVariant = 'default',
  submitDisabled,
}) => {
  return (
    <div className={cn('flex items-center gap-3 pt-4', alignClasses[align], className)}>
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className={tokens.text.label}
        >
          {cancelLabel}
        </Button>
      )}

      {onSubmit && (
        <Button
          type="submit"
          variant={submitVariant}
          onClick={onSubmit}
          disabled={isLoading || (!isDirty && !submitDisabled)}
          className={cn('gap-2', tokens.text.label)}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      )}
    </div>
  );
};

export default FormActions;

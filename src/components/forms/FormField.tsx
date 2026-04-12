import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, LucideIcon } from 'lucide-react';
import { tokens } from '@/lib/tokens';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helper?: string;
  children: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required,
  error,
  helper,
  children,
  className,
  icon: Icon,
}) => {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className={cn(
          'flex items-center gap-1.5 font-semibold text-sm',
          error ? 'text-red-400' : 'text-foreground'
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>

      {children}

      {error && (
        <div className="flex items-center gap-1 text-red-400 text-xs">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}

      {helper && !error && (
        <p className={cn(tokens.text.caption, 'mt-1')}>{helper}</p>
      )}
    </div>
  );
};

export default FormField;

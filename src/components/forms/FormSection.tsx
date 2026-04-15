import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { tokens } from '@/lib/tokens';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  collapsible = false,
  defaultOpen = true,
  className,
  icon: Icon,
  actions,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'flex items-center justify-between',
          collapsible && 'cursor-pointer'
        )}
        role={collapsible ? "button" : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={(e) => {
          if (collapsible && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn('p-2 rounded-lg bg-primary/10', tokens.border.default)}>
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
          <div>
            <h3 className={cn('font-bold text-base', tokens.text.heading)}>
              {title}
            </h3>
            {description && (
              <p className={cn('mt-0.5', tokens.text.caption)}>{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {collapsible && (
            <ChevronDown
              className={cn(
                'h-5 w-5 text-muted-foreground transition-transform duration-200',
                !isOpen && '-rotate-90'
              )}
            />
          )}
        </div>
      </div>

      {(!collapsible || isOpen) && (
        <div className={cn('pt-2', tokens.spacing.md)}>{children}</div>
      )}
    </div>
  );
};

export default FormSection;

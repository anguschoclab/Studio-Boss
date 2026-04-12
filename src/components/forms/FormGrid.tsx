import React from 'react';
import { cn } from '@/lib/utils';

interface FormGridProps {
  columns?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
};

export const FormGrid: React.FC<FormGridProps> = ({
  columns = 1,
  gap = 'md',
  children,
  className,
}) => {
  return (
    <div className={cn('grid', columnClasses[columns], gapClasses[gap], className)}>
      {children}
    </div>
  );
};

export default FormGrid;

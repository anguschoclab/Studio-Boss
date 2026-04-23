import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  message,
  className
}) => {
  return (
    <div className={cn(
      "col-span-full py-24 text-center glass-card border-white/5 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700",
      className
    )}>
      <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground/10">
        <Icon className="h-10 w-10" />
      </div>
      <div className="max-w-md px-6">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-2">
          {title}
        </h3>
        <p className="text-[10px] uppercase font-bold text-muted-foreground/20 italic tracking-widest leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
};

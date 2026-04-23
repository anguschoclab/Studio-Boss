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
      "col-span-full py-24 text-center glass-card border-white/5 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-1000",
      className
    )}>
      <div className="w-20 h-20 rounded-none bg-white/[0.01] border border-white/5 flex items-center justify-center text-muted-foreground/10 group-hover:bg-white/5 transition-all duration-700">
        <Icon className="h-10 w-10" />
      </div>
      <div className="max-w-md px-12">
        <h3 className="text-xl font-display font-black uppercase tracking-tighter text-muted-foreground/40 mb-4 italic">
          {title}
        </h3>
        <p className="text-[10px] uppercase font-black text-muted-foreground/10 italic tracking-[0.3em] leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
};

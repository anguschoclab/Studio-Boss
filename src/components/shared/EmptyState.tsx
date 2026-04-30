import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  className?: string;
  variant?: 'default' | 'card';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  message,
  className,
  variant = 'default',
  action
}) => {
  return (
    <div className={cn(
      "col-span-full py-32 text-center glass-card border-white/5 flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-1000 rounded-none",
      variant === 'card' && "bg-white/[0.01]",
      className
    )}>
      <div className="w-24 h-24 rounded-none bg-white/[0.02] border border-white/5 flex items-center justify-center text-muted-foreground/10 transition-all duration-1000 group-hover:scale-110 group-hover:bg-white/5">
        <Icon className="h-10 w-10" strokeWidth={1} />
      </div>
      <div className="max-w-xl px-12 space-y-6">
        <h3 className="text-2xl font-display font-black uppercase tracking-tighter text-muted-foreground/30 italic drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          {title.toUpperCase()}
        </h3>
        <p className="text-[10px] uppercase font-black text-muted-foreground/10 italic tracking-[0.4em] leading-loose">
          {message.toUpperCase()}
        </p>
      </div>
      
      {action && (
        <button
          onClick={action.onClick}
          className="px-8 py-3 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] italic hover:bg-primary/20 hover:border-primary/40 hover:text-primary transition-all duration-700 rounded-none"
        >
          {action.label.toUpperCase()}
        </button>
      )}
    </div>
  );
};

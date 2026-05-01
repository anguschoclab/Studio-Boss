import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Panel Header - Design Bible Section 8
 * 
 * Standardized panel header with gradient text title, icon, sub-label, and optional action.
 * Used across all dashboard screens for consistent layout.
 */
export const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  action,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-between mb-12', className)}>
      <div className="flex items-center gap-6">
        {Icon && (
          <div className="w-14 h-14 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 transition-all duration-700 hover:bg-primary/20">
            <Icon className="w-7 h-7" strokeWidth={2.5} />
          </div>
        )}
        <div>
          <h2 className="text-6xl font-display font-black tracking-tighter uppercase italic bg-gradient-to-br from-foreground via-foreground to-foreground/30 bg-clip-text text-transparent leading-none mb-3">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 italic leading-none">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex items-center gap-4">{action}</div>}
    </div>
  );
};

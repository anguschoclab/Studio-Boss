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
    <div className={cn('flex items-center justify-between mb-6', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
        )}
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

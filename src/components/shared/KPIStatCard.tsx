import React from 'react';
import { cn } from '@/lib/utils';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';

interface KPIStatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number | string;
    isPositive: boolean;
  };
  variant?: 'primary' | 'secondary' | 'success' | 'destructive' | 'muted';
  tooltip?: string;
  className?: string;
}

export const KPIStatCard: React.FC<KPIStatCardProps> = ({
  label,
  value,
  subLabel,
  icon,
  trend,
  variant = 'muted',
  tooltip,
  className
}) => {
  const variantStyles = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-success',
    destructive: 'text-destructive',
    muted: 'text-foreground'
  };

  const glowStyles = {
    primary: 'bg-primary/5',
    secondary: 'bg-secondary/5',
    success: 'bg-success/5',
    destructive: 'bg-destructive/5',
    muted: 'bg-white/5'
  };

  return (
    <TooltipWrapper tooltip={tooltip}>
      <div className={cn(
        "glass-card p-5 group hover-glow transition-all duration-300 relative overflow-hidden",
        className
      )}>
        {/* Glow effect */}
        <div className={cn(
          "absolute -top-12 -right-12 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full",
          glowStyles[variant]
        )} />

        <div className="flex flex-col h-full justify-between relative z-10">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">
              {label}
            </span>
            {icon && <div className="text-muted-foreground/40">{icon}</div>}
          </div>

          <div>
            <div className={cn(
              "text-3xl font-display font-black tracking-tighter uppercase leading-none mb-1",
              variantStyles[variant]
            )}>
              {value}
            </div>
            
            {(subLabel || trend) && (
              <div className="flex items-center gap-2">
                {trend && (
                  <span className={cn(
                    "text-[10px] font-black tracking-widest uppercase",
                    trend.isPositive ? 'text-success' : 'text-destructive'
                  )}>
                    {trend.isPositive ? '▲' : '▼'} {trend.value}
                  </span>
                )}
                {subLabel && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    {subLabel}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipWrapper>
  );
};

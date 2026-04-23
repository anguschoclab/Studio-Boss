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
    success: 'text-emerald-400',
    destructive: 'text-red-400',
    muted: 'text-foreground'
  };

  const glowStyles = {
    primary: 'bg-primary/5',
    secondary: 'bg-secondary/5',
    success: 'bg-emerald-400/5',
    destructive: 'bg-red-400/5',
    muted: 'bg-white/5'
  };

  return (
    <TooltipWrapper tooltip={tooltip}>
      <div className={cn(
        "glass-card p-8 group transition-all duration-700 relative overflow-hidden rounded-2xl hover:bg-white/[0.03] hover:border-primary/20",
        className
      )}>
        {/* Glow effect */}
        <div className={cn(
          "absolute -top-12 -right-12 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-1000 rounded-full",
          glowStyles[variant]
        )} />

        <div className="flex flex-col h-full justify-between relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 leading-none italic group-hover:text-muted-foreground/40 transition-colors">
              {label}
            </span>
            {icon && <div className="text-muted-foreground/10 group-hover:text-primary/20 transition-colors">{icon}</div>}
          </div>

          <div>
            <div className={cn(
              "text-4xl font-display font-black tracking-tighter uppercase leading-none mb-3 italic transition-colors duration-700",
              variantStyles[variant]
            )}>
              {value}
            </div>
            
            {(subLabel || trend) && (
              <div className="flex items-center gap-4">
                {trend && (
                  <span className={cn(
                    "text-[10px] font-black tracking-[0.2em] uppercase italic",
                    trend.isPositive ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {trend.isPositive ? '▲' : '▼'} {trend.value}
                  </span>
                )}
                {subLabel && (
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 italic">
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

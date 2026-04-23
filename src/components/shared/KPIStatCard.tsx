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
    primary: 'text-primary drop-shadow-[0_0_20px_rgba(var(--primary),0.3)]',
    secondary: 'text-secondary drop-shadow-[0_0_20px_rgba(var(--secondary),0.3)]',
    success: 'text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    destructive: 'text-red-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.3)]',
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
        "glass-card p-10 group transition-all duration-1000 relative overflow-hidden rounded-2xl hover:bg-white/[0.04] hover:border-primary/40 shadow-2xl",
        className
      )}>
        {/* Glow effect */}
        <div className={cn(
          "absolute -top-16 -right-16 w-48 h-48 blur-[80px] opacity-0 group-hover:opacity-60 transition-opacity duration-1000 rounded-full",
          glowStyles[variant]
        )} />

        <div className="flex flex-col h-full justify-between relative z-10 space-y-10">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 leading-none italic group-hover:text-muted-foreground/50 transition-colors duration-700">
              {label.toUpperCase()}
            </span>
            {icon && <div className="text-muted-foreground/10 group-hover:text-primary transition-all duration-700">{icon}</div>}
          </div>

          <div className="space-y-4">
            <div className={cn(
              "text-6xl font-display font-black tracking-tighter uppercase leading-none italic transition-all duration-1000 group-hover:scale-105 origin-left",
              variantStyles[variant]
            )}>
              {value}
            </div>
            
            {(subLabel || trend) && (
              <div className="flex items-center gap-6">
                {trend && (
                  <div className={cn(
                    "px-2 py-1 border border-white/5 bg-white/[0.02] text-[9px] font-black tracking-[0.2em] uppercase italic flex items-center gap-1.5",
                    trend.isPositive ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {trend.isPositive ? '▲' : '▼'} {trend.value}
                  </div>
                )}
                {subLabel && (
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/10 italic">
                    {subLabel.toUpperCase()}
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

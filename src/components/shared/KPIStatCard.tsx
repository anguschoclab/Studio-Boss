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
    primary: 'text-primary drop-shadow-[0_0_30px_rgba(var(--primary),0.4)]',
    secondary: 'text-secondary drop-shadow-[0_0_30px_rgba(var(--secondary),0.4)]',
    success: 'text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]',
    destructive: 'text-rose-500 drop-shadow-[0_0_30px_rgba(244,63,94,0.4)]',
    muted: 'text-foreground'
  };

  const glowStyles = {
    primary: 'bg-primary/10',
    secondary: 'bg-secondary/10',
    success: 'bg-emerald-500/10',
    destructive: 'bg-rose-500/10',
    muted: 'bg-white/5'
  };

  return (
    <TooltipWrapper tooltip={tooltip}>
      <div className={cn(
        "glass-card p-12 group transition-all duration-1000 relative overflow-hidden rounded-none border-white/5 bg-white/[0.01] backdrop-blur-3xl hover:bg-white/[0.04] hover:border-primary/40 shadow-[0_0_100px_rgba(0,0,0,0.8)]",
        className
      )}>
        {/* Architectural Glow Array */}
        <div className={cn(
          "absolute -top-32 -right-32 w-64 h-64 blur-[100px] opacity-0 group-hover:opacity-80 transition-opacity duration-1000 rotate-45",
          glowStyles[variant]
        )} />
        
        <div className="absolute top-0 right-0 w-16 h-1 w-full bg-gradient-to-l from-white/10 to-transparent group-hover:from-primary/40 transition-all duration-1000" />
        <div className="absolute bottom-0 left-0 w-16 h-1 w-full bg-gradient-to-r from-white/10 to-transparent group-hover:from-primary/40 transition-all duration-1000" />

        <div className="flex flex-col h-full justify-between relative z-10 space-y-12">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-muted-foreground/30 leading-none italic group-hover:text-primary transition-colors duration-700">
              {label.toUpperCase()}
            </span>
            {icon && (
              <div className="text-muted-foreground/10 group-hover:text-primary transition-all duration-700 group-hover:scale-110">
                {icon}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className={cn(
              "text-7xl font-display font-black tracking-tighter uppercase leading-none italic transition-all duration-1000 group-hover:translate-x-2 group-hover:scale-[1.02] origin-left",
              variantStyles[variant]
            )}>
              {value}
            </div>
            
            {(subLabel || trend) && (
              <div className="flex items-center gap-8">
                {trend && (
                  <div className={cn(
                    "px-4 py-1.5 border border-white/5 bg-white/[0.02] text-[10px] font-black tracking-[0.2em] uppercase italic flex items-center gap-3 shadow-2xl",
                    trend.isPositive ? 'text-emerald-500 border-emerald-500/20' : 'text-rose-500 border-rose-500/20'
                  )}>
                    <span className="text-lg leading-none">{trend.isPositive ? '▲' : '▼'}</span>
                    <span>{trend.value}</span>
                  </div>
                )}
                {subLabel && (
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 italic group-hover:text-muted-foreground/40 transition-colors">
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

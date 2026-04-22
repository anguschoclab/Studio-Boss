import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPIStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'primary' | 'secondary' | 'success' | 'destructive' | 'warning';
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value?: string;
  };
  className?: string;
}

const colorVariants = {
  primary: {
    glow: 'from-primary/20 via-transparent to-transparent',
    text: 'text-primary',
    iconBg: 'bg-primary/10 text-primary',
  },
  secondary: {
    glow: 'from-secondary/20 via-transparent to-transparent',
    text: 'text-secondary',
    iconBg: 'bg-secondary/10 text-secondary',
  },
  success: {
    glow: 'from-success/20 via-transparent to-transparent',
    text: 'text-success',
    iconBg: 'bg-success/10 text-success',
  },
  destructive: {
    glow: 'from-destructive/20 via-transparent to-transparent',
    text: 'text-destructive',
    iconBg: 'bg-destructive/10 text-destructive',
  },
  warning: {
    glow: 'from-amber-500/20 via-transparent to-transparent',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/10 text-amber-400',
  },
};

/**
 * KPI Stat Card - Design Bible Section 8.1
 * 
 * Standard KPI card with ambient glow blob, icon top-right, and proper typography.
 * Used across all dashboard screens for key performance indicators.
 */
export const KPIStatCard: React.FC<KPIStatCardProps> = ({
  label,
  value,
  icon: Icon,
  color = 'primary',
  trend,
  className,
}) => {
  const variant = colorVariants[color];

  return (
    <Card
      className={cn(
        'relative overflow-hidden border border-white/5 bg-card/60 backdrop-blur-xl shadow-2xl rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group',
        className
      )}
    >
      {/* Ambient Glow Blob */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none',
          variant.glow
        )}
      />
      
      <CardContent className="relative z-10 p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Label */}
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground mb-2">
              {label}
            </p>
            
            {/* Value */}
            <p className="text-3xl font-display font-black tracking-tighter text-foreground">
              {value}
            </p>
            
            {/* Trend indicator */}
            {trend && (
              <div className={cn(
                'flex items-center gap-1 mt-1 text-[10px] font-bold',
                trend.direction === 'up' ? 'text-success' : 
                trend.direction === 'down' ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {trend.value && <span>{trend.value}</span>}
              </div>
            )}
          </div>
          
          {/* Icon */}
          <div className={cn(
            'rounded-xl flex items-center justify-center shrink-0 w-10 h-10',
            variant.iconBg
          )}>
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

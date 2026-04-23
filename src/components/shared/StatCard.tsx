import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'secondary' | 'success' | 'destructive' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
  glow?: boolean;
}

const colorVariants = {
  primary: 'from-primary/10 via-primary/5 to-transparent text-primary border-primary/20',
  secondary: 'from-secondary/10 via-secondary/5 to-transparent text-secondary border-secondary/20',
  success: 'from-success/10 via-success/5 to-transparent text-success border-success/20',
  destructive: 'from-destructive/10 via-destructive/5 to-transparent text-destructive border-destructive/20',
  warning: 'from-warning/10 via-warning/5 to-transparent text-warning border-warning/20',
  info: 'from-info/10 via-info/5 to-transparent text-info border-info/20',
};

const iconBgVariants = {
  primary: 'bg-primary/5 text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]',
  secondary: 'bg-secondary/5 text-secondary border border-secondary/20 shadow-[0_0_15px_rgba(var(--secondary),0.2)]',
  success: 'bg-success/5 text-success border border-success/20 shadow-[0_0_15px_rgba(var(--success),0.2)]',
  destructive: 'bg-destructive/5 text-destructive border border-destructive/20 shadow-[0_0_15px_rgba(var(--destructive),0.2)]',
  warning: 'bg-warning/5 text-warning border border-warning/20 shadow-[0_0_15px_rgba(var(--warning),0.2)]',
  info: 'bg-info/5 text-info border border-info/20 shadow-[0_0_15px_rgba(var(--info),0.2)]',
};

const sizeVariants = {
  sm: {
    card: 'p-6',
    icon: 'w-10 h-10',
    iconSize: 18,
    title: 'text-[9px]',
    value: 'text-2xl',
    subtitle: 'text-[8px]',
  },
  md: {
    card: 'p-8',
    icon: 'w-12 h-12',
    iconSize: 22,
    title: 'text-[10px]',
    value: 'text-4xl',
    subtitle: 'text-[9px]',
  },
  lg: {
    card: 'p-10',
    icon: 'w-16 h-16',
    iconSize: 28,
    title: 'text-[11px]',
    value: 'text-5xl',
    subtitle: 'text-[10px]',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  size = 'md',
  className,
  children,
  glow = true,
}) => {
  const sizes = sizeVariants[size];
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-muted-foreground/40';

  return (
    <Card className={cn(
      'relative overflow-hidden border-white/5 bg-white/[0.01] backdrop-blur-xl transition-all duration-700 hover:bg-white/[0.03] group rounded-2xl',
      glow && 'shadow-2xl',
      className
    )}>
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-1000',
        colorVariants[color].split(' ')[0]
      )} />
      
      <CardContent className={cn('relative z-10 p-0', sizes.card)}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 space-y-4">
            <p className={cn(
              'font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic leading-none',
              sizes.title
            )}>
              {title}
            </p>
            <div className="flex items-baseline gap-4">
              <span className={cn(
                'font-display font-black tracking-tighter italic leading-none text-foreground',
                sizes.value
              )}>
                {value}
              </span>
              {trend && (
                <div className={cn('flex items-center gap-1.5 px-2 py-1 bg-white/[0.02] border border-white/5', trendColor)}>
                  <TrendIcon className="w-3 h-3" />
                  {trendValue && <span className="text-[10px] font-display font-black italic">{trendValue}</span>}
                </div>
              )}
            </div>
            {subtitle && (
              <p className={cn(
                'text-muted-foreground/20 font-black uppercase tracking-[0.2em] leading-none',
                sizes.subtitle
              )}>
                {subtitle}
              </p>
            )}
          </div>
          
          <div className={cn(
            'rounded-none flex items-center justify-center shrink-0 transition-all duration-700 group-hover:scale-110 group-hover:bg-white/5',
            sizes.icon,
            iconBgVariants[color]
          )}>
            <Icon size={sizes.iconSize} strokeWidth={1.5} />
          </div>
        </div>
        
        {children && (
          <div className="mt-8 pt-8 border-t border-white/5">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

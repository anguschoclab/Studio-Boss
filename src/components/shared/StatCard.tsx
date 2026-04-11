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
  primary: 'from-primary/20 via-primary/5 to-transparent text-primary border-primary/20',
  secondary: 'from-secondary/20 via-secondary/5 to-transparent text-secondary border-secondary/20',
  success: 'from-emerald-500/20 via-emerald-500/5 to-transparent text-emerald-400 border-emerald-500/20',
  destructive: 'from-red-500/20 via-red-500/5 to-transparent text-red-400 border-red-500/20',
  warning: 'from-amber-500/20 via-amber-500/5 to-transparent text-amber-400 border-amber-500/20',
  info: 'from-blue-500/20 via-blue-500/5 to-transparent text-blue-400 border-blue-500/20',
};

const iconBgVariants = {
  primary: 'bg-primary/10 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]',
  secondary: 'bg-secondary/10 text-secondary shadow-[0_0_20px_hsl(var(--secondary)/0.3)]',
  success: 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]',
  destructive: 'bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]',
  warning: 'bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
  info: 'bg-blue-500/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
};

const sizeVariants = {
  sm: {
    card: 'p-4',
    icon: 'w-8 h-8',
    iconSize: 16,
    title: 'text-[10px]',
    value: 'text-xl',
    subtitle: 'text-[9px]',
  },
  md: {
    card: 'p-5',
    icon: 'w-10 h-10',
    iconSize: 20,
    title: 'text-[11px]',
    value: 'text-2xl',
    subtitle: 'text-[10px]',
  },
  lg: {
    card: 'p-6',
    icon: 'w-12 h-12',
    iconSize: 24,
    title: 'text-xs',
    value: 'text-4xl',
    subtitle: 'text-[11px]',
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
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-muted-foreground';

  return (
    <Card className={cn(
      'relative overflow-hidden border bg-gradient-to-br backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group',
      colorVariants[color],
      glow && 'shadow-lg',
      className
    )}>
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500',
        colorVariants[color].split(' ')[0]
      )} />
      
      <CardContent className={cn('relative z-10 p-0', sizes.card)}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className={cn(
              'font-black uppercase tracking-wider text-muted-foreground/80 mb-1',
              sizes.title
            )}>
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                'font-display font-black tracking-tight',
                sizes.value
              )}>
                {value}
              </span>
              {trend && (
                <div className={cn('flex items-center gap-0.5', trendColor)}>
                  <TrendIcon className="w-3 h-3" />
                  {trendValue && <span className="text-[10px] font-bold">{trendValue}</span>}
                </div>
              )}
            </div>
            {subtitle && (
              <p className={cn(
                'text-muted-foreground/60 font-medium mt-1',
                sizes.subtitle
              )}>
                {subtitle}
              </p>
            )}
          </div>
          
          <div className={cn(
            'rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110',
            sizes.icon,
            iconBgVariants[color]
          )}>
            <Icon size={sizes.iconSize} strokeWidth={2} />
          </div>
        </div>
        
        {children && (
          <div className="mt-4 pt-4 border-t border-white/10">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

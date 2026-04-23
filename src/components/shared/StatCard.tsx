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
  success: 'from-emerald-400/20 via-emerald-400/5 to-transparent text-emerald-400 border-emerald-400/20',
  destructive: 'from-red-400/20 via-red-400/5 to-transparent text-red-400 border-red-400/20',
  warning: 'from-amber-400/20 via-amber-400/5 to-transparent text-amber-400 border-amber-400/20',
  info: 'from-blue-400/20 via-blue-400/5 to-transparent text-blue-400 border-blue-400/20',
};

const iconBgVariants = {
  primary: 'bg-primary/5 text-primary border border-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.1)]',
  secondary: 'bg-secondary/5 text-secondary border border-secondary/10 shadow-[0_0_20px_rgba(var(--secondary),0.1)]',
  success: 'bg-emerald-400/5 text-emerald-400 border border-emerald-400/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]',
  destructive: 'bg-red-400/5 text-red-400 border border-red-400/10 shadow-[0_0_20px_rgba(244,63,94,0.1)]',
  warning: 'bg-amber-400/5 text-amber-400 border border-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.1)]',
  info: 'bg-blue-400/5 text-blue-400 border border-blue-400/10 shadow-[0_0_20px_rgba(96,165,250,0.1)]',
};

const sizeVariants = {
  sm: {
    card: 'p-6',
    icon: 'w-12 h-12',
    iconSize: 20,
    title: 'text-[9px]',
    value: 'text-3xl',
    subtitle: 'text-[8px]',
  },
  md: {
    card: 'p-8',
    icon: 'w-14 h-14',
    iconSize: 24,
    title: 'text-[10px]',
    value: 'text-5xl',
    subtitle: 'text-[9px]',
  },
  lg: {
    card: 'p-12',
    icon: 'w-20 h-20',
    iconSize: 32,
    title: 'text-[11px]',
    value: 'text-7xl',
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
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-muted-foreground/20';

  return (
    <Card className={cn(
      'relative overflow-hidden border-white/5 bg-white/[0.01] backdrop-blur-3xl transition-all duration-1000 hover:bg-white/[0.03] group rounded-2xl',
      glow && 'shadow-[0_20px_50px_rgba(0,0,0,0.5)]',
      className
    )}>
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-1000',
        colorVariants[color].split(' ')[0]
      )} />
      
      <CardContent className={cn('relative z-10 p-0', sizes.card)}>
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0 space-y-6">
            <p className={cn(
              'font-black uppercase tracking-[0.4em] text-muted-foreground/20 italic leading-none',
              sizes.title
            )}>
              {title}
            </p>
            <div className="flex flex-col gap-4">
              <span className={cn(
                'font-display font-black tracking-tighter italic leading-none text-foreground drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]',
                sizes.value
              )}>
                {value}
              </span>
              {trend && (
                <div className={cn('flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-none w-fit', trendColor)}>
                  <TrendIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                  {trendValue && <span className="text-[10px] font-black uppercase tracking-[0.1em] italic">{trendValue}</span>}
                </div>
              )}
            </div>
            {subtitle && (
              <p className={cn(
                'text-muted-foreground/10 font-black uppercase tracking-[0.3em] leading-none italic',
                sizes.subtitle
              )}>
                {subtitle}
              </p>
            )}
          </div>
          
          <div className={cn(
            'rounded-none flex items-center justify-center shrink-0 transition-all duration-1000 group-hover:scale-110 group-hover:bg-white/5 border border-white/5',
            sizes.icon,
            iconBgVariants[color]
          )}>
            <Icon size={sizes.iconSize} strokeWidth={2} />
          </div>
        </div>
        
        {children && (
          <div className="mt-12 pt-12 border-t border-white/5">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

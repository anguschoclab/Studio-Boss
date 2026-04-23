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
  success: 'from-emerald-500/20 via-emerald-500/5 to-transparent text-emerald-500 border-emerald-500/20',
  destructive: 'from-rose-500/20 via-rose-500/5 to-transparent text-rose-500 border-rose-500/20',
  warning: 'from-amber-400/20 via-amber-400/5 to-transparent text-amber-400 border-amber-400/20',
  info: 'from-blue-400/20 via-blue-400/5 to-transparent text-blue-400 border-blue-400/20',
};

const iconBgVariants = {
  primary: 'bg-primary/5 text-primary border border-primary/10 shadow-[0_0_40px_rgba(var(--primary),0.2)]',
  secondary: 'bg-secondary/5 text-secondary border border-secondary/10 shadow-[0_0_40px_rgba(var(--secondary),0.2)]',
  success: 'bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.2)]',
  destructive: 'bg-rose-500/5 text-rose-500 border border-rose-500/10 shadow-[0_0_40px_rgba(244,63,94,0.2)]',
  warning: 'bg-amber-400/5 text-amber-400 border border-amber-400/10 shadow-[0_0_40px_rgba(251,191,36,0.2)]',
  info: 'bg-blue-400/5 text-blue-400 border border-blue-400/10 shadow-[0_0_40px_rgba(96,165,250,0.2)]',
};

const sizeVariants = {
  sm: {
    card: 'p-8',
    icon: 'w-14 h-14',
    iconSize: 24,
    title: 'text-[10px]',
    value: 'text-4xl',
    subtitle: 'text-[9px]',
  },
  md: {
    card: 'p-10',
    icon: 'w-16 h-16',
    iconSize: 28,
    title: 'text-[11px]',
    value: 'text-6xl',
    subtitle: 'text-[10px]',
  },
  lg: {
    card: 'p-14',
    icon: 'w-24 h-24',
    iconSize: 40,
    title: 'text-[12px]',
    value: 'text-8xl',
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
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-muted-foreground/30';

  return (
    <Card className={cn(
      'relative overflow-hidden border-white/5 bg-white/[0.01] backdrop-blur-3xl transition-all duration-1000 hover:bg-white/[0.03] group rounded-none',
      glow && 'shadow-[0_40px_100px_rgba(0,0,0,0.8)]',
      className
    )}>
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-1000',
        colorVariants[color].split(' ')[0]
      )} />
      
      <CardContent className={cn('relative z-10 p-0', sizes.card)}>
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1 min-w-0 space-y-8">
            <p className={cn(
              'font-black uppercase tracking-[0.5em] text-muted-foreground/30 italic leading-none group-hover:text-primary transition-colors duration-700',
              sizes.title
            )}>
              {title.toUpperCase()}
            </p>
            <div className="flex flex-col gap-6">
              <span className={cn(
                'font-display font-black tracking-tighter italic leading-none text-foreground drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:translate-x-2 transition-transform duration-1000',
                sizes.value
              )}>
                {value}
              </span>
              {trend && (
                <div className={cn('flex items-center gap-3 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-none w-fit shadow-2xl', trendColor)}>
                  <TrendIcon className="w-4 h-4" strokeWidth={3} />
                  {trendValue && <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">{trendValue}</span>}
                </div>
              )}
            </div>
            {subtitle && (
              <p className={cn(
                'text-muted-foreground/10 font-black uppercase tracking-[0.4em] leading-none italic group-hover:text-muted-foreground/40 transition-colors duration-700',
                sizes.subtitle
              )}>
                {subtitle.toUpperCase()}
              </p>
            )}
          </div>
          
          <div className={cn(
            'rounded-none flex items-center justify-center shrink-0 transition-all duration-1000 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-white/5 border border-white/5 shadow-2xl',
            sizes.icon,
            iconBgVariants[color]
          )}>
            <Icon size={sizes.iconSize} strokeWidth={3} />
          </div>
        </div>
        
        {children && (
          <div className="mt-14 pt-14 border-t border-white/5">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

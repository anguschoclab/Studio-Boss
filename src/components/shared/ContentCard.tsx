import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardHover } from '@/lib/animations';

type CardVariant = 'default' | 'interactive' | 'active' | 'glass' | 'subtle';
type CardSize = 'sm' | 'md' | 'lg';

interface ContentCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: CardVariant;
  /** Size variant */
  size?: CardSize;
  /** Optional card title */
  title?: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional icon to display */
  icon?: LucideIcon;
  /** Icon color variant */
  iconColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';
  /** Badge text to display */
  badge?: string;
  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  /** Click handler for interactive cards */
  onClick?: () => void;
  /** Custom className */
  className?: string;
  /** Header content (replaces title/subtitle if provided) */
  header?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white/[0.01] border-white/5 shadow-2xl',
  interactive: 'bg-white/[0.01] border-white/5 hover:border-primary/40 hover:bg-white/[0.04] cursor-pointer shadow-2xl hover:shadow-[0_0_80px_rgba(0,0,0,0.8)]',
  active: 'bg-primary/5 border-primary/40 shadow-[0_0_60px_rgba(var(--primary),0.2)]',
  glass: 'bg-black/90 backdrop-blur-3xl border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]',
  subtle: 'bg-white/[0.01] border-transparent',
};

const sizeStyles: Record<CardSize, { container: string; content: string }> = {
  sm: {
    container: 'p-8',
    content: '',
  },
  md: {
    container: 'p-12',
    content: '',
  },
  lg: {
    container: 'p-20',
    content: '',
  },
};

const iconColorStyles = {
  primary: 'bg-primary/5 text-primary border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.2)]',
  secondary: 'bg-secondary/5 text-secondary border-secondary/20 shadow-[0_0_30px_rgba(var(--secondary),0.2)]',
  success: 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]',
  warning: 'bg-amber-500/5 text-amber-500 border-amber-500/20 shadow-[0_0_30px_rgba(251,191,36,0.2)]',
  destructive: 'bg-rose-500/5 text-rose-500 border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.2)]',
};

/**
 * ContentCard - Standardized card component with variants
 * 
 * Provides consistent card styling with support for:
 * - Multiple visual variants (default, interactive, active, glass, subtle)
 * - Optional header with icon, title, subtitle, badge
 * - Hover animations for interactive cards
 * - Consistent sizing
 */
export const ContentCard: React.FC<ContentCardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  title,
  subtitle,
  icon: Icon,
  iconColor = 'primary',
  badge,
  badgeVariant = 'secondary', // eslint-disable-line @typescript-eslint/no-unused-vars
  onClick,
  className,
  header,
  footer,
  disabled = false,
}) => {
  const isInteractive = variant === 'interactive' && onClick && !disabled;
  const CardWrapper = isInteractive ? motion.button : 'div';

  return (
    <CardWrapper
      onClick={isInteractive ? onClick : undefined}
      {...(isInteractive && { type: "button" })}
      className={cn(
        'rounded-none border overflow-hidden transition-all duration-1000',
        isInteractive && 'w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        variantStyles[variant],
        sizeStyles[size].container,
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      {...(isInteractive && {
        initial: 'rest',
        whileHover: 'hover',
        variants: cardHover,
      })}
    >
      {/* Header */}
      {(header || title || Icon || badge) && (
        <div className="flex items-start justify-between gap-10 mb-12">
          {header ? (
            <div className="flex-1">{header}</div>
          ) : (
            <div className="flex items-center gap-10 flex-1 min-w-0">
              {Icon && (
                <div
                  className={cn(
                    'w-16 h-16 rounded-none border flex items-center justify-center shrink-0 transition-all duration-1000 group-hover:scale-110 group-hover:rotate-6',
                    iconColorStyles[iconColor]
                  )}
                >
                  <Icon className="w-8 h-8" strokeWidth={2} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <h4 className="font-display font-black text-3xl text-foreground truncate uppercase italic tracking-tighter leading-none mb-3 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    {title.toUpperCase()}
                  </h4>
                )}
                {subtitle && (
                  <p className="text-[11px] font-black uppercase text-muted-foreground/30 italic tracking-[0.4em] truncate">
                    {subtitle.toUpperCase()}
                  </p>
                )}
              </div>
            </div>
          )}
          {badge && (
            <div className="px-6 py-2 bg-white/5 border border-white/10 text-[9px] font-black tracking-[0.3em] uppercase italic rounded-none shrink-0 h-fit transition-all duration-1000 hover:bg-primary/20 hover:border-primary/40 hover:text-primary shadow-2xl">
              {badge.toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn(sizeStyles[size].content, 'relative')}>{children}</div>

      {/* Footer */}
      {footer && (
        <div className="mt-12 pt-12 border-t border-white/5">{footer}</div>
      )}
    </CardWrapper>
  );
};

/**
 * Compact card for lists and dense layouts
 */
export const CompactCard: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  selected?: boolean;
}> = ({ children, onClick, className, selected }) => (
  <ContentCard
    variant={selected ? 'active' : onClick ? 'interactive' : 'default'}
    size="sm"
    onClick={onClick}
    className={className}
  >
    {children}
  </ContentCard>
);

/**
 * Info card with prominent icon for feature highlights
 */
export const InfoCard: React.FC<{
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';
  className?: string;
}> = ({ icon, title, description, iconColor = 'primary', className }) => (
  <ContentCard
    variant="glass"
    size="md"
    icon={icon}
    iconColor={iconColor}
    title={title}
    className={className}
  >
    <p className="text-[11px] font-black uppercase text-muted-foreground/30 italic tracking-[0.3em] leading-loose">
      {description.toUpperCase()}
    </p>
  </ContentCard>
);

/**
 * Stat row card for displaying label-value pairs
 */
export const StatRow: React.FC<{
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}> = ({ label, value, trend, trendValue, className }) => {
  const trendColors = {
    up: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20',
    down: 'text-rose-500 bg-rose-500/5 border-rose-500/20',
    neutral: 'text-muted-foreground/20 bg-white/5 border-white/10',
  };

  return (
    <div className={cn('flex items-center justify-between py-6 group border-b border-white/[0.05] last:border-0 hover:bg-white/[0.01] px-4 -mx-4 transition-all duration-700', className)}>
      <span className="text-[11px] font-black text-muted-foreground/30 uppercase tracking-[0.5em] italic group-hover:text-primary transition-colors duration-700">
        {label.toUpperCase()}
      </span>
      <div className="flex items-center gap-8">
        <span className="font-display font-black text-2xl tracking-tighter italic text-foreground leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:translate-x-1 transition-transform duration-700">
          {value}
        </span>
        {trend && (
          <span className={cn('text-[10px] font-black uppercase italic tracking-[0.2em] px-3 py-1.5 rounded-none border shadow-2xl transition-all duration-700 group-hover:scale-110', trendColors[trend])}>
            <span className="mr-2 text-sm">{trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'}</span>
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
};


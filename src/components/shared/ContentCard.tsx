import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
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
  default: 'bg-white/[0.01] border-white/5',
  interactive: 'bg-white/[0.01] border-white/5 hover:border-primary/40 hover:bg-white/[0.04] cursor-pointer shadow-2xl hover:shadow-[0_0_50px_rgba(0,0,0,0.5)]',
  active: 'bg-primary/5 border-primary/40 shadow-[0_0_40px_rgba(var(--primary),0.15)]',
  glass: 'bg-white/[0.02] backdrop-blur-3xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]',
  subtle: 'bg-white/[0.01] border-transparent',
};

const sizeStyles: Record<CardSize, { container: string; content: string }> = {
  sm: {
    container: 'p-6',
    content: '',
  },
  md: {
    container: 'p-10',
    content: '',
  },
  lg: {
    container: 'p-16',
    content: '',
  },
};

const iconColorStyles = {
  primary: 'bg-primary/5 text-primary border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]',
  secondary: 'bg-secondary/5 text-secondary border-secondary/20 shadow-[0_0_20px_rgba(var(--secondary),0.1)]',
  success: 'bg-emerald-400/5 text-emerald-400 border-emerald-400/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]',
  warning: 'bg-amber-400/5 text-amber-400 border-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.1)]',
  destructive: 'bg-red-400/5 text-red-400 border-red-400/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]',
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
  badgeVariant = 'secondary',
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
        'rounded-2xl border overflow-hidden transition-all duration-1000',
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
        <div className="flex items-start justify-between gap-8 mb-10">
          {header ? (
            <div className="flex-1">{header}</div>
          ) : (
            <div className="flex items-center gap-8 flex-1 min-w-0">
              {Icon && (
                <div
                  className={cn(
                    'w-14 h-14 rounded-none border flex items-center justify-center shrink-0 transition-all duration-1000 group-hover:scale-110',
                    iconColorStyles[iconColor]
                  )}
                >
                  <Icon className="w-7 h-7" strokeWidth={1.5} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <h4 className="font-display font-black text-2xl text-foreground truncate uppercase italic tracking-tighter leading-none mb-3 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    {title}
                  </h4>
                )}
                {subtitle && (
                  <p className="text-[10px] font-black uppercase text-muted-foreground/30 italic tracking-[0.3em] truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          )}
          {badge && (
            <div className="px-4 py-1.5 bg-white/5 border border-white/10 text-[8px] font-black tracking-[0.3em] uppercase italic rounded-none shrink-0 h-fit transition-all duration-700 hover:bg-white/10 hover:border-white/20">
              {badge}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={sizeStyles[size].content}>{children}</div>

      {/* Footer */}
      {footer && (
        <div className="mt-10 pt-10 border-t border-white/5">{footer}</div>
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
    <p className="text-[10px] font-black uppercase text-muted-foreground/20 italic tracking-[0.2em] leading-relaxed">
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
    up: 'text-emerald-400 bg-emerald-400/5',
    down: 'text-red-400 bg-red-400/5',
    neutral: 'text-muted-foreground/10 bg-white/5',
  };

  return (
    <div className={cn('flex items-center justify-between py-5 group border-b border-white/[0.03] last:border-0', className)}>
      <span className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.4em] italic group-hover:text-muted-foreground/40 transition-colors duration-700">
        {label}
      </span>
      <div className="flex items-center gap-6">
        <span className="font-display font-black text-xl tracking-tighter italic text-foreground leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">
          {value}
        </span>
        {trend && (
          <span className={cn('text-[9px] font-black uppercase italic tracking-[0.2em] px-2 py-1 rounded-none border border-white/5', trendColors[trend])}>
            {trend === 'up' && '▲'}
            {trend === 'down' && '▼'}
            {trend === 'neutral' && '—'}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default ContentCard;
Card;

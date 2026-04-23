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
  interactive: 'bg-white/[0.01] border-white/5 hover:border-primary/20 hover:bg-white/[0.03] cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(var(--primary),0.05)]',
  active: 'bg-primary/5 border-primary/40 shadow-[0_0_30px_rgba(var(--primary),0.1)]',
  glass: 'bg-white/[0.02] backdrop-blur-3xl border-white/5 shadow-xl',
  subtle: 'bg-white/[0.01] border-transparent',
};

const sizeStyles: Record<CardSize, { container: string; content: string }> = {
  sm: {
    container: 'p-4',
    content: '',
  },
  md: {
    container: 'p-8',
    content: '',
  },
  lg: {
    container: 'p-12',
    content: '',
  },
};

const iconColorStyles = {
  primary: 'bg-primary/5 text-primary border-primary/20',
  secondary: 'bg-secondary/5 text-secondary border-secondary/20',
  success: 'bg-emerald-400/5 text-emerald-400 border-emerald-400/20',
  warning: 'bg-amber-400/5 text-amber-400 border-amber-400/20',
  destructive: 'bg-red-400/5 text-red-400 border-red-400/20',
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
        'rounded-2xl border overflow-hidden transition-all duration-700',
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
        <div className="flex items-start justify-between gap-6 mb-8">
          {header ? (
            <div className="flex-1">{header}</div>
          ) : (
            <div className="flex items-center gap-6 flex-1 min-w-0">
              {Icon && (
                <div
                  className={cn(
                    'w-12 h-12 rounded-none border flex items-center justify-center shrink-0 transition-all duration-700',
                    iconColorStyles[iconColor]
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <h4 className="font-display font-black text-xl text-foreground truncate uppercase italic tracking-tighter leading-none mb-2">
                    {title}
                  </h4>
                )}
                {subtitle && (
                  <p className="text-[10px] font-black uppercase text-muted-foreground/20 italic tracking-[0.2em] truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          )}
          {badge && (
            <Badge variant={badgeVariant} className="text-[8px] font-black tracking-[0.2em] uppercase rounded-none shrink-0 h-6 px-3 border-white/5">
              {badge}
            </Badge>
          )}
        </div>
      )}

      {/* Content */}
      <div className={sizeStyles[size].content}>{children}</div>

      {/* Footer */}
      {footer && (
        <div className="mt-8 pt-8 border-t border-white/5">{footer}</div>
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
      {description}
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
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-muted-foreground/20',
  };

  return (
    <div className={cn('flex items-center justify-between py-4 group', className)}>
      <span className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] italic group-hover:text-muted-foreground/40 transition-colors">
        {label}
      </span>
      <div className="flex items-center gap-4">
        <span className="font-display font-black text-lg tracking-tighter italic text-foreground leading-none">
          {value}
        </span>
        {trend && (
          <span className={cn('text-[9px] font-black uppercase italic tracking-[0.2em]', trendColors[trend])}>
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

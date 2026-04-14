import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tokens } from '@/lib/tokens';
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
  default: 'bg-card/40 border-white/10',
  interactive: 'bg-card/40 border-white/10 hover:border-white/20 hover:bg-card/60 cursor-pointer',
  active: 'bg-primary/15 border-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.15)]',
  glass: 'bg-card/60 backdrop-blur-xl border-white/5',
  subtle: 'bg-white/5 border-transparent',
};

const sizeStyles: Record<CardSize, { container: string; content: string }> = {
  sm: {
    container: 'p-3',
    content: '',
  },
  md: {
    container: 'p-4',
    content: '',
  },
  lg: {
    container: 'p-6',
    content: '',
  },
};

const iconColorStyles = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  success: 'bg-emerald-500/10 text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-400',
  destructive: 'bg-red-500/10 text-red-400',
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
        'rounded-xl border overflow-hidden',
        isInteractive && 'w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        tokens.transition.normal,
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
        <div className="flex items-start justify-between gap-3 mb-4">
          {header ? (
            <div className="flex-1">{header}</div>
          ) : (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {Icon && (
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                    iconColorStyles[iconColor]
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <h4 className="font-bold text-sm text-foreground truncate">
                    {title}
                  </h4>
                )}
                {subtitle && (
                  <p className="text-xs text-muted-foreground truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          )}
          {badge && (
            <Badge variant={badgeVariant} className="text-[9px] shrink-0">
              {badge}
            </Badge>
          )}
        </div>
      )}

      {/* Content */}
      <div className={sizeStyles[size].content}>{children}</div>

      {/* Footer */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-white/5">{footer}</div>
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
    <p className="text-sm text-muted-foreground">{description}</p>
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
    neutral: 'text-muted-foreground',
  };

  return (
    <div className={cn('flex items-center justify-between py-2', className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-sm">{value}</span>
        {trend && (
          <span className={cn('text-xs', trendColors[trend])}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trend === 'neutral' && '→'}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default ContentCard;

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { tokens } from '@/lib/tokens';

interface EmptyStateProps {
  /** Primary icon to display */
  icon: React.ComponentType<{ className?: string; size?: number | string; strokeWidth?: number | string }>;
  /** Main title text */
  title: string;
  /** Optional description/explanation */
  description?: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  };
  /** Secondary action (usually "Learn more" or dismiss) */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Visual variant */
  variant?: 'default' | 'compact' | 'card' | 'inline';
  /** Custom className for container */
  className?: string;
  /** Icon size multiplier (default: 1) */
  iconScale?: number;
}

const variantStyles = {
  default: {
    container: 'py-16 px-8',
    icon: 'w-16 h-16 mb-6',
    iconSize: 32,
    title: 'text-lg',
    description: 'text-sm mt-2 max-w-md',
  },
  compact: {
    container: 'py-8 px-4',
    icon: 'w-12 h-12 mb-4',
    iconSize: 24,
    title: 'text-base',
    description: 'text-sm mt-1 max-w-sm',
  },
  card: {
    container: 'py-12 px-6 border border-dashed border-white/10 rounded-xl bg-card/20',
    icon: 'w-14 h-14 mb-4',
    iconSize: 28,
    title: 'text-base',
    description: 'text-sm mt-1 max-w-sm',
  },
  inline: {
    container: 'py-4 px-2',
    icon: 'w-8 h-8 mr-3',
    iconSize: 20,
    title: 'text-sm',
    description: 'text-xs mt-0 ml-11',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  className,
  iconScale = 1,
}) => {
  const styles = variantStyles[variant];
  const iconSize = Math.round(styles.iconSize * iconScale);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        styles.container,
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted/30',
          styles.icon
        )}
      >
        <Icon
          size={iconSize}
          className="text-muted-foreground/40"
          strokeWidth={1.5}
        />
      </div>

      <h3
        className={cn(
          'font-display font-black tracking-tight text-foreground',
          styles.title
        )}
      >
        {title}
      </h3>

      {description && (
        <p className={cn('text-muted-foreground', styles.description)}>
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className={cn('flex items-center gap-3 mt-4', variant === 'inline' && 'ml-11')}>
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              size={variant === 'compact' || variant === 'inline' ? 'sm' : 'default'}
              className={tokens.transition.normal}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="ghost"
              size={variant === 'compact' || variant === 'inline' ? 'sm' : 'default'}
              className={cn('text-muted-foreground hover:text-foreground', tokens.transition.fast)}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Specialized empty state for "No search results"
 */
export const NoSearchResults: React.FC<{
  query: string;
  onClear: () => void;
  className?: string;
}> = ({ query, onClear, className }) => (
  <EmptyState
    icon={Search}
    title="No results found"
    description={`We couldn't find any matches for "${query}". Try adjusting your search terms.`}
    action={{
      label: 'Clear search',
      onClick: onClear,
      variant: 'outline',
    }}
    variant="compact"
    className={className}
  />
);

/**
 * Specialized empty state for "Coming soon" features
 */
export const ComingSoon: React.FC<{
  title?: string;
  description?: string;
  className?: string;
}> = ({ 
  title = 'Coming Soon',
  description = 'This feature is under development. Check back in a future update!',
  className 
}) => (
  <EmptyState
    icon={Construction}
    title={title}
    description={description}
    variant="card"
    className={className}
  />
);

/**
 * Specialized empty state for error boundaries
 */
export const ErrorState: React.FC<{
  error: Error;
  onReset?: () => void;
  className?: string;
}> = ({ error, onReset, className }) => (
  <EmptyState
    icon={AlertCircle}
    title="Something went wrong"
    description={error.message || 'An unexpected error occurred. Please try again.'}
    action={onReset ? {
      label: 'Try again',
      onClick: onReset,
      variant: 'default',
    } : undefined}
    variant="default"
    className={cn('text-red-400', className)}
  />
);

// Import icons used in specialized components
import { Search, Construction, AlertCircle } from 'lucide-react';

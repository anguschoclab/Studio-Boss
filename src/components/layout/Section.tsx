import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tokens } from '@/lib/tokens';

interface SectionProps {
  /** Section title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional icon to display */
  icon?: LucideIcon;
  /** Action buttons or controls */
  actions?: React.ReactNode;
  /** Section content */
  children: React.ReactNode;
  /** Include a divider below the header */
  divider?: boolean;
  /** Visual variant */
  variant?: 'default' | 'card' | 'flush';
  /** Custom className for container */
  className?: string;
  /** Custom className for content area */
  contentClassName?: string;
}

const variantStyles = {
  default: {
    container: '',
    header: 'pb-4 mb-4',
    content: '',
  },
  card: {
    container: 'bg-card/40 border border-white/5 rounded-xl p-6',
    header: 'pb-4 mb-4 border-b border-white/5',
    content: '',
  },
  flush: {
    container: '',
    header: 'pb-3 mb-3',
    content: '',
  },
};

/**
 * Section - Standardized page section with header
 * 
 * Provides consistent section headers with optional icon, subtitle,
 * and actions. Use this for all major content sections.
 */
export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  divider = true,
  variant = 'default',
  className,
  contentClassName,
}) => {
  const styles = variantStyles[variant];

  return (
    <section className={cn(styles.container, className)}>
      {/* Header */}
      <div
        className={cn(
          'flex items-start justify-between gap-4',
          styles.header,
          divider && 'border-b border-white/5'
        )}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
          <div>
            <h2 className={tokens.text.heading}>{title}</h2>
            {subtitle && (
              <p className={cn(tokens.text.caption, 'mt-0.5')}>{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn(styles.content, contentClassName)}>
        {children}
      </div>
    </section>
  );
};

/**
 * SectionGroup - Groups multiple sections with consistent spacing
 */
export const SectionGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}> = ({ children, className, spacing = 'lg' }) => {
  const spacingClass = {
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-8',
  };

  return (
    <div className={cn(spacingClass[spacing], className)}>
      {children}
    </div>
  );
};

/**
 * SubSection - Smaller section for use within main sections
 */
export const SubSection: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}> = ({ title, children, className, action }) => (
  <div className={cn('space-y-3', className)}>
    <div className="flex items-center justify-between">
      <h3 className={cn(tokens.text.label, 'text-foreground')}>{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

export default Section;

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
    header: 'pb-6 mb-6',
    content: '',
  },
  card: {
    container: 'bg-white/[0.01] border border-white/5 rounded-none p-10 backdrop-blur-3xl shadow-2xl',
    header: 'pb-6 mb-6 border-b border-white/5',
    content: '',
  },
  flush: {
    container: '',
    header: 'pb-4 mb-4',
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
          'flex items-start justify-between gap-6',
          styles.header,
          divider && 'border-b border-white/5'
        )}
      >
        <div className="flex items-center gap-6">
          {Icon && (
            <div className="w-12 h-12 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-2xl">
              <Icon className="w-6 h-6 text-primary" strokeWidth={2.5} />
            </div>
          )}
          <div>
            <h2 className={cn(tokens.text.heading, "text-2xl font-black uppercase italic tracking-tight leading-none mb-2")}>{title.toUpperCase()}</h2>
            {subtitle && (
              <p className={cn(tokens.text.caption, 'text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 italic leading-none')}>
                {subtitle.toUpperCase()}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-4 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn(styles.content, contentClassName, 'pt-4')}>
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
    sm: 'space-y-8',
    md: 'space-y-12',
    lg: 'space-y-20',
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
  <div className={cn('space-y-6', className)}>
    <div className="flex items-center justify-between border-l-2 border-primary/40 pl-4 py-1">
      <h3 className={cn(tokens.text.label, 'text-sm font-black uppercase italic tracking-widest text-foreground/80 leading-none')}>
        {title.toUpperCase()}
      </h3>
      {action}
    </div>
    <div className="pl-4">
      {children}
    </div>
  </div>
);

export default Section;

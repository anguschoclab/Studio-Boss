import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const progressVariants = cva(
  'relative overflow-hidden rounded-full bg-muted/30',
  {
    variants: {
      size: {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
      },
      variant: {
        default: '',
        striped: 'bg-stripes',
        animated: 'bg-stripes animate-stripes',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const barVariants = cva(
  'h-full rounded-full transition-all duration-500 ease-out',
  {
    variants: {
      color: {
        primary: 'bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.5)]',
        secondary: 'bg-secondary shadow-[0_0_10px_hsl(var(--secondary)/0.5)]',
        success: 'bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]',
        destructive: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]',
        warning: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
        info: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]',
        gradient: 'bg-gradient-to-r from-primary to-secondary',
      },
    },
    defaultVariants: {
      color: 'primary',
    },
  }
);

interface ProgressIndicatorProps extends VariantProps<typeof progressVariants> {
  value: number;
  max?: number;
  color?: 'primary' | 'secondary' | 'success' | 'destructive' | 'warning' | 'info' | 'gradient';
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number, max: number) => string;
  className?: string;
  barClassName?: string;
  segments?: { value: number; color: string; label?: string }[];
  animated?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  variant = 'default',
  label,
  showValue = true,
  formatValue,
  className,
  barClassName,
  segments,
  animated = true,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const defaultFormat = (v: number, m: number) => `${Math.round((v / m) * 100)}%`;
  const displayValue = formatValue ? formatValue(value, max) : defaultFormat(value, max);

  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && <span className="text-foreground/80 font-mono">{displayValue}</span>}
        </div>
      )}
      
      <div className={cn(progressVariants({ size, variant }))}>
        {segments ? (
          // Multi-segment progress bar
          <div className="flex h-full w-full">
            {segments.map((segment, i) => {
              const segPercentage = Math.min(100, (segment.value / max) * 100);
              return (
                <div
                  key={i}
                  className={cn(
                    'h-full first:rounded-l-full last:rounded-r-full transition-all duration-500',
                    segment.color
                  )}
                  style={{ width: `${segPercentage}%` }}
                  title={segment.label}
                />
              );
            })}
          </div>
        ) : (
          // Single progress bar
          <div
            className={cn(
              barVariants({ color }),
              barClassName,
              animated && 'animate-pulse-subtle'
            )}
            style={{ width: `${percentage}%` }}
          >
            {variant === 'animated' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Segmented progress for multi-part metrics
interface SegmentedProgressProps {
  segments: { label: string; value: number; color: string }[];
  total: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SegmentedProgress: React.FC<SegmentedProgressProps> = ({
  segments,
  total,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn('flex w-full rounded-full overflow-hidden bg-muted/30', sizeClasses[size])}>
        {segments.map((seg, i) => {
          const percentage = Math.max(0, Math.min(100, (seg.value / total) * 100));
          return (
            <div
              key={i}
              className={cn('h-full transition-all duration-500', seg.color)}
              style={{ width: `${percentage}%` }}
              title={`${seg.label}: ${seg.value}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={cn('w-2 h-2 rounded-full', seg.color)} />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {seg.label}: {seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Circular progress indicator
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 60,
  strokeWidth = 4,
  color = 'hsl(var(--primary))',
  label,
  sublabel,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {label && <span className="text-lg font-bold font-display">{label}</span>}
          {sublabel && <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{sublabel}</span>}
        </div>
      )}
    </div>
  );
};

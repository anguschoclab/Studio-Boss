import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const progressVariants = cva(
  "relative overflow-hidden rounded-none bg-white/5 border border-white/5",
  {
    variants: {
      size: {
        sm: "h-2",
        md: "h-4",
        lg: "h-6",
      },
      variant: {
        default: "",
        striped: "bg-stripes",
        animated: "bg-stripes animate-stripes",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

const barVariants = cva("h-full rounded-none transition-all duration-1000 ease-out", {
  variants: {
    color: {
      primary: "bg-primary shadow-[0_0_20px_rgba(var(--primary),0.4)]",
      secondary: "bg-secondary shadow-[0_0_20px_rgba(var(--secondary),0.4)]",
      success: "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]",
      destructive: "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]",
      warning: "bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]",
      info: "bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.4)]",
      gradient:
        "bg-gradient-to-r from-primary via-primary to-secondary shadow-[0_0_30px_rgba(var(--primary),0.3)]",
    },
  },
  defaultVariants: {
    color: "primary",
  },
});

interface ProgressIndicatorProps extends VariantProps<typeof progressVariants> {
  value: number;
  max?: number;
  color?: "primary" | "secondary" | "success" | "destructive" | "warning" | "info" | "gradient";
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
  size = "md",
  color = "primary",
  variant = "default",
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
    <div className={cn("space-y-4", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.4em] italic">
          {label && <span className="text-muted-foreground/30">{label.toUpperCase()}</span>}
          {showValue && (
            <span className="text-foreground font-display font-black tracking-tighter italic group-hover:text-primary transition-colors">
              {displayValue}
            </span>
          )}
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
                    "h-full rounded-none transition-all duration-1000 border-r border-black/20 last:border-r-0",
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
            className={cn(barVariants({ color }), barClassName, animated && "animate-pulse-subtle")}
            style={{ width: `${percentage}%` }}
          >
            {variant === "animated" && (
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
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const SegmentedProgress: React.FC<SegmentedProgressProps> = ({
  segments,
  total,
  size = "md",
  className,
}) => {
  const sizeClasses = {
    sm: "h-2",
    md: "h-5",
    lg: "h-8",
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div
        className={cn(
          "flex w-full rounded-none overflow-hidden bg-white/5 border border-white/5 shadow-2xl",
          sizeClasses[size]
        )}
      >
        {segments.map((seg, i) => {
          const percentage = Math.max(0, Math.min(100, (seg.value / total) * 100));
          return (
            <div
              key={i}
              className={cn(
                "h-full transition-all duration-1000 border-r border-black/40 last:border-r-0",
                seg.color
              )}
              style={{ width: `${percentage}%` }}
              title={`${seg.label}: ${seg.value}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-8">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={cn("w-2 h-2 rounded-none shadow-xl", seg.color)} />
            <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] italic">
              {seg.label.toUpperCase()}:{" "}
              <span className="text-foreground font-display tracking-tighter text-sm ml-2">
                {seg.value}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Circular progress indicator (Tactical Meter)
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
  size = 100,
  strokeWidth = 8,
  color = "rgba(var(--primary), 1)",
  label,
  sublabel,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center p-4 border border-white/5 bg-white/[0.01] rounded-none shadow-2xl backdrop-blur-3xl",
        className
      )}
      style={{ width: size + 32, height: size + 32 }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          fill="none"
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
          strokeLinecap="butt"
          className="transition-all duration-1000 ease-out drop-shadow-[0_0_20px_rgba(var(--primary),0.5)]"
        />
      </svg>
      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
          {label && (
            <span className="text-2xl font-display font-black italic tracking-tighter leading-none text-foreground">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic leading-none">
              {sublabel.toUpperCase()}
            </span>
          )}
        </div>
      )}

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/20" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/20" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20" />
    </div>
  );
};

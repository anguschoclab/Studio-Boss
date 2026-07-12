import React from "react";
import { cn } from "@/lib/utils";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";

interface KPIStatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number | string;
    isPositive: boolean;
  };
  variant?: "primary" | "secondary" | "success" | "destructive" | "muted";
  tooltip?: string;
  className?: string;
}

const ACCENT = {
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-emerald-400",
  destructive: "text-rose-400",
  muted: "text-foreground",
} as const;

const BAR = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-emerald-400",
  destructive: "bg-rose-400",
  muted: "bg-white/30",
} as const;

export const KPIStatCard: React.FC<KPIStatCardProps> = ({
  label,
  value,
  subLabel,
  icon,
  trend,
  variant = "muted",
  tooltip,
  className,
}) => {
  return (
    <TooltipWrapper tooltip={tooltip}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-none border border-white/10 bg-white/[0.015]",
          "p-6 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.03]",
          className
        )}
      >
        {/* Single thin accent bar — brightens on hover. No glow blobs. */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-[3px] opacity-40 transition-opacity duration-200 group-hover:opacity-100",
            BAR[variant]
          )}
        />

        <div className="flex items-start justify-between gap-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground not-italic">
            {label}
          </span>
          {icon && (
            <div
              className={cn(
                "shrink-0 opacity-50 transition-opacity duration-200 group-hover:opacity-100",
                ACCENT[variant]
              )}
            >
              {icon}
            </div>
          )}
        </div>

        <div
          className={cn(
            "mt-4 font-display text-4xl font-bold not-italic normal-case tracking-tight tabular-nums leading-none",
            ACCENT[variant]
          )}
        >
          {value}
        </div>

        {(subLabel || trend) && (
          <div className="mt-3 flex items-center gap-3">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-semibold tabular-nums not-italic",
                  trend.isPositive ? "text-emerald-400" : "text-rose-400"
                )}
              >
                <span aria-hidden className="text-[10px] leading-none">
                  {trend.isPositive ? "▲" : "▼"}
                </span>
                {trend.value}
              </span>
            )}
            {subLabel && (
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground/50 not-italic">
                {subLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </TooltipWrapper>
  );
};

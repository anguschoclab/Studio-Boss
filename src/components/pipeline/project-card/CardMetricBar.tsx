import React from "react";
import {LucideIcon} from "lucide-react";
import {TooltipWrapper} from "@/components/ui/tooltip-wrapper";
import {cn} from "@/lib/utils";

interface CardMetricBarProps {
  label: string;
  value: React.ReactNode;
  /** 0–100 percentage driving the fill width (clamped at 100). */
  pct: number;
  icon: LucideIcon;
  iconClassName?: string;
  valueClassName?: string;
  barClassName: string;
  /** "pulse" = animated white sweep; "fade" = static dark gradient. */
  overlay: "pulse" | "fade";
  tooltip: string;
}

/**
 * Shared label + icon + value + progress-bar row used by ProjectCard for
 * buzz, awareness and phase-progress metrics.
 */
export const CardMetricBar = ({
  label,
  value,
  pct,
  icon: Icon,
  iconClassName,
  valueClassName,
  barClassName,
  overlay,
  tooltip,
}: CardMetricBarProps) => (
  <TooltipWrapper tooltip={tooltip} side="top">
    <div className="space-y-3">
      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-all duration-700 italic">
        <span className="flex items-center gap-2">
          <Icon className={cn("h-3 w-3 transition-colors", iconClassName)} strokeWidth={3} />{" "}
          {label}
        </span>
        <span
          className={cn(
            "font-display font-black italic tracking-tighter text-sm",
            valueClassName
          )}
        >
          {value}
        </span>
      </div>
      <div className="h-2 bg-black/60 rounded-none overflow-hidden border border-white/5 p-[1px]">
        <div
          data-testid="metric-fill"
          className={cn("h-full transition-all duration-1000 relative", barClassName)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        >
          {overlay === "pulse" ? (
            <div
              data-testid="metric-overlay"
              className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse"
            />
          ) : (
            <div
              data-testid="metric-overlay"
              className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20"
            />
          )}
        </div>
      </div>
    </div>
  </TooltipWrapper>
);

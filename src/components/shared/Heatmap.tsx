import React from "react";
import { cn } from "@/lib/utils";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";

interface HeatmapCell {
  id: string;
  row: string;
  col: string;
  value: number;
  label?: string;
  tooltip?: string;
}

interface HeatmapProps {
  data: HeatmapCell[];
  rows: string[];
  cols: string[];
  colorScale?: "default" | "diverging" | "sequential";
  minValue?: number;
  maxValue?: number;
  className?: string;
  cellSize?: "sm" | "md" | "lg";
  showLabels?: boolean;
  onCellClick?: (cell: HeatmapCell) => void;
}

const colorScales = {
  default: [
    { threshold: 0, bg: "bg-white/5", text: "text-muted-foreground/20" },
    { threshold: 20, bg: "bg-white/10", text: "text-muted-foreground/40" },
    { threshold: 40, bg: "bg-primary/20", text: "text-primary/60" },
    { threshold: 60, bg: "bg-primary/40", text: "text-primary/80" },
    { threshold: 80, bg: "bg-primary/60", text: "text-white" },
    { threshold: 100, bg: "bg-primary", text: "text-white" },
  ],
  diverging: [
    { threshold: -100, bg: "bg-red-600", text: "text-white" },
    { threshold: -50, bg: "bg-red-500", text: "text-white" },
    { threshold: -20, bg: "bg-red-400/30", text: "text-red-400" },
    { threshold: 0, bg: "bg-white/5", text: "text-muted-foreground/20" },
    { threshold: 20, bg: "bg-emerald-400/30", text: "text-emerald-400" },
    { threshold: 50, bg: "bg-emerald-500", text: "text-white" },
    { threshold: 100, bg: "bg-emerald-600", text: "text-white" },
  ],
  sequential: [
    { threshold: 0, bg: "bg-primary/5", text: "text-primary/20" },
    { threshold: 25, bg: "bg-primary/20", text: "text-primary/40" },
    { threshold: 50, bg: "bg-primary/40", text: "text-primary/60" },
    { threshold: 75, bg: "bg-primary/60", text: "text-white" },
    { threshold: 100, bg: "bg-amber-400", text: "text-black" },
  ],
};

export const Heatmap: React.FC<HeatmapProps> = ({
  data,
  rows,
  cols,
  colorScale = "default",
  minValue = 0,
  maxValue = 100,
  className,
  cellSize = "md",
  showLabels = false,
  onCellClick,
}) => {
  const scale = colorScales[colorScale];

  const getCellColor = (value: number) => {
    const normalizedValue = ((value - minValue) / (maxValue - minValue)) * 100;
    for (let i = scale.length - 1; i >= 0; i--) {
      if (normalizedValue >= scale[i].threshold) {
        return scale[i];
      }
    }
    return scale[0];
  };

  const getCell = (row: string, col: string) => {
    return data.find((d) => d.row === row && d.col === col);
  };

  const cellSizeClasses = {
    sm: "w-8 h-8 text-[8px]",
    md: "w-10 h-10 text-[10px]",
    lg: "w-12 h-12 text-xs",
  };

  return (
    <div className={cn("overflow-x-auto custom-scrollbar w-full p-4", className)}>
      <div className="inline-block min-w-full">
        {/* Column headers */}
        <div className="flex mb-4">
          <div className="w-24 shrink-0" /> {/* Corner spacer */}
          {cols.map((col) => (
            <div key={col} className="flex-1 min-w-[2.5rem] text-center">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 truncate block px-2 italic">
                {col}
              </span>
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-1.5">
          {rows.map((row) => (
            <div key={row} className="flex items-center">
              {/* Row label */}
              <div className="w-24 shrink-0 pr-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 truncate block text-right italic leading-none">
                  {row}
                </span>
              </div>

              {/* Cells */}
              <div className="flex gap-1.5">
                {cols.map((col) => {
                  const cell = getCell(row, col);
                  const colors = cell ? getCellColor(cell.value) : colorScales.default[0];

                  return (
                    <TooltipWrapper
                      key={`${row}-${col}`}
                      tooltip={cell?.tooltip || `${row} × ${col}: ${cell?.value ?? 0}`}
                      side="top"
                    >
                      <button
                        onClick={() => cell && onCellClick?.(cell)}
                        className={cn(
                          "rounded-none border border-white/5 transition-all duration-700 flex items-center justify-center font-black",
                          cellSizeClasses[cellSize],
                          colors.bg,
                          colors.text,
                          onCellClick &&
                            cell &&
                            "hover:scale-110 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(var(--primary),0.2)] z-10 cursor-pointer",
                          !cell && "opacity-10"
                        )}
                      >
                        {showLabels && cell && (
                          <span className="truncate px-0.5 font-display tracking-tighter italic">
                            {cell.label || cell.value}
                          </span>
                        )}
                      </button>
                    </TooltipWrapper>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Simplified heatmap for single-row data (like genre popularity)
interface MiniHeatmapProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  className?: string;
  barHeight?: "sm" | "md" | "lg";
}

export const MiniHeatmap: React.FC<MiniHeatmapProps> = ({
  data,
  maxValue = 100,
  className,
  barHeight = "md",
}) => {
  const heightClasses = {
    sm: "h-1.5",
    md: "h-3",
    lg: "h-5",
  };

  return (
    <div className={cn("space-y-4", className)}>
      {data.map((item, i) => {
        const percentage = Math.min(100, Math.max(0, (item.value / maxValue) * 100));
        return (
          <div key={i} className="space-y-2 group">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] italic">
              <span className="text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors">
                {item.label}
              </span>
              <span className="text-foreground font-display font-black tracking-tighter italic">
                {item.value}%
              </span>
            </div>
            <div
              className={cn(
                "w-full rounded-none bg-white/5 border border-white/5 overflow-hidden",
                heightClasses[barHeight]
              )}
            >
              <div
                className={cn(
                  "h-full rounded-none transition-all duration-700",
                  item.color || "bg-primary"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

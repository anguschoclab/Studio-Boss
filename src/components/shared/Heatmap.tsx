import React from 'react';
import { cn } from '@/lib/utils';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';

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
  colorScale?: 'default' | 'diverging' | 'sequential';
  minValue?: number;
  maxValue?: number;
  className?: string;
  cellSize?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  onCellClick?: (cell: HeatmapCell) => void;
}

const colorScales = {
  default: [
    { threshold: 0, bg: 'bg-slate-900/50', text: 'text-slate-500' },
    { threshold: 20, bg: 'bg-slate-800', text: 'text-slate-400' },
    { threshold: 40, bg: 'bg-primary/20', text: 'text-primary/70' },
    { threshold: 60, bg: 'bg-primary/40', text: 'text-primary' },
    { threshold: 80, bg: 'bg-primary/60', text: 'text-primary-foreground' },
    { threshold: 100, bg: 'bg-primary', text: 'text-primary-foreground' },
  ],
  diverging: [
    { threshold: -100, bg: 'bg-red-600', text: 'text-white' },
    { threshold: -50, bg: 'bg-red-400', text: 'text-white' },
    { threshold: -20, bg: 'bg-red-200', text: 'text-red-900' },
    { threshold: 0, bg: 'bg-slate-200', text: 'text-slate-700' },
    { threshold: 20, bg: 'bg-emerald-200', text: 'text-emerald-900' },
    { threshold: 50, bg: 'bg-emerald-400', text: 'text-white' },
    { threshold: 100, bg: 'bg-emerald-600', text: 'text-white' },
  ],
  sequential: [
    { threshold: 0, bg: 'bg-blue-900/30', text: 'text-blue-200/50' },
    { threshold: 25, bg: 'bg-blue-800/50', text: 'text-blue-200' },
    { threshold: 50, bg: 'bg-blue-600', text: 'text-white' },
    { threshold: 75, bg: 'bg-blue-400', text: 'text-white' },
    { threshold: 100, bg: 'bg-amber-400', text: 'text-amber-900' },
  ],
};

export const Heatmap: React.FC<HeatmapProps> = ({
  data,
  rows,
  cols,
  colorScale = 'default',
  minValue = 0,
  maxValue = 100,
  className,
  cellSize = 'md',
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
    return data.find(d => d.row === row && d.col === col);
  };

  const cellSizeClasses = {
    sm: 'w-6 h-6 text-[8px]',
    md: 'w-8 h-8 text-[10px]',
    lg: 'w-10 h-10 text-xs',
  };

  return (
    // Standardized horizontal scrolling utility for wide data visualizations
    <div className={cn('overflow-x-auto max-w-full custom-scrollbar', className)}>
      <div className="inline-block min-w-full">
        {/* Column headers */}
        <div className="flex">
          <div className="w-20 shrink-0" /> {/* Corner spacer */}
          {cols.map(col => (
            <div key={col} className="flex-1 min-w-[2rem] text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 truncate block px-1">
                {col}
              </span>
            </div>
          ))}
        </div>
        
        {/* Rows */}
        <div className="space-y-1 mt-2">
          {rows.map(row => (
            <div key={row} className="flex items-center">
              {/* Row label */}
              <div className="w-20 shrink-0 pr-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate block text-right">
                  {row}
                </span>
              </div>
              
              {/* Cells */}
              <div className="flex gap-1">
                {cols.map(col => {
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
                          'rounded transition-all duration-200 flex items-center justify-center font-bold',
                          cellSizeClasses[cellSize],
                          colors.bg,
                          colors.text,
                          onCellClick && cell && 'hover:scale-110 hover:ring-2 hover:ring-primary/50 cursor-pointer',
                          !cell && 'opacity-20'
                        )}
                      >
                        {showLabels && cell && (
                          <span className="truncate px-0.5">{cell.label || cell.value}</span>
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
  barHeight?: 'sm' | 'md' | 'lg';
}

export const MiniHeatmap: React.FC<MiniHeatmapProps> = ({
  data,
  maxValue = 100,
  className,
  barHeight = 'md',
}) => {
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {data.map((item, i) => {
        const percentage = Math.min(100, Math.max(0, (item.value / maxValue) * 100));
        return (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold uppercase tracking-wider text-muted-foreground">{item.label}</span>
              <span className="font-mono font-bold text-foreground/80">{item.value}%</span>
            </div>
            <div className={cn('w-full rounded-full bg-muted/30 overflow-hidden', heightClasses[barHeight])}>
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  item.color || 'bg-primary'
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

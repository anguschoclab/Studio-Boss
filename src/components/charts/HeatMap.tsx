import React from 'react';
import { cn } from '@/lib/utils';

interface HeatMapCell {
  x: string;
  y: string;
  value: number;
}

interface HeatMapProps {
  data: HeatMapCell[];
  xLabels: string[];
  yLabels: string[];
  className?: string;
  colorScale?: string[];
  valueFormatter?: (value: number) => string;
  onCellClick?: (cell: HeatMapCell) => void;
}

export const HeatMap: React.FC<HeatMapProps> = ({
  data,
  xLabels,
  yLabels,
  className,
  colorScale = ['#fee2e2', '#fecaca', '#f87171', '#ef4444', '#dc2626', '#991b1b'],
  valueFormatter = (v) => v.toString(),
  onCellClick,
}) => {
  if (!data || data.length === 0 || xLabels.length === 0 || yLabels.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-[200px] text-muted-foreground', className)}>
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const getColor = (value: number) => {
    const normalized = (value - minValue) / range;
    const index = Math.min(
      Math.floor(normalized * colorScale.length),
      colorScale.length - 1
    );
    return colorScale[index];
  };

  const getCellValue = (x: string, y: string) => {
    const cell = data.find(d => d.x === x && d.y === y);
    return cell?.value ?? 0;
  };

  return (
    <div className={cn('overflow-x-auto custom-scrollbar w-full', className)}>
      <div className="inline-block min-w-full">
        {/* Header row with X labels */}
        <div className="flex">
          <div className="w-24 flex-shrink-0" /> {/* Corner spacer */}
          {xLabels.map((label) => (
            <div 
              key={label}
              className="w-16 flex-shrink-0 text-center text-[10px] text-muted-foreground py-1"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {yLabels.map((yLabel) => (
          <div key={yLabel} className="flex items-center">
            {/* Y label */}
            <div className="w-24 flex-shrink-0 text-[10px] text-muted-foreground pr-2 text-right">
              {yLabel}
            </div>
            
            {/* Cells */}
            {xLabels.map((xLabel) => {
              const value = getCellValue(xLabel, yLabel);
              const cell = data.find(d => d.x === xLabel && d.y === yLabel);
              
              return (
                <div
                  key={`${xLabel}-${yLabel}`}
                  className={cn(
                    'w-16 h-10 flex-shrink-0 flex items-center justify-center text-[9px] font-medium cursor-pointer transition-all hover:ring-2 hover:ring-primary',
                    onCellClick && 'cursor-pointer'
                  )}
                  role="button" aria-label={`Heatmap cell ${xLabel} ${yLabel}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && cell) {
                      e.preventDefault();
                      onCellClick?.(cell);
                    }
                  }}
                  style={{ backgroundColor: getColor(value) }}
                  onClick={() => cell && onCellClick?.(cell)}
                  title={`${yLabel} × ${xLabel}: ${valueFormatter(value)}`}
                >
                  {valueFormatter(value)}
                </div>
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 justify-end">
          <span className="text-[10px] text-muted-foreground">{valueFormatter(minValue)}</span>
          <div className="flex gap-0.5">
            {colorScale.map((color, i) => (
              <div
                key={i}
                className="w-4 h-3"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">{valueFormatter(maxValue)}</span>
        </div>
      </div>
    </div>
  );
};

export default HeatMap;

import React from 'react';
import { HeatMap } from '@/components/charts/HeatMap';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';

interface GenrePerformanceData {
  genre: string;
  metric: string;
  value: number; // ROI percentage or performance score
}

interface GenrePerformanceMatrixProps {
  data: GenrePerformanceData[];
  className?: string;
}

export const GenrePerformanceMatrix: React.FC<GenrePerformanceMatrixProps> = ({
  data,
  className,
}) => {
  // Extract unique genres and metrics
  const genres = Array.from(new Set(data.map(d => d.genre)));
  const metrics = Array.from(new Set(data.map(d => d.metric)));

  // Transform data for heatmap
  const heatmapData = data.map(d => ({
    x: d.metric,
    y: d.genre,
    value: d.value,
  }));

  // Color scale: red (negative) to green (positive)
  const colorScale = [
    '#7f1d1d', // Very negative
    '#991b1b',
    '#b91c1c',
    '#dc2626',
    '#ef4444',
    '#f87171',
    '#fca5a5',
    '#fee2e2', // Near zero
    '#dcfce7',
    '#bbf7d0',
    '#86efac',
    '#4ade80',
    '#22c55e',
    '#16a34a',
    '#15803d',
    '#166534', // Very positive
  ];

  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value}%`;

  return (
    <Card className={cn('p-4', tokens.border.default, className)}>
      <div className="mb-4">
        <h4 className="font-bold text-sm">Genre Performance Matrix</h4>
        <p className={cn('text-[10px]', tokens.text.caption)}>
          ROI by genre and metric (green = positive, red = negative)
        </p>
      </div>

      <HeatMap
        data={heatmapData}
        xLabels={metrics}
        yLabels={genres}
        colorScale={colorScale}
        valueFormatter={formatPercent}
      />
    </Card>
  );
};

export default GenrePerformanceMatrix;

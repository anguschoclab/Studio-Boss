import React from 'react';
import { RadarChart } from '@/components/charts/RadarChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';

interface StudioHealthMetrics {
  metric: string;
  score: number; // 0-100
  fullMark?: number;
}

interface StudioHealthRadarProps {
  metrics: StudioHealthMetrics[];
  className?: string;
  showComparison?: boolean;
  previousMetrics?: StudioHealthMetrics[];
}

export const StudioHealthRadar: React.FC<StudioHealthRadarProps> = ({
  metrics,
  className,
  showComparison = false,
  previousMetrics,
}) => {
  const radarData = metrics.map(m => ({
    metric: m.metric,
    value: m.score,
    fullMark: m.fullMark || 100,
  }));

  const previousData = showComparison && previousMetrics 
    ? previousMetrics.map(m => ({
        metric: m.metric,
        value: m.score,
        fullMark: m.fullMark || 100,
      }))
    : undefined;

  const averageScore = metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length;

  return (
    <Card className={cn('p-4', tokens.border.default, className)}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="font-bold text-sm">Studio Health</h4>
          <p className={cn('text-[10px]', tokens.text.caption)}>
            Multi-dimensional performance
          </p>
        </div>
        <div className="text-right">
          <p className={cn(
            'text-xl font-bold',
            averageScore >= 70 ? 'text-emerald-500' :
            averageScore >= 50 ? 'text-amber-500' : 'text-red-500'
          )}>
            {averageScore.toFixed(0)}%
          </p>
          <p className={cn('text-[10px]', tokens.text.caption)}>Average</p>
        </div>
      </div>

      <RadarChart
        data={radarData}
        height={220}
        color="#3b82f6"
        secondaryData={previousData}
        secondaryColor="#94a3b8"
        showTooltip={true}
        valueFormatter={(v) => `${v}%`}
      />

      {showComparison && (
        <div className="flex items-center justify-center gap-4 mt-2 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-slate-400" />
            <span>Previous</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default StudioHealthRadar;

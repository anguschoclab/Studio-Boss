import React from 'react';
import { TimeSeriesChart } from '@/components/charts/TimeSeriesChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { Tv, Eye, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/gameStore';
import { selectStreamingViewership } from '@/store/selectors';

interface ViewershipData {
  week: number;
  hoursWatched: number;
  uniqueViewers: number;
  completionRate: number;
}

interface StreamingViewershipChartProps {
  data?: ViewershipData[];
  platformName?: string;
  className?: string;
}

export const StreamingViewershipChart: React.FC<StreamingViewershipChartProps> = ({
  data: externalData,
  platformName: externalPlatform,
  className,
}) => {
  const gameState = useGameStore(s => s.gameState);
  const data = externalData || selectStreamingViewership(gameState, externalPlatform || 'Netflix');
  const platformName = externalPlatform || 'Netflix';
  const current = data[data.length - 1];
  const previous = data[data.length - 2] || current;
  
  const hoursGrowth = current && previous 
    ? ((current.hoursWatched - previous.hoursWatched) / previous.hoursWatched) * 100 
    : 0;

  const chartData = data.map(d => ({
    date: `W${d.week}`,
    value: d.hoursWatched,
    secondaryValue: d.uniqueViewers,
  }));

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <Card className={cn('p-4', tokens.border.default, className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Tv className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-bold text-sm">{platformName}</h4>
            <p className={cn('text-[10px]', tokens.text.caption)}>
              Viewership metrics
            </p>
          </div>
        </div>
        <Badge 
          className={cn(
            'text-[9px]',
            hoursGrowth > 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
          )}
        >
          <TrendingUp className={cn('h-3 w-3 mr-1', hoursGrowth < 0 && 'rotate-180')} />
          {hoursGrowth > 0 ? '+' : ''}{hoursGrowth.toFixed(0)}%
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 bg-muted/30 rounded text-center">
          <p className="text-sm font-bold">{formatNumber(current?.hoursWatched || 0)}</p>
          <p className={cn('text-[9px]', tokens.text.caption)}>Hours</p>
        </div>
        <div className="p-2 bg-muted/30 rounded text-center">
          <p className="text-sm font-bold">{formatNumber(current?.uniqueViewers || 0)}</p>
          <p className={cn('text-[9px]', tokens.text.caption)}>Viewers</p>
        </div>
        <div className="p-2 bg-muted/30 rounded text-center">
          <p className="text-sm font-bold">{current?.completionRate?.toFixed(0) || 0}%</p>
          <p className={cn('text-[9px]', tokens.text.caption)}>Complete</p>
        </div>
      </div>

      <TimeSeriesChart
        data={chartData}
        height={140}
        lineColor="#8b5cf6"
        secondaryLineColor="#06b6d4"
        valueFormatter={formatNumber}
        showGrid={false}
      />

      <div className="flex items-center justify-center gap-4 mt-2 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-1 bg-purple-500" />
          <span>Hours</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-1 bg-cyan-500" />
          <span>Viewers</span>
        </div>
      </div>
    </Card>
  );
};

export default StreamingViewershipChart;

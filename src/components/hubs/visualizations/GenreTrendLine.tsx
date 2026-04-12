import React from 'react';
import { TimeSeriesChart } from '@/components/charts/TimeSeriesChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Flame, Snowflake } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GenreTrendPoint {
  week: number;
  heat: number; // 0-100
}

interface GenreTrendLineProps {
  genre: string;
  data: GenreTrendPoint[];
  trend: 'rising' | 'stable' | 'cooling';
  className?: string;
}

export const GenreTrendLine: React.FC<GenreTrendLineProps> = ({
  genre,
  data,
  trend,
  className,
}) => {
  const currentHeat = data[data.length - 1]?.heat || 0;
  const previousHeat = data[data.length - 2]?.heat || currentHeat;
  const change = currentHeat - previousHeat;

  const chartData = data.map(d => ({
    date: `W${d.week}`,
    value: d.heat,
  }));

  const getTrendIcon = () => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'cooling': return <TrendingDown className="h-4 w-4 text-blue-500" />;
      default: return <Snowflake className="h-4 w-4 text-slate-400" />;
    }
  };

  const getTrendBadge = () => {
    switch (trend) {
      case 'rising':
        return (
          <Badge className="text-[9px] bg-red-500/20 text-red-500">
            <Flame className="h-3 w-3 mr-1" />
            Hot
          </Badge>
        );
      case 'cooling':
        return (
          <Badge className="text-[9px] bg-blue-500/20 text-blue-500">
            <Snowflake className="h-3 w-3 mr-1" />
            Cooling
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-[9px]">Stable</Badge>;
    }
  };

  const getHeatColor = (heat: number) => {
    if (heat >= 80) return '#ef4444';
    if (heat >= 60) return '#f59e0b';
    if (heat >= 40) return '#3b82f6';
    return '#94a3b8';
  };

  return (
    <Card className={cn('p-3', tokens.border.default, className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">{genre}</span>
          {getTrendBadge()}
        </div>
        <div className="flex items-center gap-1">
          <span 
            className="text-lg font-bold"
            style={{ color: getHeatColor(currentHeat) }}
          >
            {currentHeat}
          </span>
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
      </div>

      <TimeSeriesChart
        data={chartData}
        height={80}
        lineColor={getHeatColor(currentHeat)}
        showArea={true}
        showGrid={false}
        valueFormatter={(v) => `${v}`}
      />

      <div className="flex items-center justify-between mt-2 text-[10px]">
        <span className={cn(
          'font-medium',
          change > 0 ? 'text-red-500' : change < 0 ? 'text-blue-500' : 'text-slate-400'
        )}>
          {change > 0 ? '+' : ''}{change} this week
        </span>
        {getTrendIcon()}
      </div>
    </Card>
  );
};

export default GenreTrendLine;

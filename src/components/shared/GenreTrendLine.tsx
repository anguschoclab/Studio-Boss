import React from 'react';
import { TimeSeriesChart } from '@/components/charts/TimeSeriesChart';
import { } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Flame, Snowflake, Activity } from 'lucide-react';
import { } from '@/components/ui/badge';
import { useGameStore } from '@/store/gameStore';
import { selectMarketTrends } from '@/store/selectors';

interface GenreTrendPoint {
  week: number;
  heat: number; // 0-100
}

interface GenreTrendLineProps {
  genre?: string;
  data?: GenreTrendPoint[];
  trend?: 'rising' | 'stable' | 'cooling';
  className?: string;
}

export const GenreTrendLine: React.FC<GenreTrendLineProps> = ({
  genre: externalGenre,
  data: externalData,
  trend: externalTrend,
  className,
}) => {
  const gameState = useGameStore(s => s.gameState);
  const allTrends = selectMarketTrends(gameState);
  
  // Filter by genre if specified
  const genreTrends = externalGenre 
    ? allTrends.filter(t => t.genre === externalGenre)
    : allTrends;
  
  const data = externalData || genreTrends.map(t => ({
    week: t.week,
    heat: t.heat || 50
  }));
  
  const genre = externalGenre || genreTrends[0]?.genre || 'ACTION';
  
  // Determine trend from data
  const trend = externalTrend || (() => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-4);
    const avgChange = recent.reduce((sum, d, i) => {
      if (i === 0) return 0;
      return sum + (d.heat - recent[i-1].heat);
    }, 0) / Math.max(recent.length - 1, 1);
    if (avgChange > 2) return 'rising';
    if (avgChange < -2) return 'cooling';
    return 'stable';
  })();
  const currentHeat = data[data.length - 1]?.heat || 0;
  const previousHeat = data[data.length - 2]?.heat || currentHeat;
  const change = currentHeat - previousHeat;

  const chartData = data.map(d => ({
    date: `W${d.week}`,
    value: d.heat,
  }));

  const getTrendIcon = () => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-emerald-400" strokeWidth={2.5} />;
      case 'cooling': return <TrendingDown className="h-4 w-4 text-red-400" strokeWidth={2.5} />;
      default: return <Activity className="h-4 w-4 text-muted-foreground/20" strokeWidth={2.5} />;
    }
  };

  const getTrendBadge = () => {
    switch (trend) {
      case 'rising':
        return (
          <div className="px-2 py-1 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[8px] font-black uppercase tracking-[0.2em] italic flex items-center gap-1.5 rounded-none">
            <Flame className="h-3 w-3" />
            HOT
          </div>
        );
      case 'cooling':
        return (
          <div className="px-2 py-1 bg-red-400/10 border border-red-400/20 text-red-400 text-[8px] font-black uppercase tracking-[0.2em] italic flex items-center gap-1.5 rounded-none">
            <Snowflake className="h-3 w-3" />
            COOLING
          </div>
        );
      default:
        return (
          <div className="px-2 py-1 bg-white/5 border border-white/10 text-muted-foreground/40 text-[8px] font-black uppercase tracking-[0.2em] italic rounded-none">
            STABLE
          </div>
        );
    }
  };

  const getHeatColor = (heat: number) => {
    if (heat >= 80) return '#10b981'; // Hot = Emerald (Rising)
    if (heat >= 60) return '#34d399';
    if (heat >= 40) return 'rgba(var(--primary), 1)';
    return '#ef4444'; // Cooling = Red
  };

  return (
    <div className={cn('glass-card p-6 rounded-none group transition-all duration-700 hover:bg-white/[0.03]', className)}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <span className="font-display font-black text-lg italic tracking-tighter uppercase leading-none">{genre}</span>
          {getTrendBadge()}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span 
            className="text-3xl font-display font-black italic tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"
            style={{ color: getHeatColor(currentHeat) }}
          >
            {currentHeat}
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/10 italic">/ 100</span>
        </div>
      </div>

      <div className="bg-white/[0.01] border border-white/5 p-4 mb-6 relative overflow-hidden">
        <TimeSeriesChart
          data={chartData}
          height={100}
          lineColor={getHeatColor(currentHeat)}
          showArea={true}
          showGrid={false}
          valueFormatter={(v) => `${v}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] italic">
        <span className={cn(
          'transition-colors duration-700',
          change > 0 ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-muted-foreground/10'
        )}>
          {change > 0 ? '+' : ''}{change} <span className="text-muted-foreground/20">THIS WEEK</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground/10">MKT TREND</span>
          {getTrendIcon()}
        </div>
      </div>
    </div>
  );
};

export default GenreTrendLine;

export default GenreTrendLine;

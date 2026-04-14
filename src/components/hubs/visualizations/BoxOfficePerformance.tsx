import React from 'react';
import { SimpleBarChart } from '@/components/charts/SimpleBarChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/gameStore';
import { selectBoxOfficeData } from '@/store/selectors';

interface BoxOfficeData {
  projectTitle: string;
  openingWeekend: number;
  totalGross: number;
  theaters?: number;
  perTheater?: number;
  trend: 'blockbuster' | 'hit' | 'average' | 'flop' | 'bomb';
}

interface BoxOfficePerformanceProps {
  projects?: BoxOfficeData[];
  className?: string;
}

export const BoxOfficePerformance: React.FC<BoxOfficePerformanceProps> = ({
  projects: externalProjects,
  className,
}) => {
  const gameState = useGameStore(s => s.gameState);
  const projects = externalProjects || selectBoxOfficeData(gameState);
  const totalGross = projects.reduce((sum, p) => sum + p.totalGross, 0);
  const avgPerTheater = projects.length > 0
    ? projects.reduce((sum, p) => sum + (p.perTheater || 0), 0) / projects.length
    : 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'blockbuster': return '#10b981';
      case 'hit': return '#3b82f6';
      case 'average': return '#f59e0b';
      case 'flop': return '#ef4444';
      case 'bomb': return '#7f1d1d';
      default: return '#94a3b8';
    }
  };

  const chartData = projects
    .sort((a, b) => b.totalGross - a.totalGross)
    .slice(0, 6)
    .map(p => ({
      label: p.projectTitle.length > 10 ? p.projectTitle.slice(0, 10) + '...' : p.projectTitle,
      value: p.totalGross,
      color: getTrendColor(p.trend),
    }));

  const blockbusters = projects.filter(p => p.trend === 'blockbuster').length;

  return (
    <Card className={cn('p-4', tokens.border.default, className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-sm">Box Office Performance</h4>
          <p className={cn('text-[10px]', tokens.text.caption)}>
            Theatrical gross by project
          </p>
        </div>
        {blockbusters > 0 && (
          <Badge className="text-[9px] bg-emerald-500/20 text-emerald-500">
            <TrendingUp className="h-3 w-3 mr-1" />
            {blockbusters} hit{blockbusters > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2 bg-muted/30 rounded text-center">
          <p className="text-sm font-bold">{formatCurrency(totalGross)}</p>
          <p className={cn('text-[9px]', tokens.text.caption)}>Total Gross</p>
        </div>
        <div className="p-2 bg-muted/30 rounded text-center">
          <p className="text-sm font-bold">{formatCurrency(avgPerTheater)}</p>
          <p className={cn('text-[9px]', tokens.text.caption)}>Avg Per Theater</p>
        </div>
      </div>

      <SimpleBarChart
        data={chartData}
        height={150}
        showGrid={false}
        valueFormatter={formatCurrency}
      />

      {/* Performance legend */}
      <div className="flex flex-wrap gap-2 mt-3">
        {['blockbuster', 'hit', 'average', 'flop'].map((trend) => (
          <div key={trend} className="flex items-center gap-1 text-[9px]">
            <div 
              className="w-2 h-2 rounded" 
              style={{ backgroundColor: getTrendColor(trend) }}
            />
            <span className="capitalize">{trend}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default BoxOfficePerformance;

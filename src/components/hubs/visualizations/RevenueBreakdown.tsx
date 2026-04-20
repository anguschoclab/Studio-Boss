import React, { useMemo } from 'react';
import { PieChart } from '@/components/charts/PieChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import { selectRevenueBreakdown } from '@/store/selectors';

interface RevenueSource {
  name: string;
  value: number;
  color?: string;
}

interface RevenueBreakdownProps {
  sources?: RevenueSource[];
  totalRevenue?: number;
  className?: string;
}

export const RevenueBreakdown: React.FC<RevenueBreakdownProps> = ({
  sources: externalSources,
  totalRevenue: externalTotal,
  className,
}) => {
  const gameState = useGameStore(s => s.gameState);
  const sources = useMemo(() => {
    const rawSources = externalSources || selectRevenueBreakdown(gameState);
    return rawSources.map(s => {
      // Standardize to the local RevenueSource interface
      const name = 'name' in s ? String(s.name) : 'source' in s ? String(s.source) : 'Unknown';
      const value = s.value;
      const color = 'color' in s ? String(s.color) : undefined;
      return { name, value, color };
    });
  }, [externalSources, gameState]);

  const totalRevenue = externalTotal || sources.reduce((sum, s) => sum + s.value, 0);
  const defaultColors = [
    '#3b82f6', // Theatrical
    '#10b981', // Streaming
    '#f59e0b', // TV
    '#8b5cf6', // Merchandise
    '#ec4899', // Licensing
    '#06b6d4', // Syndication
    '#84cc16', // Other
  ];

  const data = sources.map((s, i) => ({
    name: s.name,
    value: s.value,
    color: s.color || defaultColors[i % defaultColors.length],
  }));

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <Card className={cn('p-4', tokens.border.default, className)}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="font-bold text-sm">Revenue Breakdown</h4>
          <p className={cn('text-[10px]', tokens.text.caption)}>
            By source
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-emerald-500">
            {formatCurrency(totalRevenue)}
          </p>
          <p className={cn('text-[10px]', tokens.text.caption)}>Total</p>
        </div>
      </div>

      <PieChart
        data={data}
        height={200}
        innerRadius={40}
        outerRadius={70}
        showTooltip={true}
        showLegend={false}
        valueFormatter={formatCurrency}
      />

      {/* Custom legend */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {data.map((item) => {
          const percentage = ((item.value / totalRevenue) * 100).toFixed(1);
          return (
            <div key={item.name} className="flex items-center gap-2 text-[10px]">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate">{item.name}</span>
              <span className="text-muted-foreground ml-auto">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default RevenueBreakdown;

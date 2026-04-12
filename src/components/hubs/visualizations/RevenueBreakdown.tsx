import React from 'react';
import { PieChart } from '@/components/charts/PieChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';

interface RevenueSource {
  name: string;
  value: number;
  color?: string;
}

interface RevenueBreakdownProps {
  sources: RevenueSource[];
  totalRevenue: number;
  className?: string;
}

export const RevenueBreakdown: React.FC<RevenueBreakdownProps> = ({
  sources,
  totalRevenue,
  className,
}) => {
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

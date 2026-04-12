import React from 'react';
import { TimeSeriesChart } from '@/components/charts/TimeSeriesChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CashFlowData {
  week: number;
  revenue: number;
  expenses: number;
  net: number;
}

interface CashFlowChartProps {
  data: CashFlowData[];
  weeks?: number;
  className?: string;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({
  data,
  weeks = 12,
  className,
}) => {
  const recentData = data.slice(-weeks);
  const chartData = recentData.map(d => ({
    date: `W${d.week}`,
    value: d.net,
    secondaryValue: d.revenue,
  }));

  const totalNet = recentData.reduce((sum, d) => sum + d.net, 0);
  const isPositive = totalNet >= 0;

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <Card className={cn('p-4', tokens.border.default, className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-sm">Cash Flow Trend</h4>
          <p className={cn('text-[10px]', tokens.text.caption)}>
            Last {weeks} weeks
          </p>
        </div>
        <div className="flex items-center gap-1">
          {isPositive ? (
            <>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-500">
                +{formatCurrency(totalNet)}
              </span>
            </>
          ) : (
            <>
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-500">
                {formatCurrency(totalNet)}
              </span>
            </>
          )}
        </div>
      </div>

      <TimeSeriesChart
        data={chartData}
        height={180}
        lineColor={isPositive ? '#10b981' : '#ef4444'}
        secondaryLineColor="#3b82f6"
        showArea={true}
        valueFormatter={formatCurrency}
      />
    </Card>
  );
};

export default CashFlowChart;

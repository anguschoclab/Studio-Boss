import React from 'react';
import { SparkLine } from '@/components/charts/SparkLine';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface WeeklyRevenueSparkProps {
  data: number[];
  label: string;
  className?: string;
}

export const WeeklyRevenueSpark: React.FC<WeeklyRevenueSparkProps> = ({
  data,
  label,
  className,
}) => {
  const latest = data[data.length - 1] || 0;
  const previous = data[data.length - 2] || latest;
  const change = latest - previous;
  const percentChange = previous !== 0 ? ((change / previous) * 100) : 0;
  const isPositive = change >= 0;

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <Card className={cn('p-3', tokens.border.default, className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className={cn('text-[10px] uppercase', tokens.text.caption)}>{label}</p>
          <p className="text-lg font-bold">{formatCurrency(latest)}</p>
          <div className={cn(
            'flex items-center gap-1 text-[10px]',
            isPositive ? 'text-emerald-500' : 'text-red-500'
          )}>
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>
              {isPositive ? '+' : ''}{percentChange.toFixed(1)}% vs last week
            </span>
          </div>
        </div>
        <SparkLine
          data={data}
          width={80}
          height={30}
          color={isPositive ? '#10b981' : '#ef4444'}
        />
      </div>
    </Card>
  );
};

export default WeeklyRevenueSpark;

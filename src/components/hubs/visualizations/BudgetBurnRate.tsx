import React from 'react';
import { TimeSeriesChart } from '@/components/charts/TimeSeriesChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/gameStore';
import { selectBudgetBurnData } from '@/store/selectors';

interface BurnRateData {
  week: number;
  planned: number;
  actual: number;
  remaining: number;
}

interface BudgetBurnRateProps {
  data?: BurnRateData[];
  totalBudget?: number;
  projectId?: string;
  className?: string;
}

export const BudgetBurnRate: React.FC<BudgetBurnRateProps> = ({
  data: externalData,
  totalBudget: externalBudget,
  projectId,
  className,
}) => {
  const gameState = useGameStore(s => s.gameState);
  const selectorData = projectId ? selectBudgetBurnData(gameState, projectId) : null;
  const data = externalData || selectorData || [];
  const totalBudget = externalBudget || (selectorData && selectorData[0]?.remaining + selectorData.reduce((sum, d) => sum + d.actual, 0)) || 0;
  const currentBurn = data[data.length - 1]?.actual || 0;
  const plannedBurn = data[data.length - 1]?.planned || 0;
  const variance = currentBurn - plannedBurn;
  const isOverBurn = variance > 0;
  const totalSpent = data.reduce((sum, d) => sum + d.actual, 0);
  const remaining = totalBudget - totalSpent;
  const percentUsed = (totalSpent / totalBudget) * 100;

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const chartData = data.map(d => ({
    date: `W${d.week}`,
    value: d.actual,
    secondaryValue: d.planned,
  }));

  return (
    <Card className={cn('p-4', tokens.border.default, className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-sm">Budget Burn Rate</h4>
          <p className={cn('text-[10px]', tokens.text.caption)}>
            Actual vs planned spending
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isOverBurn && (
            <Badge className="text-[9px] bg-red-500/20 text-red-500">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Over burn
            </Badge>
          )}
          <div className={cn(
            'text-lg font-bold',
            percentUsed > 90 ? 'text-red-500' :
            percentUsed > 75 ? 'text-amber-500' : 'text-emerald-500'
          )}>
            {percentUsed.toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="p-2 bg-muted/30 rounded">
          <p className="text-xs font-bold">{formatCurrency(totalSpent)}</p>
          <p className={cn('text-[9px]', tokens.text.caption)}>Spent</p>
        </div>
        <div className="p-2 bg-muted/30 rounded">
          <p className={cn(
            'text-xs font-bold',
            isOverBurn ? 'text-red-500' : 'text-emerald-500'
          )}>
            {formatCurrency(currentBurn)}
          </p>
          <p className={cn('text-[9px]', tokens.text.caption)}>This week</p>
        </div>
        <div className="p-2 bg-muted/30 rounded">
          <p className="text-xs font-bold">{formatCurrency(remaining)}</p>
          <p className={cn('text-[9px]', tokens.text.caption)}>Remaining</p>
        </div>
      </div>

      <TimeSeriesChart
        data={chartData}
        height={140}
        lineColor="#ef4444"
        secondaryLineColor="#3b82f6"
        valueFormatter={formatCurrency}
        showGrid={false}
      />

      <div className="flex items-center justify-center gap-4 mt-2 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-1 bg-red-500" />
          <span>Actual</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-1 bg-blue-500" />
          <span>Planned</span>
        </div>
      </div>
    </Card>
  );
};

export default BudgetBurnRate;

import React from 'react';
import { SimpleBarChart } from '@/components/charts/SimpleBarChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/gameStore';
import { selectRecoupmentStatus } from '@/store/selectors';

interface RecoupmentProject {
  title: string;
  recouped: number; // percentage
  revenue: number;
  budget: number;
  status: 'profitable' | 'recouped' | 'in_progress' | 'at_risk';
}

interface RecoupmentStatusProps {
  projects?: RecoupmentProject[];
  className?: string;
}

export const RecoupmentStatus: React.FC<RecoupmentStatusProps> = ({
  projects: externalProjects,
  className,
}) => {
  const gameState = useGameStore(s => s.gameState);
  const projects = externalProjects || selectRecoupmentStatus(gameState);
  const profitable = projects.filter(p => p.status === 'profitable').length;
  const atRisk = projects.filter(p => p.status === 'at_risk').length;
  const totalRecouped = projects.reduce((sum, p) => sum + p.revenue, 0);
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const overallRate = totalBudget > 0 ? (totalRecouped / totalBudget) * 100 : 0;

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'profitable': return '#10b981';
      case 'recouped': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'at_risk': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const chartData = projects
    .sort((a, b) => b.recouped - a.recouped)
    .slice(0, 6)
    .map(p => ({
      label: p.title.length > 10 ? p.title.slice(0, 10) + '...' : p.title,
      value: p.recouped,
      color: getStatusColor(p.status),
    }));

  return (
    <Card className={cn('p-4', tokens.border.default, className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          <div>
            <h4 className="font-bold text-sm">Recoupment Status</h4>
            <p className={cn('text-[10px]', tokens.text.caption)}>
              Investment recovery progress
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn(
            'text-xl font-bold',
            overallRate >= 100 ? 'text-emerald-500' : 'text-amber-500'
          )}>
            {overallRate.toFixed(0)}%
          </p>
          <p className={cn('text-[10px]', tokens.text.caption)}>Overall</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 bg-emerald-500/10 rounded text-center">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-sm font-bold text-emerald-500">{profitable}</p>
          <p className={cn('text-[9px]', tokens.text.caption)}>Profitable</p>
        </div>
        <div className="p-2 bg-muted/30 rounded text-center">
          <p className="text-sm font-bold">{formatCurrency(totalRecouped)}</p>
          <p className={cn('text-[9px]', tokens.text.caption)}>Revenue</p>
        </div>
        <div className="p-2 bg-red-500/10 rounded text-center">
          <AlertTriangle className="h-4 w-4 text-red-500 mx-auto mb-1" />
          <p className="text-sm font-bold text-red-500">{atRisk}</p>
          <p className={cn('text-[9px]', tokens.text.caption)}>At Risk</p>
        </div>
      </div>

      <SimpleBarChart
        data={chartData}
        height={140}
        showGrid={false}
        valueFormatter={(v) => `${v.toFixed(0)}%`}
      />
    </Card>
  );
};

export default RecoupmentStatus;

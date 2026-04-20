import React, { useMemo } from 'react';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/gameStore';
import { selectProductionSlippage } from '@/store/selectors';

interface SlippageData {
  projectName: string;
  originalEndWeek: number;
  currentEndWeek: number;
  weeksSlipped: number;
  isSlipping: boolean;
}

interface ProductionSlippageIndicatorProps {
  projects?: SlippageData[];
  className?: string;
}

export const ProductionSlippageIndicator: React.FC<ProductionSlippageIndicatorProps> = ({
  projects: externalProjects,
  className,
}) => {
  const gameState = useGameStore(s => s.gameState);
  const data = externalProjects || selectProductionSlippage(gameState);
  const totalSlipped = data.length;
  const avgSlippage = totalSlipped > 0 
    ? data.reduce((sum, p) => sum + p.weeksSlipped, 0) / totalSlipped 
    : 0;
  
  // Gauge value: 0 = perfect, 100 = disaster (based on avg slippage)
  const gaugeValue = Math.min((avgSlippage / 4) * 100, 100);

  const getStatus = () => {
    if (gaugeValue < 25) return { label: 'On Track', color: '#10b981', icon: CheckCircle2 };
    if (gaugeValue < 50) return { label: 'Minor Delays', color: '#f59e0b', icon: Clock };
    if (gaugeValue < 75) return { label: 'Significant Delays', color: '#ef4444', icon: AlertTriangle };
    return { label: 'Critical', color: '#dc2626', icon: AlertTriangle };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <Card className={cn('p-4', tokens.border.default, className)}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-bold text-sm">Schedule Performance</h4>
          <p className={cn('text-[10px]', tokens.text.caption)}>
            Production timeline adherence
          </p>
        </div>
        <Badge 
          className="text-[9px]"
          style={{ 
            backgroundColor: `${status.color}20`,
            color: status.color,
            borderColor: status.color 
          }}
          variant="outline"
        >
          <Icon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
      </div>

      <div className="flex flex-col items-center">
        <GaugeChart
          value={100 - gaugeValue} // Invert: 100 = perfect, 0 = bad
          size={140}
          strokeWidth={10}
          color={status.color}
          label="On-Time Score"
          valueFormatter={(v) => `${v.toFixed(0)}%`}
        />
      </div>

      <div className="space-y-2 mt-3">
        <div className="flex items-center justify-between text-[10px]">
          <span className={tokens.text.caption}>Projects slipped</span>
          <span className="font-medium">{totalSlipped}</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className={tokens.text.caption}>Avg delay</span>
          <span className={cn(
            'font-medium',
            avgSlippage > 2 ? 'text-red-500' : 'text-amber-500'
          )}>
            {avgSlippage.toFixed(1)} weeks
          </span>
        </div>
      </div>

      {/* Top slip reasons */}
      {data.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/30">
          <p className={cn('text-[10px] font-medium mb-2', tokens.text.caption)}>
            Recent delays:
          </p>
          {data.slice(0, 3).map((p, idx) => (
            <div key={idx} className="flex items-center justify-between text-[10px] py-1">
              <span className="truncate max-w-[100px]">{p.projectName}</span>
              <span className="text-red-500">+{p.weeksSlipped}w</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ProductionSlippageIndicator;

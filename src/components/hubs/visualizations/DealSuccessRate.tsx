import React from 'react';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { Handshake, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { selectDealStats } from '@/store/selectors';

interface DealStats {
  total: number;
  accepted: number;
  rejected: number;
  pending: number;
  avgNegotiationWeeks: number;
}

interface DealSuccessRateProps {
  stats?: DealStats;
  className?: string;
}

export const DealSuccessRate: React.FC<DealSuccessRateProps> = ({
  stats: externalStats,
  className,
}) => {
  const gameState = useGameStore(s => s.gameState);
  const stats = externalStats || selectDealStats(gameState);
  const successRate = stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0;

  const getStatusColor = (rate: number) => {
    if (rate >= 60) return '#10b981';
    if (rate >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Card className={cn('p-4', tokens.border.default, className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Handshake className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-bold text-sm">Deal Success Rate</h4>
            <p className={cn('text-[10px]', tokens.text.caption)}>
              Talent negotiation outcomes
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center mb-4">
        <GaugeChart
          value={successRate}
          size={120}
          strokeWidth={10}
          color={getStatusColor(successRate)}
          label="Success Rate"
          valueFormatter={(v) => `${v.toFixed(0)}%`}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-2 p-2 bg-emerald-500/10 rounded">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <div>
            <p className="text-sm font-bold text-emerald-500">{stats.accepted}</p>
            <p className={cn('text-[9px]', tokens.text.caption)}>Accepted</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded">
          <XCircle className="h-4 w-4 text-red-500" />
          <div>
            <p className="text-sm font-bold text-red-500">{stats.rejected}</p>
            <p className={cn('text-[9px]', tokens.text.caption)}>Rejected</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-2 bg-muted/30 rounded text-[10px]">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className={tokens.text.caption}>Avg negotiation</span>
        </div>
        <span className="font-medium">{stats.avgNegotiationWeeks.toFixed(1)} weeks</span>
      </div>
    </Card>
  );
};

export default DealSuccessRate;

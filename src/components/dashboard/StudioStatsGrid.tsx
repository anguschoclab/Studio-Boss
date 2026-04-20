import { StatCard } from '@/components/shared/StatCard';
import { Clapperboard, DollarSign, Award, Users } from 'lucide-react';
import { formatMoney } from '@/engine/utils';
import { SparklineChart } from '@/components/shared/SparklineChart';
import { ProgressIndicator } from '@/components/shared/ProgressIndicator';
import { GameState } from '@/engine/types';

interface StudioStatsGridProps {
  finance: GameState['finance'];
  activeProjectsCount: number;
  releasedProjectsCount: number;
  prestige: number;
  talentCount: number;
  rivalCount: number;
  cashHistory: number[];
  cashTrend: number;
}

export const StudioStatsGrid = ({
  finance,
  activeProjectsCount,
  releasedProjectsCount,
  prestige,
  talentCount,
  rivalCount,
  cashHistory,
  cashTrend
}: StudioStatsGridProps) => {
  return (
    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
      <StatCard
        title="Cash Reserves"
        value={formatMoney(finance.cash)}
        subtitle="Available liquidity"
        icon={DollarSign}
        color={finance.cash > 100000000 ? 'success' : finance.cash > 50000000 ? 'primary' : 'warning'}
        trend={cashTrend > 5 ? 'up' : cashTrend < -5 ? 'down' : 'neutral'}
        trendValue={cashTrend !== 0 ? `${Math.abs(Math.round(cashTrend))}%` : undefined}
        size="md"
      >
        {cashHistory.length > 1 && (
          <SparklineChart 
            data={cashHistory} 
            width={200} 
            height={30}
            trend={cashTrend > 5 ? 'up' : cashTrend < -5 ? 'down' : 'neutral'}
          />
        )}
      </StatCard>
      
      <StatCard
        title="Active Pipeline"
        value={activeProjectsCount}
        subtitle={`${releasedProjectsCount} released to date`}
        icon={Clapperboard}
        color="primary"
        trend="up"
        size="md"
      />
      
      <StatCard
        title="Prestige Rating"
        value={prestige}
        subtitle="Industry reputation"
        icon={Award}
        color="secondary"
        size="md"
      >
        <ProgressIndicator 
          value={prestige} 
          max={100} 
          size="sm" 
          color="secondary"
          showValue={false}
        />
      </StatCard>
      
      <StatCard
        title="Talent Network"
        value={talentCount}
        subtitle={`vs ${rivalCount} rival studios`}
        icon={Users}
        color="info"
        size="md"
      />
    </div>
  );
};

import React from 'react';
import { PieChart } from '@/components/charts/PieChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { Star, Users } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { selectTalentTierDistribution } from '@/store/selectors';

interface TierData {
  tier: 'A-list' | 'B-list' | 'C-list' | 'Emerging' | 'Unknown';
  count: number;
  avgSalary: number;
}

interface TalentTierDistributionProps {
  data?: TierData[];
  totalTalent?: number;
  className?: string;
}

export const TalentTierDistribution: React.FC<TalentTierDistributionProps> = ({
  data: externalData,
  totalTalent: externalTotal,
  className,
}) => {
  const gameState = useGameStore(s => s.gameState);
  const { data, totalTalent } = externalData !== undefined
    ? { data: externalData, totalTalent: externalTotal || 0 }
    : selectTalentTierDistribution(gameState);
  const tierColors: Record<string, string> = {
    'A-list': '#f59e0b',    // Amber
    'B-list': '#3b82f6',    // Blue
    'C-list': '#10b981',    // Emerald
    'Emerging': '#8b5cf6',  // Purple
    'Unknown': '#94a3b8',   // Slate
  };

  const chartData = data.map(d => ({
    name: d.tier,
    value: d.count,
    color: tierColors[d.tier],
  }));

  const aListCount = data.find(d => d.tier === 'A-list')?.count || 0;
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <Card className={cn('p-4', tokens.border.default, className)}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-bold text-sm">Talent Distribution</h4>
          <p className={cn('text-[10px]', tokens.text.caption)}>
            By tier and influence
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{totalTalent}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Star className="h-4 w-4 text-amber-500" />
        <span className="text-sm">{aListCount} A-list stars</span>
      </div>

      <PieChart
        data={chartData}
        height={150}
        innerRadius={30}
        outerRadius={60}
        showTooltip={true}
        showLegend={false}
        valueFormatter={(v) => `${v} talent`}
      />

      {/* Tier breakdown */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {data.map((tier) => (
          <div 
            key={tier.tier}
            className="flex items-center justify-between p-2 bg-muted/30 rounded text-[10px]"
          >
            <div className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: tierColors[tier.tier] }}
              />
              <span>{tier.tier}</span>
            </div>
            <div className="text-right">
              <span className="font-medium">{tier.count}</span>
              <span className="text-muted-foreground ml-1">
                ({((tier.count / totalTalent) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TalentTierDistribution;

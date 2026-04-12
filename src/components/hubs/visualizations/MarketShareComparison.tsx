import React from 'react';
import { SimpleBarChart } from '@/components/charts/SimpleBarChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { Building2, Trophy } from 'lucide-react';

interface StudioShare {
  name: string;
  share: number; // percentage
  isPlayer?: boolean;
}

interface MarketShareComparisonProps {
  studios: StudioShare[];
  className?: string;
}

export const MarketShareComparison: React.FC<MarketShareComparisonProps> = ({
  studios,
  className,
}) => {
  // Sort by share descending
  const sortedStudios = [...studios].sort((a, b) => b.share - a.share);
  const playerStudio = sortedStudios.find(s => s.isPlayer);
  const playerRank = sortedStudios.findIndex(s => s.isPlayer) + 1;

  const data = sortedStudios.map((s) => ({
    label: s.name,
    value: s.share,
    color: s.isPlayer ? '#3b82f6' : '#94a3b8',
  }));

  return (
    <Card className={cn('p-4', tokens.border.default, className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-sm">Market Share</h4>
          <p className={cn('text-[10px]', tokens.text.caption)}>
            Box office comparison
          </p>
        </div>
        {playerStudio && (
          <div className="flex items-center gap-1">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">
              #{playerRank}
            </span>
          </div>
        )}
      </div>

      <SimpleBarChart
        data={data}
        height={160}
        showGrid={false}
        valueFormatter={(v) => `${v}%`}
      />

      {/* Player indicator */}
      {playerStudio && (
        <div className="flex items-center gap-2 mt-3 p-2 bg-blue-500/10 rounded">
          <Building2 className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Your Studio</span>
          <span className="text-sm font-bold text-blue-500 ml-auto">
            {playerStudio.share.toFixed(1)}%
          </span>
        </div>
      )}
    </Card>
  );
};

export default MarketShareComparison;

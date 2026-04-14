import React from 'react';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import { selectMarketShareData } from '@/store/selectors';
import { Building2, Trophy } from 'lucide-react';

interface StudioShare {
  name: string;
  share: number; // percentage
  isPlayer?: boolean;
}

interface MarketShareComparisonProps {
  studios?: StudioShare[];
  className?: string;
}

export const MarketShareComparison: React.FC<MarketShareComparisonProps> = ({
  studios: externalStudios,
  className,
}) => {
  const gameState = useGameStore(s => s.gameState);
  const studios = externalStudios || selectMarketShareData(gameState);

  // Sort by share descending
  const sortedStudios = [...studios].sort((a, b) => b.share - a.share);
  const playerStudio = sortedStudios.find(s => s.isPlayer);
  const playerRank = sortedStudios.findIndex(s => s.isPlayer) + 1;

  const maxShare = Math.max(...studios.map(s => s.share));

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

      <div className="space-y-2">
        {studios.map((studio) => (
          <div key={studio.name} className="flex items-center gap-3">
            <div className="w-24 text-[11px] font-medium truncate">
              {studio.name}
              {studio.isPlayer && (
                <span className="ml-1 text-[9px] text-primary">(You)</span>
              )}
            </div>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  studio.isPlayer ? 'bg-primary' : 'bg-slate-600'
                )}
                style={{ width: `${(studio.share / maxShare) * 100}%` }}
              />
            </div>
            <div className="w-12 text-right text-[11px] font-medium">
              {studio.share.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

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

import React from 'react';
import { SimpleBarChart } from '@/components/charts/SimpleBarChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { Award, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/gameStore';
import { selectAwardsProbability } from '@/store/selectors';

interface AwardNomination {
  projectTitle: string;
  awardBody: string;
  category: string;
  probability: number; // 0-100
  trend: 'rising' | 'stable' | 'falling';
}

interface AwardsProbabilityChartProps {
  nominations?: AwardNomination[];
  className?: string;
}

export const AwardsProbabilityChart: React.FC<AwardsProbabilityChartProps> = ({
  nominations: externalNominations,
  className,
}) => {
  const gameState = useGameStore(s => s.gameState);
  const nominations = externalNominations || selectAwardsProbability(gameState);
  // Sort by probability descending
  const sortedNominations = [...nominations]
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 8); // Show top 8

  const data = sortedNominations.map((n) => ({
    label: n.projectTitle.length > 12 ? n.projectTitle.slice(0, 12) + '...' : n.projectTitle,
    value: n.probability,
    color: n.probability >= 70 ? '#10b981' :
           n.probability >= 40 ? '#f59e0b' : '#94a3b8',
  }));

  const highProbabilityCount = nominations.filter(n => n.probability >= 70).length;

  return (
    <Card className={cn('p-4', tokens.border.default, className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-sm">Awards Outlook</h4>
          <p className={cn('text-[10px]', tokens.text.caption)}>
            Win probability by nomination
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Award className="h-4 w-4 text-amber-500" />
          {highProbabilityCount > 0 && (
            <Badge className="text-[9px] bg-emerald-500/20 text-emerald-500">
              {highProbabilityCount} likely wins
            </Badge>
          )}
        </div>
      </div>

      <SimpleBarChart
        data={data}
        height={180}
        showGrid={false}
        valueFormatter={(v) => `${v}%`}
      />

      {/* Nomination details */}
      <div className="space-y-1 mt-3 max-h-32 overflow-y-auto">
        {sortedNominations.slice(0, 4).map((nom, idx) => (
          <div 
            key={idx}
            className="flex items-center justify-between text-[10px] p-1.5 bg-muted/30 rounded"
          >
            <div className="flex items-center gap-1">
              <Star className={cn(
                'h-3 w-3',
                nom.probability >= 70 ? 'text-amber-500' : 'text-muted-foreground'
              )} />
              <span className="truncate max-w-[100px]">{nom.projectTitle}</span>
            </div>
            <span className={cn(
              'font-medium',
              nom.probability >= 70 ? 'text-emerald-500' :
              nom.probability >= 40 ? 'text-amber-500' : 'text-muted-foreground'
            )}>
              {nom.awardBody}: {nom.probability}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AwardsProbabilityChart;

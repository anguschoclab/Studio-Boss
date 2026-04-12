import React from 'react';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { Smile, Frown, Meh } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { selectTalentSatisfaction } from '@/store/selectors';

interface TalentSatisfactionGaugeProps {
  overallScore?: number; // 0-100
  byCategory?: {
    category: string;
    score: number;
  }[];
  className?: string;
}

export const TalentSatisfactionGauge: React.FC<TalentSatisfactionGaugeProps> = ({
  overallScore: externalScore,
  byCategory: externalCategories,
  className,
}) => {
  const gameState = useGameStore(s => s.gameState);
  const { overallScore, byCategory } = externalScore !== undefined 
    ? { overallScore: externalScore, byCategory: externalCategories || [] }
    : selectTalentSatisfaction(gameState);
  const getIcon = () => {
    if (overallScore >= 70) return <Smile className="h-8 w-8 text-emerald-500" />;
    if (overallScore >= 40) return <Meh className="h-8 w-8 text-amber-500" />;
    return <Frown className="h-8 w-8 text-red-500" />;
  };

  const getStatus = () => {
    if (overallScore >= 70) return { label: 'Satisfied', color: '#10b981' };
    if (overallScore >= 40) return { label: 'Neutral', color: '#f59e0b' };
    return { label: 'At Risk', color: '#ef4444' };
  };

  const status = getStatus();

  return (
    <Card className={cn('p-4', tokens.border.default, className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-sm">Talent Satisfaction</h4>
          <p className={cn('text-[10px]', tokens.text.caption)}>
            Overall morale index
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getIcon()}
          <span 
            className="text-lg font-bold"
            style={{ color: status.color }}
          >
            {status.label}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <GaugeChart
          value={overallScore}
          size={160}
          strokeWidth={12}
          color={status.color}
          label="Score"
          valueFormatter={(v) => `${v}%`}
        />
      </div>

      {/* Category breakdown */}
      <div className="space-y-2 mt-4">
        {byCategory.map((cat) => (
          <div key={cat.category} className="flex items-center justify-between text-[10px]">
            <span className={tokens.text.caption}>{cat.category}</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full',
                    cat.score >= 70 ? 'bg-emerald-500' :
                    cat.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  )}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
              <span className="w-8 text-right">{cat.score}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TalentSatisfactionGauge;

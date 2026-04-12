import React from 'react';
import { RadarChart } from '@/components/charts/RadarChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { FileText, Star, TrendingUp } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { selectScriptQualityMetrics } from '@/store/selectors';

interface QualityMetric {
  metric: string;
  score: number;
  fullMark: number;
}

interface ScriptData {
  title: string;
  writer: string;
  overallScore: number;
  metrics: QualityMetric[];
  trend: 'improving' | 'stable' | 'declining';
}

interface ScriptQualityMetricsProps {
  script?: ScriptData;
  className?: string;
  projectId?: string;
}

export const ScriptQualityMetrics: React.FC<ScriptQualityMetricsProps> = ({
  script: externalScript,
  className,
  projectId,
}) => {
  const gameState = useGameStore(s => s.gameState);
  const selectorResult = projectId ? selectScriptQualityMetrics(gameState, projectId) : null;
  
  // Handle both ScriptData format and selector's array format
  const script = externalScript || (selectorResult ? {
    title: 'Script',
    writer: 'Unknown',
    overallScore: selectorResult.reduce((sum, m) => sum + m.value, 0) / selectorResult.length,
    metrics: selectorResult.map(m => ({ metric: m.metric, score: m.value, fullMark: 100 })),
    trend: 'stable' as const
  } : null);

  if (!script) {
    return (
      <Card className={cn('p-4', tokens.border.default, className)}>
        <div className="text-center text-muted-foreground text-sm">
          No script data available
        </div>
      </Card>
    );
  }

  const radarData = script.metrics.map(m => ({
    metric: m.metric,
    value: m.score,
    fullMark: m.fullMark,
  }));

  const getTrendIcon = () => {
    switch (script.trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <Star className="h-4 w-4 text-amber-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Card className={cn('p-4', tokens.border.default, className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-bold text-sm truncate max-w-[120px]">{script.title}</h4>
            <p className={cn('text-[10px]', tokens.text.caption)}>
              by {script.writer}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span 
            className="text-xl font-bold"
            style={{ color: getScoreColor(script.overallScore) }}
          >
            {script.overallScore}
          </span>
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
      </div>

      <RadarChart
        data={radarData}
        height={180}
        color={getScoreColor(script.overallScore)}
        showTooltip={true}
        valueFormatter={(v) => `${v}`}
      />

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
        <div className="flex items-center gap-1 text-[10px]">
          <span className={tokens.text.caption}>Quality trend:</span>
          <span className="capitalize">{script.trend}</span>
        </div>
        {getTrendIcon()}
      </div>
    </Card>
  );
};

export default ScriptQualityMetrics;

import React, { useMemo } from 'react';
import { StackedBarChart } from '@/components/charts/StackedBarChart';
import { Card } from '@/components/ui/card';
import { tokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { selectProjectTimelineData } from '@/store/selectors';

interface TimelineData {
  week: number;
  development: number;
  preProduction: number;
  production: number;
  postProduction: number;
  released: number;
}

interface ProjectTimelineProps {
  data?: TimelineData[];
  className?: string;
  weeks?: number;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  data: externalData,
  className,
  weeks = 12,
}) => {
  const gameState = useGameStore(s => s.gameState);
  const data = externalData || selectProjectTimelineData(gameState, weeks);
  const series = [
    { key: 'development', name: 'Development', color: '#94a3b8' },
    { key: 'preProduction', name: 'Pre-Production', color: '#3b82f6' },
    { key: 'production', name: 'Production', color: '#f59e0b' },
    { key: 'postProduction', name: 'Post-Production', color: '#8b5cf6' },
    { key: 'release', name: 'Release', color: '#10b981' },
  ];

  const totalProjects = data.reduce((sum, d) => 
    sum + d.development + d.preProduction + d.production + d.postProduction + d.released, 0
  );

  // Transform data to ensure string weeks for Recharts
  const chartData = useMemo(() => {
    return data.map(d => ({
      label: String(d.week),
      development: d.development,
      preProduction: d.preProduction,
      production: d.production,
      postProduction: d.postProduction,
      release: d.released,
    }));
  }, [data]);

  return (
    <Card className={cn('p-4', tokens.border.default, className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-sm">Project Pipeline</h4>
          <p className={cn('text-[10px]', tokens.text.caption)}>
            Projects by production phase
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{totalProjects} active</span>
        </div>
      </div>

      <StackedBarChart
        data={chartData}
        series={series}
        height={180}
        showGrid={false}
        showLegend={false}
        valueFormatter={(v) => `${v} proj`}
      />

      {/* Phase legend */}
      <div className="flex flex-wrap gap-2 mt-3">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-1 text-[9px]">
            <div 
              className="w-2 h-2 rounded-sm" 
              style={{ backgroundColor: s.color }}
            />
            <span>{s.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProjectTimeline;

import React, { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Project, ProjectStatus } from '@/engine/types';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/engine/utils';
import { DollarSign } from 'lucide-react';

interface TimelineItem {
  project: Project;
  startWeek: number;
  endWeek: number;
  lane: number;
}

interface PipelineTimelineProps {
  projects: Project[];
  weeksToShow?: number;
  className?: string;
}

const statusColors: Record<ProjectStatus, { bg: string; border: string; text: string }> = {
  development: { bg: 'bg-secondary/20', border: 'border-secondary/40', text: 'text-secondary' },
  needs_greenlight: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-500' },
  pitching: { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400' },
  production: { bg: 'bg-primary/20', border: 'border-primary/40', text: 'text-primary' },
  marketing: { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400' },
  released: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400' },
  post_release: { bg: 'bg-slate-500/20', border: 'border-slate-500/40', text: 'text-slate-400' },
  archived: { bg: 'bg-muted', border: 'border-muted', text: 'text-muted-foreground' },
  turnaround: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400' },
  pilot: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/40', text: 'text-cyan-400' },
  shopping: { bg: 'bg-pink-500/20', border: 'border-pink-500/40', text: 'text-pink-400' },
};

export const PipelineTimeline: React.FC<PipelineTimelineProps> = ({
  projects,
  weeksToShow = 24,
  className,
}) => {
  const gameState = useGameStore(s => s.gameState);
  const currentWeek = gameState?.week || 0;

  const { timelineItems, lanes } = useMemo(() => {
    // Filter active projects and sort by start time
    const activeProjects = projects.filter(p => 
      p.state !== 'archived' && p.state !== 'post_release'
    );

    // Calculate timeline positions
    const items: TimelineItem[] = [];
    const laneAssignments: Map<number, number> = new Map();

    activeProjects.forEach(project => {
      // Estimate start and end weeks
      let startWeek = currentWeek;
      let endWeek = currentWeek;

      if (project.state === 'development') {
        startWeek = currentWeek - project.weeksInPhase;
        endWeek = startWeek + project.developmentWeeks;
      } else if (project.state === 'production') {
        startWeek = currentWeek - project.weeksInPhase;
        endWeek = startWeek + project.productionWeeks;
      } else if (project.state === 'marketing') {
        endWeek = project.releaseWeek || (currentWeek + 4);
        startWeek = endWeek - 8;
      } else if (project.releaseWeek) {
        endWeek = project.releaseWeek;
        startWeek = endWeek - 4;
      }

      // Find available lane (simple layout algorithm)
      let lane = 0;
      while (laneAssignments.has(lane)) {
        const lastEnd = laneAssignments.get(lane) || 0;
        if (startWeek >= lastEnd) break;
        lane++;
      }
      laneAssignments.set(lane, endWeek);

      items.push({ project, startWeek, endWeek, lane });
    });

    return { 
      timelineItems: items, 
      lanes: Math.max(...items.map(i => i.lane), 0) + 1 
    };
  }, [projects, currentWeek]);

  const weekLabels = useMemo(() => {
    const labels: number[] = [];
    for (let i = 0; i < weeksToShow; i += 4) {
      labels.push(currentWeek + i);
    }
    return labels;
  }, [currentWeek, weeksToShow]);

  if (timelineItems.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-32 text-muted-foreground", className)}>
        <p className="text-sm">No active projects to display</p>
      </div>
    );
  }

  const laneHeight = 48;
  const headerHeight = 32;

  return (
    <div className={cn("w-full overflow-x-auto custom-scrollbar", className)}>
      <div 
        className="relative min-w-full"
        style={{ height: headerHeight + lanes * laneHeight + 16 }}
      >
        {/* Week grid lines */}
        {weekLabels.map((week, i) => {
          const left = (i / (weekLabels.length - 1)) * 100;
          return (
            <div
              key={week}
              className="absolute top-0 bottom-0 border-l border-border/30"
              style={{ left: `${left}%` }}
            >
              <span className="absolute -top-6 left-1 text-[10px] font-bold text-muted-foreground">
                W{week}
              </span>
            </div>
          );
        })}

        {/* Current week indicator */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-primary/50 z-10 pointer-events-none">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
        </div>

        {/* Lane backgrounds */}
        {Array.from({ length: lanes }).map((_, lane) => (
          <div
            key={lane}
            className={cn(
              "absolute left-0 right-0 border-b border-border/20",
              lane % 2 === 0 ? "bg-muted/10" : "bg-transparent"
            )}
            style={{ 
              top: headerHeight + lane * laneHeight, 
              height: laneHeight 
            }}
          />
        ))}

        {/* Project bars */}
        {timelineItems.map(({ project, startWeek, endWeek, lane }) => {
          const duration = endWeek - startWeek;
          const left = Math.max(0, ((startWeek - currentWeek) / weeksToShow) * 100);
          const width = Math.max(5, (duration / weeksToShow) * 100);
          const colors = statusColors[project.state];

          return (
            <div
              key={project.id}
              className={cn(
                "absolute rounded-md border px-2 py-1 overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 hover:z-10 hover:shadow-lg",
                colors.bg,
                colors.border,
                colors.text
              )}
              style={{
                left: `${left}%`,
                width: `${width}%`,
                top: headerHeight + lane * laneHeight + 4,
                height: laneHeight - 8,
              }}
              title={`${project.title}: ${project.state} (${startWeek}-${endWeek})`}
            >
              <div className="flex items-center justify-between h-full">
                <span className="text-xs font-bold truncate">{project.title}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <DollarSign className="w-3 h-3" />
                  <span className="text-[9px] font-mono hidden sm:inline">
                    {formatMoney(project.weeklyCost || 0)}/wk
                  </span>
                </div>
              </div>

              {/* Progress bar for development/production */}
              {(project.state === 'development' || project.state === 'production') && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                  <div
                    className="h-full bg-white/50"
                    style={{ 
                      width: `${Math.min(100, (project.weeksInPhase / (project.state === 'development' ? project.developmentWeeks : project.productionWeeks)) * 100)}%` 
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border/30">
        {Object.entries(statusColors).slice(0, 6).map(([status, colors]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={cn("w-3 h-3 rounded border", colors.bg, colors.border)} />
            <span className="text-[10px] font-bold uppercase text-muted-foreground">
              {status.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

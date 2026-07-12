import React, { useMemo } from "react";
import { useGameStore } from "@/store/gameStore";
import { Project, ProjectStatus } from "@/engine/types";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/engine/utils";
import { DollarSign } from "lucide-react";

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
  development: { bg: "bg-secondary/10", border: "border-secondary/30", text: "text-secondary" },
  needs_greenlight: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-500",
  },
  pitching: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
  production: { bg: "bg-primary/10", border: "border-primary/30", text: "text-primary" },
  marketing: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" },
  released: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  post_release: { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400" },
  archived: { bg: "bg-muted/10", border: "border-muted/20", text: "text-muted-foreground" },
  turnaround: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
  pilot: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400" },
  shopping: { bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-400" },
};

export const PipelineTimeline: React.FC<PipelineTimelineProps> = ({
  projects,
  weeksToShow = 24,
  className,
}) => {
  const gameState = useGameStore((s) => s.gameState);
  const currentWeek = gameState?.week || 0;

  const { timelineItems, lanes } = useMemo(() => {
    // Filter active projects and sort by start time
    const activeProjects = projects.filter(
      (p) => p.state !== "archived" && p.state !== "post_release"
    );

    // Calculate timeline positions
    const items: TimelineItem[] = [];
    const laneAssignments: Map<number, number> = new Map();

    activeProjects.forEach((project) => {
      // Estimate start and end weeks
      let startWeek = currentWeek;
      let endWeek = currentWeek;

      if (project.state === "development") {
        startWeek = currentWeek - project.weeksInPhase;
        endWeek = startWeek + project.developmentWeeks;
      } else if (project.state === "production") {
        startWeek = currentWeek - project.weeksInPhase;
        endWeek = startWeek + project.productionWeeks;
      } else if (project.state === "marketing") {
        endWeek = project.releaseWeek || currentWeek + 4;
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
      lanes: Math.max(...items.map((i) => i.lane), 0) + 1,
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
      <div
        className={cn(
          "flex items-center justify-center h-32 text-muted-foreground bg-white/[0.01] border border-white/5",
          className
        )}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.3em] italic opacity-20">
          NO ACTIVE VENTURES DETECTED
        </p>
      </div>
    );
  }

  const laneHeight = 56;
  const headerHeight = 40;

  return (
    <div
      className={cn(
        "w-full overflow-x-auto custom-scrollbar bg-white/[0.01] border border-white/5 p-6",
        className
      )}
    >
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
              className="absolute top-0 bottom-0 border-l border-white/5"
              style={{ left: `${left}%` }}
            >
              <span className="absolute -top-8 left-2 text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest font-display italic">
                W{week}
              </span>
            </div>
          );
        })}

        {/* Current week indicator */}
        <div className="absolute top-0 bottom-0 w-[1px] bg-primary/40 z-20 pointer-events-none shadow-[0_0_10px_rgba(var(--primary),0.2)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary shadow-2xl" />
        </div>

        {/* Lane backgrounds */}
        {Array.from({ length: lanes }).map((_, lane) => (
          <div
            key={lane}
            className={cn(
              "absolute left-0 right-0 border-b border-white/5",
              lane % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
            )}
            style={{
              top: headerHeight + lane * laneHeight,
              height: laneHeight,
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
                "absolute rounded-none border-l-2 px-3 py-2 overflow-hidden cursor-pointer transition-all duration-300 hover:bg-opacity-30 hover:z-10 group",
                colors.bg,
                colors.border.replace("border-", "border-l-"),
                colors.text,
                "hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]"
              )}
              style={{
                left: `${left}%`,
                width: `${width}%`,
                top: headerHeight + lane * laneHeight + 6,
                height: laneHeight - 12,
              }}
              title={`${project.title}: ${project.state} (${startWeek}-${endWeek})`}
            >
              <div className="flex items-center justify-between h-full relative z-10">
                <span className="text-[10px] font-display font-black uppercase italic tracking-tighter truncate leading-none group-hover:text-white transition-colors">
                  {project.title}
                </span>
                <div className="flex items-center gap-1.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                  <DollarSign className="w-2.5 h-2.5" />
                  <span className="text-[9px] font-display font-black italic">
                    {formatMoney(project.weeklyCost || 0)}
                  </span>
                </div>
              </div>

              {/* Progress bar for development/production */}
              {(project.state === "development" || project.state === "production") && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/40">
                  <div
                    className="h-full bg-current opacity-60"
                    style={{
                      width: `${Math.min(100, (project.weeksInPhase / (project.state === "development" ? project.developmentWeeks : project.productionWeeks)) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-white/5">
        {Object.entries(statusColors)
          .slice(0, 6)
          .map(([status, colors]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-none border", colors.bg, colors.border)} />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                {status.replace("_", " ")}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

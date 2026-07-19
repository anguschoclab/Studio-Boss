import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import { ProjectCard } from "./ProjectCard";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { useState } from "react";
import { Plus, ListFilter, Search, Clapperboard, Layers, Bookmark } from "lucide-react";
import { ProjectStatus } from "@/engine/types";
import { selectProjects } from "@/store/selectors";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";
import { EmptyState } from "@/components/shared/EmptyState";

const COLUMNS: { status: ProjectStatus[]; title: string; color: string; description: string }[] = [
  {
    status: ["development", "needs_greenlight"],
    title: "DEVELOPMENT",
    color: "bg-amber-400",
    description: "SCRIPTS & CONCEPT",
  },
  {
    status: ["pitching"],
    title: "PITCHING",
    color: "bg-primary",
    description: "DISTRIBUTION DEALS",
  },
  {
    status: ["production", "marketing"],
    title: "ACTIVE SLATE",
    color: "bg-emerald-400",
    description: "PRODUCTION & PR",
  },
  {
    status: ["released", "post_release", "archived"],
    title: "CATALOG",
    color: "bg-muted-foreground/20",
    description: "RELEASE & LEGACY",
  },
];

export const PipelineBoard = () => {
  const projects = useGameStore(useShallow((s) => selectProjects(s.gameState)));
  const { openCreateProject } = useUIStore();
  const isBookmarked = useGameStore((s) => s.isBookmarked);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  const visibleProjects = showBookmarksOnly
    ? projects.filter((p) => isBookmarked(p.id, "project"))
    : projects;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 h-full flex flex-col">
      {/* Executive Slate Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/[0.02] p-10 rounded-none border border-white/5 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-none blur-[120px] pointer-events-none -mr-48 -mt-48 opacity-40" />
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-20 h-20 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center shadow-[0_0_40px_rgba(var(--primary),0.15)]">
            <Layers className="h-10 w-10 text-primary" strokeWidth={1} aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h2 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              PRODUCTION SLATE
            </h2>
            <p className="text-[10px] font-black uppercase text-muted-foreground/20 tracking-[0.4em] flex items-center gap-4 italic">
              OPERATIONAL OVERVIEW
              <span className="w-1.5 h-1.5 bg-white/10" />
              <span className="text-foreground/40 font-display">
                {visibleProjects.length} TOTAL ASSETS
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="relative w-80 hidden lg:block group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/20 group-focus-within:text-primary transition-all duration-700"
              aria-hidden="true"
            />
            <Input
              className="h-12 pl-12 text-[10px] bg-black/40 border-white/5 focus-visible:border-primary/40 focus-visible:ring-0 transition-all font-black uppercase tracking-[0.3em] rounded-none italic"
              placeholder="SEARCH PROPERTY..."
              aria-label="Search properties"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Filter production slate"
            tooltip="Filter"
            className="h-12 w-12 rounded-none bg-white/5 border border-white/5 text-muted-foreground/40 hover:text-primary hover:border-primary/40 transition-all duration-700"
          >
            <ListFilter className="h-5 w-5" aria-hidden="true" />
          </Button>
          <TooltipWrapper tooltip="Filter by bookmarks" side="bottom">
            <button
              type="button"
              aria-pressed={showBookmarksOnly}
              aria-label="Show bookmarks only"
              onClick={() => setShowBookmarksOnly((v) => !v)}
              className={cn(
                "h-12 w-12 flex items-center justify-center border transition-all duration-700 rounded-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                showBookmarksOnly
                  ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                  : "bg-white/5 border-white/5 text-muted-foreground/40 hover:text-primary hover:border-primary/40"
              )}
            >
              <Bookmark className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </button>
          </TooltipWrapper>
          <Button
            onClick={openCreateProject}
            className="h-12 px-10 font-display font-black uppercase tracking-[0.3em] text-[10px] gap-4 bg-primary text-black hover:bg-white transition-all duration-700 rounded-none shadow-[0_0_30px_rgba(var(--primary),0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            <Plus className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
            NEW IP VENTURE
          </Button>
        </div>
      </div>

      {/* Production Lanes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 flex-1 min-h-0">
        {(() => {
          const projectsByStatus = new Map<ProjectStatus, typeof visibleProjects>();
          for (const project of visibleProjects) {
            const list = projectsByStatus.get(project.state);
            if (list) {
              list.push(project);
            } else {
              projectsByStatus.set(project.state, [project]);
            }
          }

          return COLUMNS.map((col) => {
            const colProjects = col.status.flatMap((status) => projectsByStatus.get(status) || []);
            return (
              <div key={col.title} className="flex flex-col h-full space-y-6 group/col">
                {/* Column Header */}
                <div className="flex items-center justify-between px-6 py-4 rounded-none bg-white/[0.02] border border-white/5 group-hover/col:bg-white/[0.04] group-hover/col:border-white/10 transition-all duration-700 relative overflow-hidden">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 w-2 opacity-40 transition-all duration-700 group-hover/col:opacity-80 group-hover/col:w-3",
                      col.color
                    )}
                  />
                  <div className="flex items-center gap-4 pl-4">
                    <div className="space-y-1">
                      <h3 className="text-[12px] font-display font-black uppercase tracking-[0.3em] text-foreground italic">
                        {col.title}
                      </h3>
                      <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] italic">
                        {col.description}
                      </p>
                    </div>
                  </div>
                  <div className="font-display text-[12px] font-black bg-black/60 border border-white/5 px-3 h-7 flex items-center justify-center rounded-none text-muted-foreground/60 shadow-inner italic">
                    {colProjects.length}
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-6 p-4 glass-card bg-black/40 border border-white/5 rounded-none overflow-y-auto custom-scrollbar min-h-[500px] shadow-2xl">
                  {colProjects.length === 0 ? (
                    <EmptyState
                      icon={Clapperboard}
                      title="LANE EMPTY"
                      message={`NO PROJECTS ARE CURRENTLY IN THE ${col.title.toUpperCase()} PHASE.`}
                      className="h-full py-24 bg-transparent border-none shadow-none backdrop-blur-none opacity-20"
                    />
                  ) : (
                    colProjects.map((project) => <ProjectCard key={project.id} project={project} />)
                  )}
                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
};

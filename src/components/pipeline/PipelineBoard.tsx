import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, ListFilter, Search, Clapperboard } from 'lucide-react';
import { ProjectStatus } from '@/engine/types';
import { selectProjects } from '@/store/selectors';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useShallow } from 'zustand/react/shallow';
import { EmptyState } from '@/components/shared/EmptyState';

const COLUMNS: { status: ProjectStatus[]; title: string; color: string; description: string }[] = [
  { status: ['development', 'needs_greenlight'], title: 'Development', color: 'bg-secondary', description: 'Scripts & Concept' },
  { status: ['pitching'], title: 'Pitching', color: 'bg-primary', description: 'Distribution Deals' },
  { status: ['production', 'marketing'], title: 'Active Slate', color: 'bg-success', description: 'Production & PR' },
  { status: ['released', 'post_release', 'archived'], title: 'Catalog', color: 'bg-muted-foreground/40', description: 'Release & Legacy' },
];

export const PipelineBoard = () => {
  const projects = useGameStore(useShallow(s => selectProjects(s.gameState)));
  const { openCreateProject } = useUIStore();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      {/* Executive Slate Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -mr-32 -mt-32" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl">
            <LayoutGrid className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-display font-black tracking-tighter uppercase italic leading-none mb-1.5">Production Slate</h2>
            <p className="text-[11px] font-black uppercase text-muted-foreground/40 tracking-[0.25em] flex items-center gap-3">
              Operational Overview 
              <span className="w-1.5 h-1.5 rounded-full bg-white/10" /> 
              <span className="text-foreground/60 font-display">{projects.length} Total Assets</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative w-64 hidden lg:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
            <Input className="h-10 pl-10 text-[10px] bg-black/40 border-white/5 focus-visible:border-primary/30 transition-all font-black uppercase tracking-widest" placeholder="Search Property..." />
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 text-muted-foreground/60 hover:text-foreground">
            <ListFilter className="h-4 w-4" />
          </Button>
          <Button onClick={openCreateProject} className="h-10 px-6 font-display font-black uppercase tracking-[0.2em] text-[10px] gap-3 bg-primary text-black hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/10">
            <Plus className="h-4 w-4" />
            New IP Venture
          </Button>
        </div>
      </div>

      {/* Production Lanes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 flex-1 min-h-0">
        {(() => {
          const projectsByStatus = new Map<ProjectStatus, typeof projects>();
          for (const project of projects) {
            const list = projectsByStatus.get(project.state);
            if (list) {
              list.push(project);
            } else {
              projectsByStatus.set(project.state, [project]);
            }
          }

          return COLUMNS.map(col => {
            const colProjects = col.status.flatMap(status => projectsByStatus.get(status) || []);
            return (
              <div key={col.title} className="flex flex-col h-full space-y-4 group/col">
                {/* Column Header */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 group-hover/col:bg-white/[0.05] transition-all relative overflow-hidden">
                  <div className={cn("absolute inset-y-0 left-0 w-1 opacity-60", col.color)} />
                  <div className="flex items-center gap-4 pl-2">
                    <div>
                      <h3 className="text-[12px] font-display font-black uppercase tracking-widest text-foreground/90">{col.title}</h3>
                      <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">{col.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-display text-[11px] font-black bg-black/40 border-white/5 px-2.5 h-6 text-muted-foreground/80">
                    {colProjects.length}
                  </Badge>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-4 p-2 glass-card bg-black/20 border-white/[0.03] overflow-y-auto custom-scrollbar min-h-[400px]">
                  {colProjects.length === 0 ? (
                    <EmptyState 
                      icon={Clapperboard} 
                      title="Lane Empty" 
                      message={`No projects are currently in the ${col.title.toLowerCase()} phase.`}
                      className="h-full py-16 bg-transparent border-none shadow-none backdrop-blur-none"
                    />
                  ) : (
                    colProjects.map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))
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

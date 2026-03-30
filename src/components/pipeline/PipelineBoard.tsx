import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, ListFilter, Search } from 'lucide-react';
import { ProjectStatus } from '@/engine/types';
import { selectProjects } from '@/store/selectors';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const COLUMNS: { status: ProjectStatus[]; title: string; color: string; description: string }[] = [
  { status: ['development', 'needs_greenlight'], title: 'Development', color: 'bg-secondary', description: 'Scripts & Concept' },
  { status: ['pitching'], title: 'Pitching', color: 'bg-amber-500', description: 'Distribution Deals' },
  { status: ['production', 'marketing'], title: 'Active Slate', color: 'bg-primary', description: 'Production & PR' },
  { status: ['released', 'post_release', 'archived'], title: 'Catalog', color: 'bg-success', description: 'Release & Legacy' },
];

export const PipelineBoard = () => {
  const projects = useGameStore(s => selectProjects(s.gameState));
  const { openCreateProject } = useUIStore();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      {/* Executive Slate Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <LayoutGrid className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase leading-none mb-1">Production Slate</h2>
            <p className="text-[11px] font-black uppercase text-muted-foreground/60 tracking-[0.2em]">Operational Overview • {projects.length} Total Assets</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-48 hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input aria-label="Filter properties" className="h-9 pl-9 text-[11px] bg-white/5 border-white/10" placeholder="Filter property..." />
          </div>
          <Button variant="outline" size="icon" aria-label="Filter pipeline" className="h-9 w-9 bg-white/5 border-white/10 text-muted-foreground hover:text-foreground">
            <ListFilter className="h-4 w-4" />
          </Button>
          <Button onClick={openCreateProject} className="h-9 px-5 font-display font-black uppercase tracking-widest text-[10px] gap-2 shadow-[0_0_20px_rgba(var(--primary),0.1)] hover:shadow-[0_0_25px_rgba(var(--primary),0.3)] transition-all">
            <Plus className="h-4 w-4" />
            New IP Venture
          </Button>
        </div>
      </div>

      {/* Production Lanes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {(() => {
          const projectsByStatus = new Map<ProjectStatus, typeof projects>();
          for (const project of projects) {
            const list = projectsByStatus.get(project.status);
            if (list) {
              list.push(project);
            } else {
              projectsByStatus.set(project.status, [project]);
            }
          }

          return COLUMNS.map(col => {
            const colProjects = col.status.flatMap(status => projectsByStatus.get(status) || []);
            return (
              <div key={col.title} className="flex flex-col h-full space-y-4 group/col">
                {/* Column Header */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-1.5 h-6 rounded-full", col.color)} />
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-foreground/90">{col.title}</h3>
                      <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">{col.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] bg-white/5 border-white/5 px-2">
                    {colProjects.length}
                  </Badge>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3 p-3 glass-card border-none overflow-y-auto custom-scrollbar min-h-[400px]">
                  {colProjects.length === 0 ? (
                    <div className="h-32 rounded-lg border border-dashed border-white/10 flex flex-col items-center justify-center opacity-40">
                      <p className="text-[10px] font-black uppercase tracking-widest">No Projects</p>
                    </div>
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

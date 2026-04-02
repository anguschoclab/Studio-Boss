import { useGameStore } from '@/store/gameStore';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '@/store/uiStore';
import { useMemo } from 'react';
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
  const projects = useGameStore(useShallow(s => selectProjects(s.gameState)));
  const { openCreateProject } = useUIStore();

  // Memoize project distribution to avoid recalculating on every re-render
  const projectsByStatus = useMemo(() => {
    const map = new Map<ProjectStatus, typeof projects>();
    for (const project of projects) {
      const list = map.get(project.state);
      if (list) {
        list.push(project);
      } else {
        map.set(project.state, [project]);
      }
    }
    return map;
  }, [projects]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      {/* Executive Slate Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white/5 to-transparent p-5 rounded-xl border border-white/5 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            <LayoutGrid className="h-6 w-6 text-primary drop-shadow-[0_0_5px_rgba(var(--primary),0.5)]" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase leading-none mb-1 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent drop-shadow-sm">Production Slate</h2>
            <p className="text-[11px] font-black uppercase text-muted-foreground/60 tracking-[0.2em]">Operational Overview • <span className="text-foreground/80">{projects.length} Total Assets</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="relative w-48 hidden lg:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input className="h-9 pl-9 text-[11px] bg-black/40 border-white/10 focus-visible:border-primary/50 focus-visible:ring-primary/20 transition-all font-mono" placeholder="Filter property..." />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 bg-black/40 border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 transition-all">
            <ListFilter className="h-4 w-4" />
          </Button>
          <Button onClick={openCreateProject} className="h-9 px-5 font-display font-black uppercase tracking-widest text-[10px] gap-2 bg-gradient-to-br from-primary to-primary/80 text-black hover:from-primary/90 hover:to-primary/70 shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] transition-all hover:-translate-y-0.5 border border-primary/50">
            <Plus className="h-4 w-4" />
            New IP Venture
          </Button>
        </div>
      </div>

      {/* Production Lanes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {COLUMNS.map(col => {
          const colProjects = col.status.flatMap(status => projectsByStatus.get(status) || []);
          return (
            <div key={col.title} className="flex flex-col h-full space-y-4 group/col">
                {/* Column Header */}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 group-hover/col:bg-white/[0.04] transition-colors relative overflow-hidden">
                  <div className={cn("absolute inset-y-0 left-0 w-1 opacity-50", col.color)} />
                  <div className="flex items-center gap-3 pl-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]", col.color.replace('bg-', 'text-'), col.color)} />
                    <div>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground/90">{col.title}</h3>
                      <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">{col.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] bg-black/40 border-white/10 px-2 py-0.5 text-muted-foreground group-hover/col:text-foreground transition-colors">
                    {colProjects.length}
                  </Badge>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3 p-3 glass-card bg-gradient-to-b from-white/[0.02] to-transparent border-none overflow-y-auto custom-scrollbar min-h-[400px]">
                  {colProjects.length === 0 ? (
                    <div className="h-32 rounded-xl border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center opacity-50 hover:opacity-100 transition-opacity group">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:bg-white/10 transition-colors">
                         <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground/70 transition-colors">No Projects</p>
                    </div>
                  ) : (
                  colProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

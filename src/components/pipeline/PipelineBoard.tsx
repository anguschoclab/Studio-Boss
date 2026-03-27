import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProjectStatus } from '@/engine/types';
import { selectProjects } from '@/store/selectors';

const COLUMNS: { status: ProjectStatus[]; title: string; color: string }[] = [
  { status: ['development', 'needs_greenlight'], title: 'Development', color: 'bg-secondary' },
  { status: ['pitching'], title: 'Pitching', color: 'bg-warning' },
  { status: ['production', 'marketing'], title: 'Production & Marketing', color: 'bg-primary' },
  { status: ['released', 'post_release', 'archived'], title: 'Released & Catalog', color: 'bg-success' },
];

export const PipelineBoard = () => {
  const projects = useGameStore(s => selectProjects(s.gameState));
  const { openCreateProject } = useUIStore();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between pb-3 border-b border-border/40 relative">
        <div className="absolute inset-x-0 -bottom-[1px] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <h2 className="font-display text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 tracking-tight drop-shadow-sm">Project Slate</h2>
        <Button onClick={openCreateProject} size="sm" className="h-9 px-4 font-display gap-2 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:-translate-y-0.5 transition-all duration-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
        {(() => {
          const projectsByStatus = new Map<ProjectStatus, typeof projects>();
          for (const project of projects) {
            const list = projectsByStatus.get(project.status) || [];
            list.push(project);
            projectsByStatus.set(project.status, list);
          }

          return COLUMNS.map(col => {
            const colProjects = col.status.flatMap(status => projectsByStatus.get(status) || []);
          return (
            <div key={col.title} className="flex flex-col space-y-3 bg-muted/10 p-3 rounded-2xl border border-border/50 backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-muted/20 transition-all duration-300 relative group/col">
              {/* Column Header */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-border/40 relative z-10 px-1 group-hover/col:border-primary/20 transition-colors">
                <div className={`w-2 h-2 rounded-full ${col.color} shadow-[0_0_8px_${col.color}]`} />
                <h3 className="font-display text-[12px] xl:text-[13px] font-bold text-foreground/70 group-hover/col:text-foreground transition-colors duration-300 uppercase tracking-widest flex-1">
                  {col.title}
                </h3>
                <span className="text-[11px] font-black text-foreground bg-background/60 border border-border/50 px-2.5 py-0.5 rounded-full shadow-inner ring-1 ring-inset ring-border/30 backdrop-blur-md">
                  {colProjects.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-3 min-h-[200px] content-start">
                {colProjects.length === 0 ? (
                  <div className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center flex items-center justify-center h-full min-h-[120px] bg-card/20 backdrop-blur-sm">
                    <p className="text-[13px] font-medium text-muted-foreground/60 uppercase tracking-widest">Empty</p>
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

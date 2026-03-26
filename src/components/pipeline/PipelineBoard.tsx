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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <h2 className="font-display text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 tracking-tight drop-shadow-sm">Project Slate</h2>
        <Button onClick={openCreateProject} size="sm" className="font-display gap-1.5 font-bold hover:scale-105 transition-all duration-300 active:scale-95 shadow-md hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
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
            <div key={col.title} className="space-y-3 bg-muted/5 p-3 rounded-xl border border-border/40 backdrop-blur-md shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 relative group/col">
              <div className="absolute inset-0 bg-gradient-to-b from-card/40 to-transparent opacity-0 group-hover/col:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none" />
              {/* Column Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-border/40 bg-card/60 p-2.5 rounded-t-lg backdrop-blur-md relative z-10 shadow-sm group-hover/col:border-primary/20 transition-colors">
                <div className={`w-2 h-2 rounded-full ${col.color} shadow-[0_0_8px_${col.color}] animate-pulse`} />
                <h3 className="font-display text-[13px] font-bold text-foreground/80 group-hover/col:text-foreground transition-colors uppercase tracking-widest drop-shadow-sm flex-1">
                  {col.title}
                </h3>
                <span className="text-[11px] font-black text-foreground bg-background/80 border border-border/50 px-2.5 py-0.5 rounded-full shadow-inner ring-1 ring-inset ring-border/50">
                  {colProjects.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-[200px]">
                {colProjects.length === 0 ? (
                  <div className="border border-dashed border-border rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground">No projects</p>
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

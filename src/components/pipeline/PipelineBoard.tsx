import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProjectStatus } from '@/engine/types';

const COLUMNS: { status: ProjectStatus[]; title: string; color: string }[] = [
  { status: ['development', 'needs_greenlight'], title: 'Development', color: 'bg-secondary' },
  { status: ['pitching'], title: 'Pitching', color: 'bg-warning' },
  { status: ['production', 'marketing'], title: 'Production & Marketing', color: 'bg-primary' },
  { status: ['released', 'post_release', 'archived'], title: 'Released & Catalog', color: 'bg-success' },
];

export const PipelineBoard = () => {
  const projects = useGameStore(s => s.gameState?.projects || []);
  const { openCreateProject } = useUIStore();

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 tracking-tight">Project Slate</h2>
        <Button onClick={openCreateProject} size="sm" className="font-display gap-1.5 font-bold hover:scale-105 transition-transform active:scale-95 shadow-sm hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]">
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
            <div key={col.title} className="space-y-3 bg-muted/5 p-3 rounded-xl border border-border/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
              {/* Column Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-border/40 bg-card/40 p-2 rounded-t-lg backdrop-blur-sm">
                <div className={`w-2 h-2 rounded-full ${col.color} shadow-[0_0_8px_${col.color}]`} />
                <h3 className="font-display text-[13px] font-bold text-muted-foreground uppercase tracking-wider">
                  {col.title}
                </h3>
                <span className="text-[11px] font-bold text-foreground bg-background border border-border/40 px-2 py-0.5 rounded-full shadow-sm">
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

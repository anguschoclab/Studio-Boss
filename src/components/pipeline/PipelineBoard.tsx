import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProjectStatus } from '@/engine/types';

const COLUMNS: { status: ProjectStatus[]; title: string; color: string }[] = [
  { status: ['development'], title: 'Development', color: 'bg-secondary' },
  { status: ['pitching'], title: 'Pitching', color: 'bg-warning' },
  { status: ['production'], title: 'Production', color: 'bg-primary' },
  { status: ['released', 'archived'], title: 'Released', color: 'bg-success' },
];

export const PipelineBoard = () => {
  const projects = useGameStore(s => s.gameState?.projects || []);
  const { openCreateProject } = useUIStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Project Slate</h2>
        <Button onClick={openCreateProject} size="sm" className="font-display gap-1.5">
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
            <div key={col.title} className="space-y-3">
              {/* Column Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {col.title}
                </h3>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
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

import { Project } from '@/engine/types';
import { useUIStore } from '@/store/uiStore';
import { formatMoney } from '@/engine/utils';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const { selectProject } = useUIStore();
  const tier = BUDGET_TIERS[project.budgetTier];

  const progressPct = project.status === 'development'
    ? (project.weeksInPhase / project.developmentWeeks) * 100
    : project.status === 'production'
    ? (project.weeksInPhase / project.productionWeeks) * 100
    : 100;

  return (
    <button
      onClick={() => selectProject(project.id)}
      className="w-full text-left p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors space-y-2"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-display font-semibold text-sm text-foreground leading-tight">{project.title}</h4>
        <Badge variant="outline" className="text-[10px] shrink-0">
          {project.format.toUpperCase()}
        </Badge>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{project.genre}</span>
        <span>·</span>
        <span>{tier.label}</span>
      </div>

      {/* Buzz Bar */}
      {project.status !== 'archived' && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Buzz</span>
            <span>{Math.round(project.buzz)}%</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-500"
              style={{ width: `${project.buzz}%` }}
            />
          </div>
        </div>
      )}

      {/* Progress */}
      {(project.status === 'development' || project.status === 'production') && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Progress</span>
            <span>
              {project.weeksInPhase}/{project.status === 'development' ? project.developmentWeeks : project.productionWeeks}w
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPct, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Revenue for released/archived */}
      {(project.status === 'released' || project.status === 'archived') && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Gross</span>
          <span className="text-success font-semibold">{formatMoney(project.revenue)}</span>
        </div>
      )}
    </button>
  );
};

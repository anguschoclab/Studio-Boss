import { Project } from '@/engine/types';
import { useUIStore } from '@/store/uiStore';
import { formatMoney } from '@/engine/utils';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const { selectProject, openPitchProject } = useUIStore();
  const tier = BUDGET_TIERS[project.budgetTier];

  const displayFormat = project.format === 'tv' && project.season
      ? `S${project.season}`
      : project.format.toUpperCase();

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
          {displayFormat}
        </Badge>
      </div>

      <div className="flex flex-col gap-1 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-2">
            <span>{project.genre}</span>
            <span>·</span>
            <span>{tier.label} Base</span>
        </div>
        {project.format === 'tv' && project.tvFormat && (
            <div className="flex items-center gap-1">
                <span>{TV_FORMATS[project.tvFormat].name} ({project.episodes} eps)</span>
            </div>
        )}
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

      {/* Pitch Button */}
      {project.status === 'needs_greenlight' && (
        <div className="pt-2">
           <Button
             variant="destructive"
             size="sm"
             className="w-full text-xs"
             onClick={(e) => {
               e.stopPropagation();
               selectProject(project.id);
             }}
           >
             Review Greenlight
           </Button>
        </div>
      )}

      {/* Pitch Button */}
      {project.status === 'pitching' && (
        <div className="pt-2">
           <Button
             variant="default"
             size="sm"
             className="w-full text-xs"
             onClick={(e) => {
               e.stopPropagation();
               openPitchProject(project.id);
             }}
           >
             Pitch to Network
           </Button>
        </div>
      )}

      {/* Revenue for released/archived */}
      {(project.status === 'released' || project.status === 'archived') && (
        <div className="flex flex-col gap-1 mt-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Gross</span>
              <span className="text-success font-semibold">{formatMoney(project.revenue)}</span>
            </div>
            {project.format === 'tv' && project.status === 'released' && project.episodesReleased !== undefined && (
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Released</span>
                  <span>{project.episodesReleased} / {project.episodes}</span>
                </div>
            )}
        </div>
      )}
    </button>
  );
};

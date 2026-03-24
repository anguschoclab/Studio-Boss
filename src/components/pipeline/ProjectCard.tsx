import { Project } from '@/engine/types';
import { useUIStore } from '@/store/uiStore';
import { formatMoney } from '@/engine/utils';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const { selectProject, openPitchProject, openCrisisModal } = useUIStore();
  const tier = BUDGET_TIERS[project.budgetTier];

  const displayFormat = project.format === 'tv' && project.season
      ? `S${project.season}`
      : project.format.toUpperCase();

  const hasUnresolvedCrisis = project.activeCrisis && !project.activeCrisis.resolved;
  const progressPct = project.status === 'development'
    ? (project.weeksInPhase / project.developmentWeeks) * 100
    : project.status === 'production'
    ? (project.weeksInPhase / project.productionWeeks) * 100
    : 100;

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectProject(project.id);
        }
      }}
      onClick={() => selectProject(project.id)}
      className="w-full text-left p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-md hover:shadow-xl hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 space-y-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group relative overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex items-start justify-between gap-2 relative z-10">
        <h4 className="font-display font-bold text-[15px] text-foreground leading-tight group-hover:text-primary transition-colors drop-shadow-sm">{project.title}</h4>
        <div className="flex gap-2">
          {hasUnresolvedCrisis && (
            <Badge variant="destructive" className="text-[10px] shrink-0 animate-pulse shadow-sm shadow-destructive/40">
              <AlertTriangle className="w-3 h-3 mr-1" /> Crisis
            </Badge>
          )}
          <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-bold shrink-0 bg-background/50 backdrop-blur-sm shadow-sm">
            {displayFormat}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-[11px] font-medium text-muted-foreground relative z-10">
        <div className="flex items-center gap-2">
            <span className="text-foreground/80">{project.genre}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-foreground/80">{tier.label} Base</span>
        </div>
        {project.format === 'tv' && project.tvFormat && (
            <div className="flex items-center gap-1">
                <span className="text-foreground/80">{TV_FORMATS[project.tvFormat].name} ({project.episodes} eps)</span>
            </div>
        )}
      </div>

      {/* Buzz Bar */}
      {project.status !== 'archived' && (
        <div className="space-y-1 relative z-10">
          <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            <span>Buzz</span>
            <span className="text-secondary">{Math.round(project.buzz)}%</span>
          </div>
          <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-secondary/80 to-secondary rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,161,22,0.4)]"
              style={{ width: `${project.buzz}%` }}
            />
          </div>
        </div>
      )}

      {/* Progress */}
      {(project.status === 'development' || project.status === 'production') && (
        <div className="space-y-1 relative z-10">
          <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            <span>Progress {hasUnresolvedCrisis && <span className="text-destructive font-bold ml-1">(HALTED)</span>}</span>
            <span className="text-foreground/80">
              {project.weeksInPhase}/{project.status === 'development' ? project.developmentWeeks : project.productionWeeks}w
            </span>
          </div>
          <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden border border-border/20 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${hasUnresolvedCrisis ? 'bg-gradient-to-r from-destructive to-destructive/80 shadow-[0_0_12px_rgba(239,68,68,0.6)]' : 'bg-gradient-to-r from-primary to-primary/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]'}`}
              style={{ width: `${Math.min(progressPct, 100)}%` }}
            />
          </div>
        </div>
      )}


      {/* Marketing Button */}
      {project.status === 'marketing' && (
        <div className="pt-2 relative z-10">
           <Button
             variant="secondary"
             size="sm"
             className="w-full text-xs"
             onClick={(e) => {
               e.stopPropagation();
               selectProject(project.id);
             }}
           >
             Plan Marketing
           </Button>
        </div>
      )}

      {/* Pitch Button */}
      {project.status === 'needs_greenlight' && (
        <div className="pt-2 relative z-10">
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

      {/* Crisis Button */}
      {hasUnresolvedCrisis && (
        <div className="pt-2 relative z-10">
           <Button
             variant="destructive"
             size="sm"
             className="w-full text-xs font-bold animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:scale-[1.02] transition-transform"
             onClick={(e) => {
               e.stopPropagation();
               openCrisisModal(project.id);
             }}
           >
             <AlertTriangle className="w-4 h-4 mr-2" />
             Resolve Crisis
           </Button>
        </div>
      )}

      {/* Pitch Button */}
      {project.status === 'pitching' && (
        <div className="pt-2 relative z-10">
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
    </div>
  );
};

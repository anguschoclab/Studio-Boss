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
      className="w-full text-left p-4 rounded-xl border border-border/60 bg-card/80 backdrop-blur-xl hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 ease-out space-y-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background group relative overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />

      <div className="flex items-start justify-between gap-2 relative z-10">
        <h4 className="font-display font-bold text-[15px] sm:text-[16px] text-foreground leading-tight group-hover:text-primary transition-colors duration-300 drop-shadow-sm line-clamp-2">{project.title}</h4>
        <div className="flex gap-1.5 flex-wrap justify-end shrink-0">
          {hasUnresolvedCrisis && (
            <Badge variant="destructive" className="text-[9px] uppercase tracking-widest font-black shrink-0 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.4)] border-destructive/40">
              <AlertTriangle className="w-3 h-3 mr-1" /> Crisis
            </Badge>
          )}
          <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-black shrink-0 bg-background/80 backdrop-blur-md shadow-sm border-border/40 group-hover:border-primary/30 transition-colors duration-300 text-muted-foreground group-hover:text-foreground">
            {displayFormat}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-[11px] font-medium text-muted-foreground relative z-10">
        <div className="flex items-center gap-1.5">
            <span className="text-foreground/80 font-semibold tracking-tight">{project.genre}</span>
            <span className="text-muted-foreground/30 font-black">·</span>
            <span className="text-foreground/80 font-semibold tracking-tight">{tier.label}</span>
        </div>
        {project.format === 'tv' && project.tvFormat && (
            <div className="flex items-center gap-1 mt-0.5">
                <span className="text-foreground/70 text-[10px] font-semibold bg-muted/30 px-1.5 py-0.5 rounded-sm border border-border/30 shadow-sm">{TV_FORMATS[project.tvFormat].name} ({project.episodes} eps)</span>
            </div>
        )}
      </div>

      {/* Buzz Bar */}
      {project.status !== 'archived' && (
        <div className="space-y-1.5 relative z-10 group/buzz pt-1">
          <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            <span className="group-hover/buzz:text-foreground transition-colors duration-300">Buzz</span>
            <span className="text-secondary font-mono drop-shadow-[0_0_4px_rgba(255,161,22,0.3)]">{Math.round(project.buzz)}%</span>
          </div>
          <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden shadow-inner ring-1 ring-inset ring-border/40">
            <div
              className="h-full bg-gradient-to-r from-secondary/70 to-secondary rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,161,22,0.5)]"
              style={{ width: `${project.buzz}%` }}
            />
          </div>
        </div>
      )}

      {/* Progress */}
      {(project.status === 'development' || project.status === 'production') && (
        <div className="space-y-1.5 relative z-10 group/progress pt-1">
          <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            <span className="group-hover/progress:text-foreground transition-colors duration-300">Progress {hasUnresolvedCrisis && <span className="text-destructive font-black ml-1 animate-pulse">(HALTED)</span>}</span>
            <span className="text-foreground/80 font-mono font-medium">
              {project.weeksInPhase}/{project.status === 'development' ? project.developmentWeeks : project.productionWeeks}w
            </span>
          </div>
          <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden shadow-inner ring-1 ring-inset ring-border/40">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${hasUnresolvedCrisis ? 'bg-gradient-to-r from-destructive to-destructive/90 shadow-[0_0_10px_rgba(239,68,68,0.6)]' : 'bg-gradient-to-r from-primary to-primary/90 shadow-[0_0_8px_rgba(234,179,8,0.4)]'}`}
              style={{ width: `${Math.min(progressPct, 100)}%` }}
            />
          </div>
        </div>
      )}


      {/* Marketing Button */}
      {project.status === 'marketing' && (
        <div className="pt-3 relative z-10">
           <Button
             variant="secondary"
             size="sm"
             className="w-full h-8 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest shadow-sm hover:shadow-[0_0_12px_rgba(255,161,22,0.25)] hover:-translate-y-0.5 transition-all duration-300 focus-visible:ring-offset-background bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 hover:border-secondary/40"
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
        <div className="pt-3 relative z-10">
           <Button
             variant="default"
             size="sm"
             className="w-full h-8 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest bg-gradient-to-r from-destructive/90 to-destructive hover:from-destructive hover:to-destructive text-destructive-foreground shadow-sm hover:shadow-[0_0_12px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 transition-all duration-300 focus-visible:ring-offset-background"
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
        <div className="pt-3 relative z-10">
           <Button
             variant="destructive"
             size="sm"
             className="w-full h-8 text-[10px] sm:text-[11px] font-black uppercase tracking-widest animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:scale-[1.02] transition-transform duration-300 focus-visible:ring-offset-background border border-destructive-foreground/20"
             onClick={(e) => {
               e.stopPropagation();
               openCrisisModal(project.id);
             }}
           >
             <AlertTriangle className="w-3.5 h-3.5 mr-2" />
             Resolve Crisis
           </Button>
        </div>
      )}

      {/* Pitch Button */}
      {project.status === 'pitching' && (
        <div className="pt-3 relative z-10">
           <Button
             variant="default"
             size="sm"
             className="w-full h-8 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest shadow-sm hover:shadow-[0_0_12px_rgba(234,179,8,0.25)] hover:-translate-y-0.5 transition-all duration-300 focus-visible:ring-offset-background bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary text-primary-foreground"
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
        <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-border/40 relative z-10 group/revenue">
            <div className="flex justify-between text-xs items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover/revenue:text-foreground transition-colors duration-300">Gross</span>
              <span className="text-success font-black drop-shadow-[0_0_4px_rgba(34,197,94,0.2)] tracking-tight">{formatMoney(project.revenue)}</span>
            </div>
            {project.format === 'tv' && project.status === 'released' && project.episodesReleased !== undefined && (
                <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                  <span className="uppercase tracking-widest">Released</span>
                  <span className="font-mono text-foreground/80 font-bold">{project.episodesReleased} / {project.episodes}</span>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

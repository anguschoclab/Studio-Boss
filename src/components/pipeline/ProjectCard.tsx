import { Project } from '@/engine/types';
import { useUIStore } from '@/store/uiStore';
import { formatMoney } from '@/engine/utils';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { TV_FORMATS } from '@/engine/data/tvFormats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, DollarSign, Activity, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      onClick={() => selectProject(project.id)}
      className="w-full text-left p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-primary/40 transition-all duration-300 space-y-4 group relative overflow-hidden cursor-pointer shadow-xl"
    >
      {/* Visual Accent */}
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full opacity-40 transition-all group-hover:w-1.5",
        hasUnresolvedCrisis ? "bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-primary shadow-[0_0_15px_rgba(234,179,8,0.5)]"
      )} />

      {/* Header: Title & Format */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-display font-black text-sm text-foreground/90 uppercase tracking-tight truncate group-hover:text-primary transition-colors">{project.title}</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{project.genre}</span>
            <span className="text-[10px] text-muted-foreground/40">•</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{tier.label}</span>
          </div>
        </div>
        <Badge variant="outline" className="text-[9px] uppercase tracking-[0.15em] font-black h-5 bg-black/20 border-white/10 text-muted-foreground">
          {displayFormat}
        </Badge>
      </div>

      {/* Metrics: Buzz & Progress */}
      <div className="space-y-3">
        {/* Buzz Indicator */}
        {project.status !== 'archived' && (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
              <span className="flex items-center gap-1"><TrendingUp className="h-2.5 w-2.5" /> Market Buzz</span>
              <span className="text-secondary text-glow">{Math.round(project.buzz)}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-secondary rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(var(--secondary),0.4)]"
                style={{ width: `${project.buzz}%` }}
              />
            </div>
          </div>
        )}

        {/* Phase Progress */}
        {(project.status === 'development' || project.status === 'production') && (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
              <span className="flex items-center gap-1"><Activity className="h-2.5 w-2.5" /> {project.status}</span>
              <span className="font-mono">{project.weeksInPhase}/{project.status === 'development' ? project.developmentWeeks : project.productionWeeks}w</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(var(--primary),0.4)]",
                  hasUnresolvedCrisis ? "bg-destructive" : "bg-primary"
                )}
                style={{ width: `${Math.min(progressPct, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Financial Highlights */}
        {(project.status === 'released' || project.status === 'archived') && (
          <div className="flex items-center justify-between p-2 bg-black/20 rounded border border-white/5">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-2.5 w-2.5" /> Lifetime
            </span>
            <span className="text-xs font-mono font-bold text-success text-glow">{formatMoney(project.revenue)}</span>
          </div>
        )}
      </div>

      {/* Executive Actions Zone */}
      <div className="pt-2 flex flex-col gap-2">
        {hasUnresolvedCrisis && (
          <Button
            variant="destructive"
            size="sm"
            className="w-full h-8 text-[9px] font-black uppercase tracking-widest animate-pulse border border-white/10"
            onClick={(e) => {
              e.stopPropagation();
              openCrisisModal(project.id);
            }}
          >
            <AlertTriangle className="w-3 h-3 mr-2" />
            Neutralize Crisis
          </Button>
        )}

        {project.status === 'needs_greenlight' && (
          <Button
            variant="default"
            size="sm"
            className="w-full h-8 text-[9px] font-black uppercase tracking-widest bg-primary text-black hover:bg-primary/90"
            onClick={(e) => {
              e.stopPropagation();
              selectProject(project.id);
            }}
          >
            <Zap className="w-3 h-3 mr-2" />
            Executive Review
          </Button>
        )}

        {project.status === 'pitching' && (
          <Button
            size="sm"
            className="w-full h-8 text-[9px] font-black uppercase tracking-widest bg-secondary text-white hover:bg-secondary/90 shadow-[0_0_15px_rgba(var(--secondary),0.2)]"
            onClick={(e) => {
              e.stopPropagation();
              openPitchProject(project.id);
            }}
          >
            Pitch Pipeline
          </Button>
        )}
      </div>
    </div>
  );
};

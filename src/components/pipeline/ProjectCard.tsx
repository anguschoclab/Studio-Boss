import { Project } from '@/engine/types';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { BUDGET_TIERS } from '@/engine/data/budgetTiers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { AlertTriangle, TrendingUp, Activity, Zap, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/engine/utils';
import { DistributionBadge } from '../shared/DistributionBadge';
import { RecoupmentStatus } from '../shared/RecoupmentStatus';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const { selectProject, openPitchProject, openCrisisModal } = useUIStore();
  const gameState = useGameStore(s => s.gameState);
  const tier = BUDGET_TIERS[project.budgetTier];
  
  // Find buyer name for distribution badge
  const buyer = project.buyerId && gameState
    ? gameState.market.buyers.find(b => b.id === project.buyerId)
    : null;
  
  // Estimate weekly streaming revenue (passive revenue from deal)
  const weeklyRevenueForecast = project.distributionStatus === 'streaming' && project.buyerId
    ? Math.floor(project.budget * 0.02) // ~2% of budget per week from streaming deal
    : project.distributionStatus === 'theatrical'
    ? Math.floor(project.budget * 0.03)
    : 0;

  const displayFormat = project.type === 'SERIES'
      ? `S${(project as any).tvDetails?.currentSeason || 1}`
      : project.format.toUpperCase();

  const hasUnresolvedCrisis = project.activeCrisis && !project.activeCrisis.resolved;
  const progressPct = project.state === 'development'
    ? (project.weeksInPhase / project.developmentWeeks) * 100
    : project.state === 'production'
    ? (project.weeksInPhase / project.productionWeeks) * 100
    : 100;

  return (
    <TooltipWrapper tooltip="View Project Management Deck" side="right">
      <div
        role="button"
        tabIndex={0}
        onClick={() => selectProject(project.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectProject(project.id);
          }
        }}
        aria-label={`View details for ${project.title}`}
        data-testid={`project-card-${project.id}`}
        className="w-full text-left p-4 rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-md hover:bg-white/[0.08] hover:border-primary/30 transition-all duration-500 space-y-4 group relative overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1"
      >
        {/* Visual Accent */}
        <div className={cn(
          "absolute top-0 left-0 w-1 h-full opacity-60 transition-all duration-500 group-hover:w-1.5",
          hasUnresolvedCrisis ? "bg-destructive shadow-[0_0_20px_rgba(239,68,68,0.8)]" : "bg-primary shadow-[0_0_20px_rgba(234,179,8,0.8)]"
        )} />

        {/* Header: Title & Format */}
        <div className="flex items-start justify-between gap-2 relative z-10">
          <div className="min-w-0">
            <h4 className="font-display font-black text-sm text-foreground/90 uppercase tracking-tight truncate group-hover:text-primary transition-colors drop-shadow-sm">{project.title}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.2em] group-hover:text-muted-foreground transition-colors">{project.genre}</span>
              <span className="text-[10px] text-muted-foreground/30">•</span>
              <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.2em] group-hover:text-muted-foreground transition-colors">{tier.label}</span>
            </div>
          </div>
          <Badge variant="outline" className="text-[9px] uppercase tracking-[0.2em] font-black h-5 bg-black/40 border-white/10 text-muted-foreground group-hover:border-white/20 group-hover:text-foreground/80 transition-colors shadow-sm">
            {displayFormat}
          </Badge>
          <DistributionBadge status={project.distributionStatus} className="h-5" />
        </div>

        {/* Metrics: Buzz & Progress */}
        <div className="space-y-3 relative z-10">
          {/* Buzz Indicator */}
          {project.state !== 'archived' && (
            <TooltipWrapper tooltip="Market anticipation and social sentiment for this title." side="top">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 group-hover:text-muted-foreground/80 transition-colors">
                  <span className="flex items-center gap-1"><TrendingUp className="h-2.5 w-2.5 group-hover:text-secondary transition-colors" /> Market Buzz</span>
                  <span className="text-secondary drop-shadow-[0_0_8px_rgba(var(--secondary),0.6)] font-mono">{Math.round(project.buzz)}%</span>
                </div>
                <div className="h-1 bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-secondary rounded-full transition-all duration-1000 relative"
                    style={{ width: `${project.buzz}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30" />
                  </div>
                </div>
              </div>
            </TooltipWrapper>
          )}

          {/* Phase Progress */}
          {(project.state === 'development' || project.state === 'production') && (
            <TooltipWrapper tooltip={`Current Phase: ${project.state.toUpperCase()}. Progress tracks estimated time to completion.`} side="top">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 group-hover:text-muted-foreground/80 transition-colors">
                  <span className="flex items-center gap-1"><Activity className={cn("h-2.5 w-2.5 transition-colors", hasUnresolvedCrisis ? "group-hover:text-destructive" : "group-hover:text-primary")} /> {project.state.replace('_', ' ')}</span>
                  <span className="font-mono">{project.weeksInPhase}/{project.state === 'development' ? project.developmentWeeks : project.productionWeeks}w</span>
                </div>
                <div className="h-1 bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 relative",
                      hasUnresolvedCrisis ? "bg-destructive" : "bg-primary"
                    )}
                    style={{ width: `${Math.min(progressPct, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                  </div>
                </div>
              </div>
            </TooltipWrapper>
          )}

          {/* Distribution Deal Info */}
          {project.distributionStatus && buyer && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <DistributionBadge status={project.distributionStatus} className="h-5" />
                  <span className="text-[9px] font-bold text-muted-foreground/60 truncate max-w-[100px]">{buyer.name}</span>
                </div>
                {weeklyRevenueForecast > 0 && (
                  <TooltipWrapper tooltip={`Projected weekly revenue from ${buyer.name} distribution deal`} side="top">
                    <div className="flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 cursor-help">
                      <DollarSign className="w-2.5 h-2.5 text-emerald-400" />
                      <span className="text-[9px] font-black text-emerald-400">{formatMoney(weeklyRevenueForecast)}/wk</span>
                    </div>
                  </TooltipWrapper>
                )}
              </div>
            </div>
          )}

          {/* Financial Highlights & Recoupment */}
          {(project.state === 'released' || project.state === 'archived') && (
            <RecoupmentStatus project={project} className="p-2.5 bg-black/30 rounded-xl border border-white/5" />
          )}
        </div>

        {/* Executive Actions Zone */}
        <div className="pt-3 flex flex-col gap-2 relative z-10 border-t border-white/5 mt-2">
          {hasUnresolvedCrisis && (
            <Button
              variant="destructive"
              size="sm"
              tooltip="Deploy legal and PR teams to mitigate brand damage"
              className="w-full h-8 text-[9px] font-black uppercase tracking-widest animate-pulse border border-white/20 bg-destructive/90 hover:bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-all"
              onClick={(e) => {
                e.stopPropagation();
                openCrisisModal(project.id);
              }}
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-2 drop-shadow-sm" />
              Neutralize Crisis
            </Button>
          )}

          {project.state === 'needs_greenlight' && (
            <Button
              variant="default"
              size="sm"
              tooltip="Review final development packet for production greenlight"
              className="w-full h-8 text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-primary to-primary/90 text-black hover:from-primary/90 hover:to-primary/80 shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_20px_rgba(var(--primary),0.5)] transition-all border border-primary/50"
              onClick={(e) => {
                e.stopPropagation();
                selectProject(project.id);
              }}
            >
              <Zap className="w-3.5 h-3.5 mr-2" />
              Executive Review
            </Button>
          )}

          {project.state === 'pitching' && (
            <Button
              size="sm"
              tooltip="Present project to distributors and streaming platforms"
              className="w-full h-8 text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-secondary to-secondary/90 text-white hover:from-secondary/90 hover:to-secondary/80 shadow-[0_0_15px_rgba(var(--secondary),0.3)] hover:shadow-[0_0_20px_rgba(var(--secondary),0.5)] transition-all border border-secondary/50"
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
    </TooltipWrapper>
  );
};

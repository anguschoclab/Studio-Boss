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
    <TooltipWrapper tooltip="VIEW STRATEGIC DOSSIER" side="right">
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
        className="w-full text-left p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md hover:bg-white/[0.03] hover:border-primary/30 transition-all duration-700 space-y-6 group relative overflow-hidden cursor-pointer shadow-2xl"
      >
        {/* Visual Accent */}
        <div className={cn(
          "absolute top-0 left-0 w-1 h-full opacity-40 transition-all duration-500 group-hover:w-1.5 group-hover:opacity-100",
          hasUnresolvedCrisis ? "bg-destructive shadow-[0_0_20px_rgba(var(--destructive),0.4)]" : "bg-primary shadow-[0_0_20px_rgba(var(--primary),0.4)]"
        )} />

        {/* Header: Title & Format */}
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="min-w-0">
            <h4 className="font-display font-black text-base text-foreground/90 uppercase tracking-tighter italic truncate group-hover:text-primary transition-colors leading-none">{project.title}</h4>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.25em] group-hover:text-muted-foreground/60 transition-colors">{project.genre}</span>
              <span className="text-[10px] text-muted-foreground/20">•</span>
              <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.25em] group-hover:text-muted-foreground/60 transition-colors">{tier.label}</span>
            </div>
          </div>
          <Badge variant="outline" className="text-[9px] uppercase tracking-[0.2em] font-black h-5 rounded-none bg-white/5 border-white/10 text-muted-foreground group-hover:border-white/20 group-hover:text-foreground/80 transition-colors">
            {displayFormat}
          </Badge>
        </div>

        {/* Metrics: Buzz & Progress */}
        <div className="space-y-4 relative z-10">
          {/* Buzz Indicator */}
          {project.state !== 'archived' && (
            <TooltipWrapper tooltip="MARKET ANTICIPATION INDEX" side="top">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
                  <span className="flex items-center gap-2"><TrendingUp className="h-3 w-3 group-hover:text-secondary transition-colors" /> MARKET BUZZ</span>
                  <span className="text-secondary font-display font-black italic tracking-tighter drop-shadow-[0_0_8px_rgba(var(--secondary),0.3)]">{Math.round(project.buzz)}%</span>
                </div>
                <div className="h-1.5 bg-black/60 rounded-none overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-secondary transition-all duration-1000 relative"
                    style={{ width: `${project.buzz}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                  </div>
                </div>
              </div>
            </TooltipWrapper>
          )}

          {/* Phase Progress */}
          {(project.state === 'development' || project.state === 'production') && (
            <TooltipWrapper tooltip={`CURRENT PHASE: ${project.state.toUpperCase()}`} side="top">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
                  <span className="flex items-center gap-2"><Activity className={cn("h-3 w-3 transition-colors", hasUnresolvedCrisis ? "group-hover:text-destructive" : "group-hover:text-primary")} /> {project.state.replace('_', ' ')}</span>
                  <span className="font-display font-black italic tracking-tighter">{project.weeksInPhase}/{project.state === 'development' ? project.developmentWeeks : project.productionWeeks}W</span>
                </div>
                <div className="h-1.5 bg-black/60 rounded-none overflow-hidden border border-white/5">
                  <div
                    className={cn(
                      "h-full transition-all duration-1000 relative",
                      hasUnresolvedCrisis ? "bg-destructive shadow-[0_0_15px_rgba(var(--destructive),0.3)]" : "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
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
            <div className="space-y-2">
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-3">
                  <DistributionBadge status={project.distributionStatus} className="h-6 rounded-none font-display italic" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 truncate max-w-[120px]">{buyer.name}</span>
                </div>
                {weeklyRevenueForecast > 0 && (
                  <TooltipWrapper tooltip="PROJECTED WEEKLY FISCAL FLOW" side="top">
                    <div className="flex items-center gap-2 bg-emerald-500/10 px-2 py-1 border border-emerald-500/20">
                      <DollarSign className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] font-display font-black italic text-emerald-400">{formatMoney(weeklyRevenueForecast)}/WK</span>
                    </div>
                  </TooltipWrapper>
                )}
              </div>
            </div>
          )}

          {/* Financial Highlights & Recoupment */}
          {(project.state === 'released' || project.state === 'archived') && (
            <RecoupmentStatus project={project} className="p-4 bg-black/40 rounded-none border border-white/5 font-display" />
          )}
        </div>

        {/* Executive Actions Zone */}
        <div className="pt-4 flex flex-col gap-3 relative z-10 border-t border-white/5 mt-2">
          {hasUnresolvedCrisis && (
            <Button
              variant="destructive"
              size="sm"
              className="w-full h-10 text-[10px] font-black uppercase tracking-[0.25em] animate-pulse border border-destructive/50 bg-destructive/20 hover:bg-destructive text-destructive hover:text-white transition-all rounded-none"
              onClick={(e) => {
                e.stopPropagation();
                openCrisisModal(project.id);
              }}
            >
              <AlertTriangle className="w-4 h-4 mr-3" />
              NEUTRALIZE CRISIS
            </Button>
          )}

          {project.state === 'needs_greenlight' && (
            <Button
              variant="default"
              size="sm"
              className="w-full h-10 text-[10px] font-black uppercase tracking-[0.25em] bg-primary text-black hover:bg-primary/80 transition-all rounded-none"
              onClick={(e) => {
                e.stopPropagation();
                selectProject(project.id);
              }}
            >
              <Zap className="w-4 h-4 mr-3" />
              EXECUTIVE GREENLIGHT
            </Button>
          )}

          {project.state === 'pitching' && (
            <Button
              size="sm"
              className="w-full h-10 text-[10px] font-black uppercase tracking-[0.25em] bg-secondary text-white hover:bg-secondary/80 transition-all rounded-none"
              onClick={(e) => {
                e.stopPropagation();
                openPitchProject(project.id);
              }}
            >
              PITCH PIPELINE
            </Button>
          )}
        </div>
      </div>
    </TooltipWrapper>
  );
};

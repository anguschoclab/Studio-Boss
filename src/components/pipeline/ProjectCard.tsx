import { Project } from "@/engine/types";
import { useUIStore } from "@/store/uiStore";
import { useGameStore } from "@/store/gameStore";
import { BUDGET_TIERS } from "@/engine/data/budgetTiers";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import {
  AlertTriangle,
  Activity,
  Zap,
  DollarSign,
  Target,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/engine/utils";
import { DistributionBadge } from "../shared/DistributionBadge";
import { RecoupmentStatus } from "../shared/RecoupmentStatus";

/**
 * Props for the ProjectCard component.
 */
interface ProjectCardProps {
  /** The project entity to display. */
  project: Project;
}

/**
 * A highly stylized card component for the studio production pipeline.
 * Displays project title, genre, budget tier, market buzz, and current production phase progress.
 * Includes executive action buttons for greenlighting projects, pitching, or resolving crises.
 *
 * @param props - Component properties
 */
export const ProjectCard = ({ project }: ProjectCardProps) => {
  const { selectProject, openPitchProject, openCrisisModal } = useUIStore();
  const gameState = useGameStore((s) => s.gameState);
  const toggleBookmark = useGameStore((s) => s.toggleBookmark);
  const isBookmarked = useGameStore((s) => s.isBookmarked);
  const tier = BUDGET_TIERS[project.budgetTier];

  // Find buyer name for distribution badge
  const buyer =
    project.buyerId && gameState
      ? gameState.market.buyers.find((b) => b.id === project.buyerId)
      : null;

  // Estimate weekly streaming revenue (passive revenue from deal)
  const weeklyRevenueForecast =
    project.distributionStatus === "streaming" && project.buyerId
      ? Math.floor(project.budget * 0.02) // ~2% of budget per week from streaming deal
      : project.distributionStatus === "theatrical"
        ? Math.floor(project.budget * 0.03)
        : 0;

  const displayFormat =
    project.type === "SERIES" && "tvDetails" in project
      ? `S${project.tvDetails?.currentSeason || 1}`
      : project.format.toUpperCase();

  const hasUnresolvedCrisis = project.activeCrisis && !project.activeCrisis.resolved;
  const progressPct =
    project.state === "development"
      ? (project.weeksInPhase / project.developmentWeeks) * 100
      : project.state === "production"
        ? (project.weeksInPhase / project.productionWeeks) * 100
        : 100;

  return (
    <TooltipWrapper tooltip="VIEW STRATEGIC DOSSIER" side="right">
      <div
        role="button"
        tabIndex={0}
        onClick={() => selectProject(project.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectProject(project.id);
          }
        }}
        aria-label={`View details for ${project.title}`}
        data-testid={`project-card-${project.id}`}
        className="w-full text-left p-8 rounded-none border border-white/5 bg-white/[0.01] backdrop-blur-3xl hover:bg-white/[0.04] hover:border-primary/40 transition-all duration-700 space-y-8 group relative overflow-hidden cursor-pointer shadow-2xl focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary focus-visible:outline-none focus-visible:transition-none"
      >
        {/* Visual Accent */}
        <div
          className={cn(
            "absolute top-0 left-0 w-1.5 h-full opacity-40 transition-all duration-700 group-hover:w-2 group-hover:opacity-100 shadow-[0_0_20px_rgba(255,255,255,0.1)]",
            hasUnresolvedCrisis
              ? "bg-red-400 shadow-[0_0_30px_rgba(244,63,94,0.4)]"
              : "bg-primary shadow-[0_0_30px_rgba(var(--primary),0.4)]"
          )}
        />

        {/* Header: Title & Format */}
        <div className="flex items-start justify-between gap-6 relative z-10">
          <div className="min-w-0 space-y-2">
            <h4 className="font-display font-black text-xl text-foreground/90 uppercase tracking-tighter italic truncate group-hover:text-primary transition-all duration-700 leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">
              {project.title}
            </h4>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] group-hover:text-muted-foreground/60 transition-all duration-700 italic">
                {project.genre.toUpperCase()}
              </span>
              <span className="text-[10px] text-muted-foreground/10">•</span>
              <span className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] group-hover:text-muted-foreground/60 transition-all duration-700 italic">
                {tier.label.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={isBookmarked(project.id, "project") ? "Remove bookmark" : "Add bookmark"}
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(project.id, "project");
              }}
              className={cn(
                "h-8 w-8 flex items-center justify-center border transition-all duration-700 rounded-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                isBookmarked(project.id, "project")
                  ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                  : "bg-white/5 border-white/10 text-muted-foreground/40 hover:text-primary hover:border-primary/40"
              )}
            >
              {isBookmarked(project.id, "project") ? (
                <BookmarkCheck className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
              ) : (
                <Bookmark className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              )}
            </button>
            <div className="px-3 py-1 bg-white/5 border border-white/10 text-[9px] uppercase tracking-[0.3em] font-black h-fit rounded-none text-muted-foreground/60 group-hover:border-white/30 group-hover:text-foreground transition-all duration-700 italic">
              {displayFormat}
            </div>
          </div>
        </div>

        {/* Metrics: Buzz & Progress */}
        <div className="space-y-6 relative z-10">
          {/* Buzz Indicator */}
          {project.state !== "archived" && (
            <TooltipWrapper tooltip="MARKET ANTICIPATION INDEX" side="top">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-all duration-700 italic">
                  <span className="flex items-center gap-2">
                    <Target
                      className="h-3 w-3 group-hover:text-amber-400 transition-colors"
                      strokeWidth={3}
                    />{" "}
                    MARKET BUZZ
                  </span>
                  <span className="text-amber-400 font-display font-black italic tracking-tighter text-sm drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                    {Math.round(project.buzz)}%
                  </span>
                </div>
                <div className="h-2 bg-black/60 rounded-none overflow-hidden border border-white/5 p-[1px]">
                  <div
                    className="h-full bg-amber-400 transition-all duration-1000 relative"
                    style={{ width: `${project.buzz}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse" />
                  </div>
                </div>
              </div>
            </TooltipWrapper>
          )}

          {/* Awareness Indicator (marketing phase only) */}
          {project.state === "marketing" && (
            <TooltipWrapper
              tooltip="ACCUMULATED MARKET AWARENESS — built weekly from campaign spend (share-of-voice adjusted)"
              side="top"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-all duration-700 italic">
                  <span className="flex items-center gap-2">
                    <Zap
                      className="h-3 w-3 group-hover:text-sky-400 transition-colors"
                      strokeWidth={3}
                    />{" "}
                    AWARENESS
                  </span>
                  <span className="text-sky-400 font-display font-black italic tracking-tighter text-sm drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]">
                    {Math.round(project.marketingCampaign?.awareness ?? 0)}%
                  </span>
                </div>
                <div className="h-2 bg-black/60 rounded-none overflow-hidden border border-white/5 p-[1px]">
                  <div
                    className="h-full bg-sky-400 transition-all duration-1000 relative"
                    style={{ width: `${project.marketingCampaign?.awareness ?? 0}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse" />
                  </div>
                </div>
              </div>
            </TooltipWrapper>
          )}

          {/* Phase Progress */}
          {(project.state === "development" || project.state === "production") && (
            <TooltipWrapper tooltip={`CURRENT PHASE: ${project.state.toUpperCase()}`} side="top">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-all duration-700 italic">
                  <span className="flex items-center gap-2">
                    <Activity
                      className={cn(
                        "h-3 w-3 transition-colors",
                        hasUnresolvedCrisis
                          ? "group-hover:text-red-400"
                          : "group-hover:text-primary"
                      )}
                      strokeWidth={3}
                    />{" "}
                    {project.state.replace("_", " ").toUpperCase()}
                  </span>
                  <span className="font-display font-black italic tracking-tighter text-sm">
                    {project.weeksInPhase}/
                    {project.state === "development"
                      ? project.developmentWeeks
                      : project.productionWeeks}
                    W
                  </span>
                </div>
                <div className="h-2 bg-black/60 rounded-none overflow-hidden border border-white/5 p-[1px]">
                  <div
                    className={cn(
                      "h-full transition-all duration-1000 relative",
                      hasUnresolvedCrisis
                        ? "bg-red-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                        : "bg-primary shadow-[0_0_20px_rgba(var(--primary),0.4)]"
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
            <div className="space-y-3 border-t border-white/5 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <DistributionBadge
                    status={project.distributionStatus}
                    className="rounded-none shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                  />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 truncate max-w-[120px] italic">
                    {buyer.name.toUpperCase()}
                  </span>
                </div>
                {weeklyRevenueForecast > 0 && (
                  <TooltipWrapper tooltip="PROJECTED WEEKLY FISCAL FLOW" side="top">
                    <div className="flex items-center gap-2 bg-emerald-400/5 px-3 py-1.5 border border-emerald-400/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" strokeWidth={3} />
                      <span className="text-[11px] font-display font-black italic text-emerald-400 tracking-tighter">
                        {formatMoney(weeklyRevenueForecast).toUpperCase()}/WK
                      </span>
                    </div>
                  </TooltipWrapper>
                )}
              </div>
            </div>
          )}

          {/* Financial Highlights & Recoupment */}
          {(project.state === "released" || project.state === "archived") && (
            <RecoupmentStatus
              project={project}
              className="p-5 bg-black/40 rounded-none border border-white/5"
            />
          )}
        </div>

        {/* Executive Actions Zone */}
        <div className="pt-6 flex flex-col gap-4 relative z-10 border-t border-white/5 mt-2">
          {hasUnresolvedCrisis && (
            <Button
              variant="destructive"
              size="sm"
              className="w-full h-12 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse border border-red-400/30 bg-red-400/10 hover:bg-red-400 text-red-400 hover:text-white transition-all duration-700 rounded-none italic"
              onClick={(e) => {
                e.stopPropagation();
                openCrisisModal(project.id);
              }}
            >
              <AlertTriangle className="w-4 h-4 mr-3" strokeWidth={3} />
              NEUTRALIZE CRISIS
            </Button>
          )}

          {project.state === "needs_greenlight" && (
            <Button
              variant="default"
              size="sm"
              className="w-full h-12 text-[10px] font-black uppercase tracking-[0.3em] bg-primary text-black hover:bg-white transition-all duration-700 rounded-none italic shadow-[0_0_20px_rgba(var(--primary),0.2)]"
              onClick={(e) => {
                e.stopPropagation();
                selectProject(project.id);
              }}
            >
              <Zap className="w-4 h-4 mr-3" strokeWidth={3} />
              EXECUTIVE GREENLIGHT
            </Button>
          )}

          {project.state === "pitching" && (
            <Button
              size="sm"
              className="w-full h-12 text-[10px] font-black uppercase tracking-[0.3em] bg-amber-400 text-black hover:bg-white transition-all duration-700 rounded-none italic shadow-[0_0_20px_rgba(251,191,36,0.2)]"
              onClick={(e) => {
                e.stopPropagation();
                openPitchProject(project.id);
              }}
            >
              <Target className="w-4 h-4 mr-3" strokeWidth={3} />
              PITCH PIPELINE
            </Button>
          )}
        </div>
      </div>
    </TooltipWrapper>
  );
};

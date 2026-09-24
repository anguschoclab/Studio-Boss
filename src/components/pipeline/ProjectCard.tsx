import {Project} from "@/engine/types";
import {useUIStore} from "@/store/uiStore";
import {useGameStore} from "@/store/gameStore";
import {BUDGET_TIERS} from "@/engine/data/budgetTiers";
import {TooltipWrapper} from "@/components/ui/tooltip-wrapper";
import {Activity, Zap, Target} from "lucide-react";
import {cn} from "@/lib/utils";
import {RecoupmentStatus} from "../shared/RecoupmentStatus";
import {CardMetricBar} from "./project-card/CardMetricBar";
import {ProjectCardHeader} from "./project-card/ProjectCardHeader";
import {DistributionDealRow} from "./project-card/DistributionDealRow";
import {ProjectCardActions} from "./project-card/ProjectCardActions";

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
  const { selectProject, openPitchProject, enqueueModal } = useUIStore();
  const gameState = useGameStore((s) => s.gameState);
  const toggleBookmark = useGameStore((s) => s.toggleBookmark);
  const isBookmarked = useGameStore((s) => s.isBookmarked);
  const tier = BUDGET_TIERS[project.budgetTier];

  // Find buyer name for distribution badge
  const buyer =
    project.buyerId && gameState
      ? gameState.market.buyers.find((b) => b.id === project.buyerId)
      : null;

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

        <ProjectCardHeader
          project={project}
          displayFormat={displayFormat}
          tierLabel={tier.label}
          bookmarked={isBookmarked(project.id, "project")}
          onToggleBookmark={() => toggleBookmark(project.id, "project")}
        />

        {/* Metrics: Buzz & Progress */}
        <div className="space-y-6 relative z-10">
          {/* Buzz Indicator */}
          {project.state !== "archived" && (
            <CardMetricBar
              label="MARKET BUZZ"
              value={`${Math.round(project.buzz)}%`}
              pct={project.buzz}
              icon={Target}
              iconClassName="group-hover:text-amber-400"
              valueClassName="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]"
              barClassName="bg-amber-400"
              overlay="pulse"
              tooltip="MARKET ANTICIPATION INDEX"
            />
          )}

          {/* Awareness Indicator (marketing phase only) */}
          {project.state === "marketing" && (
            <CardMetricBar
              label="AWARENESS"
              value={`${Math.round(project.marketingCampaign?.awareness ?? 0)}%`}
              pct={project.marketingCampaign?.awareness ?? 0}
              icon={Zap}
              iconClassName="group-hover:text-sky-400"
              valueClassName="text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]"
              barClassName="bg-sky-400"
              overlay="pulse"
              tooltip="ACCUMULATED MARKET AWARENESS — built weekly from campaign spend (share-of-voice adjusted)"
            />
          )}

          {/* Phase Progress */}
          {(project.state === "development" || project.state === "production") && (
            <CardMetricBar
              label={project.state.replace("_", " ").toUpperCase()}
              value={
                <>
                  {project.weeksInPhase}/
                  {project.state === "development"
                    ? project.developmentWeeks
                    : project.productionWeeks}
                  W
                </>
              }
              pct={progressPct}
              icon={Activity}
              iconClassName={
                hasUnresolvedCrisis ? "group-hover:text-red-400" : "group-hover:text-primary"
              }
              barClassName={
                hasUnresolvedCrisis
                  ? "bg-red-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                  : "bg-primary shadow-[0_0_20px_rgba(var(--primary),0.4)]"
              }
              overlay="fade"
              tooltip={`CURRENT PHASE: ${project.state.toUpperCase()}`}
            />
          )}

          <DistributionDealRow project={project} buyer={buyer} />

          {/* Financial Highlights & Recoupment */}
          {(project.state === "released" || project.state === "archived") && (
            <RecoupmentStatus
              project={project}
              className="p-5 bg-black/40 rounded-none border border-white/5"
            />
          )}
        </div>

        <ProjectCardActions
          project={project}
          hasUnresolvedCrisis={!!hasUnresolvedCrisis}
          onCrisis={() => enqueueModal("CRISIS", { projectId: project.id })}
          onGreenlight={() => selectProject(project.id)}
          onPitch={() => openPitchProject(project.id)}
        />
      </div>
    </TooltipWrapper>
  );
};

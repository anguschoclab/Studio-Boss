import React from "react";
import { Package, Bookmark, BookmarkCheck } from "lucide-react";
import { Talent } from "@/engine/types";
import { formatMoney } from "@/engine/utils";
import { AGENCY_ARCHETYPES } from "@/engine/data/archetypes";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { TalentAvatar } from "./TalentAvatar";
import { getTalentVisualAge } from "@/engine/generators/avatarGenerator";
import { useAgencyMap } from "@/hooks/useTalentMap";

/**
 * Props for the TalentCard component.
 */
interface TalentCardProps {
  /** The talent entity to display. */
  talent: Talent;
  /** Optional additional CSS classes for the card container. */
  className?: string;
  /** Optional callback function when the card is clicked. If not provided, it defaults to selecting the talent in the UI store. */
  onClick?: (talentId: string) => void;
  /** Optional tooltip text to show on hover. */
  tooltip?: string;
}

/**
 * A highly stylized card component for displaying a talent's key metrics and portrait.
 * Features a vertical star power bar, prestige indicators, and market ask details.
 *
 * @param props - Component properties
 */
export const TalentCard: React.FC<TalentCardProps> = ({ talent, className, onClick, tooltip }) => {
  const { selectTalent } = useUIStore();
  const gameState = useGameStore((s) => s.gameState);
  const toggleBookmark = useGameStore((s) => s.toggleBookmark);
  const isBookmarked = useGameStore((s) => s.isBookmarked);
  const currentWeek = gameState?.week ?? 1;
  const agencyMap = useAgencyMap();
  const agency = talent.agencyId ? agencyMap.get(talent.agencyId) : null;
  const archetype = agency?.archetype ? AGENCY_ARCHETYPES[agency.archetype] : null;

  const isPackager =
    agency?.currentMotivation === "THE_PACKAGER" ||
    (archetype?.description?.toLowerCase() || "").includes("package") ||
    (archetype?.description?.toLowerCase() || "").includes("packaging");

  const starPower = talent.starMeter || 50;

  const visualAge = getTalentVisualAge(talent, currentWeek);
  const genderSymbol =
    talent.demographics.gender === "MALE"
      ? "♂"
      : talent.demographics.gender === "FEMALE"
        ? "♀"
        : "⚧";

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(talent.id);
    } else {
      selectTalent(talent.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <TooltipWrapper
      tooltip={tooltip || `VIEW ${talent.name.toUpperCase()} STRATEGIC PROFILE`}
      side="top"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "p-6 border rounded-none bg-white/[0.01] glass-card transition-all duration-700 group relative overflow-hidden cursor-pointer h-full flex flex-col shadow-2xl focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary focus-visible:outline-none focus-visible:transition-none",
          talent.prestige >= 80
            ? "border-primary/30 bg-white/[0.03] shadow-[0_0_40px_rgba(var(--primary),0.05)]"
            : "border-white/5",
          "hover:border-primary/50 hover:bg-white/[0.05] active:scale-[0.98]",
          className
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Header: Portrait + Star Bar + Meta */}
        <div className="flex gap-6 relative z-10 mb-8">
          {/* Portrait Container */}
          <div className="relative shrink-0">
            <TalentAvatar
              talent={talent}
              size="lg"
              className="rounded-none border border-white/10 group-hover:border-primary/40 transition-all duration-700 shadow-xl"
            />

            {/* Vertical Star Power Bar (Design Bible 13.1) */}
            <div className="absolute -right-2 top-0 bottom-0 w-2 bg-black/60 rounded-none overflow-hidden border border-white/5">
              <div
                className="absolute bottom-0 left-0 right-0 bg-primary transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary),0.6)]"
                style={{ height: `${starPower}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display font-black text-xl text-foreground/90 tracking-tighter uppercase italic leading-none group-hover:text-primary transition-all duration-700 truncate drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                  {talent.name}
                </h4>
                <button
                  type="button"
                  aria-label={
                    isBookmarked(talent.id, "talent") ? "Remove bookmark" : "Add bookmark"
                  }
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(talent.id, "talent");
                  }}
                  title={isBookmarked(talent.id, "talent") ? "Remove bookmark" : "Add bookmark"}
                  className={cn(
                    "shrink-0 h-7 w-7 flex items-center justify-center border transition-all duration-700 rounded-none",
                    isBookmarked(talent.id, "talent")
                      ? "bg-secondary/10 border-secondary/40 text-secondary shadow-[0_0_15px_rgba(var(--secondary),0.2)]"
                      : "bg-white/5 border-white/10 text-muted-foreground/40 hover:text-secondary hover:border-secondary/40"
                  )}
                >
                  {isBookmarked(talent.id, "talent") ? (
                    <BookmarkCheck className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                  ) : (
                    <Bookmark className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-primary text-black font-black uppercase tracking-[0.2em] text-[8px] h-5 border-none px-2 flex items-center justify-center rounded-none italic shadow-[0_0_10px_rgba(var(--primary),0.2)]">
                  {talent.roles[0]}
                </div>
                {talent.hasRazzie && (
                  <div className="bg-red-500 text-white font-black uppercase tracking-[0.2em] text-[8px] h-5 border-none px-2 flex items-center justify-center rounded-none italic shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                    RAZZIE
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] italic">
                  {visualAge}Y {genderSymbol}
                </span>
                <span className="w-1 h-1 bg-white/10" />
                <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] truncate italic">
                  {talent.demographics.country.toUpperCase()}
                </span>
              </div>
              {agency && (
                <p className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-2 truncate italic group-hover:text-secondary/80 transition-all duration-700">
                  {agency.name.toUpperCase()}
                  {isPackager && <Package className="w-3 h-3 text-secondary animate-pulse" />}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tactical Metrics Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 pt-6 border-t border-white/5 relative z-10 mt-auto">
          <div className="space-y-2">
            <div className="text-[8px] uppercase font-black tracking-[0.3em] text-muted-foreground/20 italic">
              MARKET ASK
            </div>
            <div className="font-display font-black text-sm text-emerald-400 tracking-tighter italic leading-none">
              {formatMoney(talent.fee).toUpperCase()}
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="text-[8px] uppercase font-black tracking-[0.3em] text-muted-foreground/20 italic">
              PRESTIGE
            </div>
            <div className="font-display font-black text-sm text-primary tracking-tighter italic leading-none drop-shadow-[0_0_10px_rgba(var(--primary),0.3)]">
              ★ {talent.prestige}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-[8px] uppercase font-black tracking-[0.3em] text-muted-foreground/20 italic">
              BO DRAW
            </div>
            <div className="font-display font-black text-sm text-foreground/70 tracking-tighter italic leading-none">
              {talent.draw}
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="text-[8px] uppercase font-black tracking-[0.3em] text-muted-foreground/20 italic">
              VIBE
            </div>
            <div className="font-display font-black text-sm text-foreground/70 tracking-tighter uppercase italic leading-none">
              {talent.psychology?.mood > 70
                ? "PEAK"
                : talent.psychology?.mood > 40
                  ? "STEADY"
                  : "VOLATILE"}
            </div>
          </div>
        </div>
      </div>
    </TooltipWrapper>
  );
};

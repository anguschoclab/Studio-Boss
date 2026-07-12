import React, { useMemo } from "react";
import DOMPurify from "dompurify";
import { Talent } from "@/engine/types";
import { generateAvatarSVG } from "@/engine/generators/avatarGenerator";
import { useGameStore } from "@/store/gameStore";
import { cn } from "@/lib/utils";
import { Clapperboard, PenLine, Mic, Briefcase, type LucideIcon } from "lucide-react";

interface TalentAvatarProps {
  talent: Talent;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Override the current week (defaults to reading from game store) */
  week?: number;
  /** Hide the role badge overlay (defaults to false) */
  hideRoleBadge?: boolean;
}

const SIZE_MAP = {
  xs: 32,
  sm: 44,
  md: 56,
  lg: 80,
  xl: 148,
} as const;

const BORDER_SIZE_MAP = {
  xs: "border",
  sm: "border",
  md: "border-2",
  lg: "border-2",
  xl: "border-4",
} as const;

// Role → icon + tint mapping. Tints lean on existing semantic tokens
// so they shift correctly with theme changes.
const ROLE_BADGE: Record<string, { Icon: LucideIcon; label: string; tint: string }> = {
  director: { Icon: Clapperboard, label: "Director", tint: "bg-primary text-black" },
  writer: { Icon: PenLine, label: "Writer", tint: "bg-secondary text-black" },
  actor: { Icon: Mic, label: "Actor", tint: "bg-accent text-black" },
  producer: { Icon: Briefcase, label: "Producer", tint: "bg-white text-black" },
};

const BADGE_SIZE_MAP = {
  xs: { box: "w-3.5 h-3.5", icon: "w-2 h-2", show: false },
  sm: { box: "w-4 h-4", icon: "w-2.5 h-2.5", show: true },
  md: { box: "w-5 h-5", icon: "w-3 h-3", show: true },
  lg: { box: "w-6 h-6", icon: "w-3.5 h-3.5", show: true },
  xl: { box: "w-8 h-8", icon: "w-4 h-4", show: true },
} as const;

/**
 * Renders a procedurally generated avatar for a talent.
 * The avatar is deterministic (same talent = same face) and reflects
 * demographics, age progression, and family resemblance.
 */
export const TalentAvatar: React.FC<TalentAvatarProps> = React.memo(
  ({ talent, size = "md", className, week, hideRoleBadge = false }) => {
    const currentWeek = useGameStore((s) => s.gameState?.week ?? 1);
    const effectiveWeek = week ?? currentWeek;
    const pixelSize = SIZE_MAP[size];

    const svgMarkup = useMemo(() => {
      // Sanitize the procedural SVG to prevent XSS attacks
      return DOMPurify.sanitize(generateAvatarSVG(talent, effectiveWeek), {
        USE_PROFILES: { svg: true, svgFilters: true },
      });
    }, [talent, effectiveWeek]);

    const primaryRole = (talent.roles?.[0] || talent.role || "").toLowerCase();
    const badge = ROLE_BADGE[primaryRole];
    const badgeSize = BADGE_SIZE_MAP[size];
    const showBadge = !hideRoleBadge && badge && badgeSize.show;

    return (
      <div
        className={cn(
          "rounded-none shrink-0",
          "bg-gradient-to-br from-slate-900 to-black",
          "backdrop-blur-3xl",
          BORDER_SIZE_MAP[size],
          "border-white/10",
          "shadow-2xl",
          "relative group transition-all duration-700 hover:border-primary/40",
          className
        )}
        style={{ width: pixelSize, height: pixelSize }}
        aria-label={`Avatar for ${talent.name}`}
      >
        <div
          className="w-full h-full rounded-none overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
        {showBadge && (
          <div
            className={cn(
              "absolute -bottom-1 -right-1 rounded-none flex items-center justify-center",
              "ring-1 ring-white/10 shadow-2xl",
              badgeSize.box,
              badge.tint
            )}
            title={badge.label}
            aria-label={badge.label}
          >
            <badge.Icon className={badgeSize.icon} strokeWidth={3} />
          </div>
        )}
      </div>
    );
  }
);

TalentAvatar.displayName = "TalentAvatar";

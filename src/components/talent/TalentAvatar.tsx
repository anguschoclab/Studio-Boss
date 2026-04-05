import React, { useMemo } from 'react';
import { Talent } from '@/engine/types';
import { generateAvatarSVG } from '@/engine/generators/avatarGenerator';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';

interface TalentAvatarProps {
  talent: Talent;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Override the current week (defaults to reading from game store) */
  week?: number;
}

const SIZE_MAP = {
  xs: 32,
  sm: 44,
  md: 56,
  lg: 80,
  xl: 148,
} as const;

const BORDER_SIZE_MAP = {
  xs: 'border',
  sm: 'border',
  md: 'border-2',
  lg: 'border-2',
  xl: 'border-4',
} as const;

/**
 * Renders a procedurally generated avatar for a talent.
 * The avatar is deterministic (same talent = same face) and reflects
 * demographics, age progression, and family resemblance.
 */
export const TalentAvatar: React.FC<TalentAvatarProps> = React.memo(({ 
  talent, 
  size = 'md', 
  className,
  week 
}) => {
  const currentWeek = useGameStore(s => s.gameState?.week ?? 1);
  const effectiveWeek = week ?? currentWeek;
  const pixelSize = SIZE_MAP[size];
  
  const svgMarkup = useMemo(() => {
    return generateAvatarSVG(talent, effectiveWeek);
  }, [talent.id, talent.demographics.age, talent.demographics.gender, talent.demographics.ethnicity, talent.familyId, effectiveWeek]);

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden shrink-0",
        "bg-gradient-to-br from-slate-800/80 to-slate-950/90",
        "backdrop-blur-sm",
        BORDER_SIZE_MAP[size],
        "border-white/20",
        "shadow-[0_8px_16px_-6px_rgba(0,0,0,0.5)]",
        "relative group transition-transform duration-500 hover:scale-105",
        className
      )}
      style={{ width: pixelSize, height: pixelSize }}
      aria-label={`Avatar for ${talent.name}`}
    >
      <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`} alt={`Avatar for ${talent.name}`} className="w-full h-full object-cover" />
    </div>
  );
});

TalentAvatar.displayName = 'TalentAvatar';

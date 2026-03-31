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
  xs: 28,
  sm: 36,
  md: 48,
  lg: 72,
  xl: 140,
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
        "rounded-full overflow-hidden shrink-0 bg-slate-900/60",
        BORDER_SIZE_MAP[size],
        "border-white/10",
        "shadow-lg",
        className
      )}
      style={{ width: pixelSize, height: pixelSize }}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
      aria-label={`Avatar for ${talent.name}`}
    />
  );
});

TalentAvatar.displayName = 'TalentAvatar';

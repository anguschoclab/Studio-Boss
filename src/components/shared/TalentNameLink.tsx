import React from 'react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

interface TalentNameLinkProps {
  talentId: string;
  name: string;
  className?: string;
}

/**
 * Clickable talent name that opens the talent profile modal.
 * Use this everywhere a talent name appears in text.
 */
export const TalentNameLink: React.FC<TalentNameLinkProps> = ({ talentId, name, className }) => {
  const { selectTalent } = useUIStore();

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        selectTalent(talentId);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectTalent(talentId);
        }
      }}
      className={cn(
        "text-primary hover:text-white cursor-pointer transition-all duration-700 font-display font-black italic uppercase tracking-[0.1em] drop-shadow-[0_0_10px_rgba(var(--primary),0.2)] hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary focus-visible:outline-none focus-visible:transition-none",
        className
      )}
    >
      {name.toUpperCase()}
    </span>
  );
};

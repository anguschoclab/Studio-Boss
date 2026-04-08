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
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectTalent(talentId);
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectTalent(talentId);
      }}
      className={cn(
        "text-primary hover:text-primary/80 cursor-pointer underline decoration-primary/30 hover:decoration-primary/60 transition-colors font-bold inline-block text-left",
        className
      )}
    >
      {name}
    </span>
  );
};

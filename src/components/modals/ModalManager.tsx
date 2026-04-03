import React from 'react';
import { useUIStore } from '@/store/uiStore';
import { WeekSummaryModal } from './WeekSummaryModal';
import { CrisisModal } from './CrisisModal';
import { AwardsCeremonyModal } from './AwardsCeremonyModal';

/**
 * Unified Modal Manager.
 * Listens to the UI Store's modalQueue and renders the active high-priority modal.
 */
export const ModalManager: React.FC = () => {
  const { activeModal } = useUIStore();

  if (!activeModal) return null;

  switch (activeModal.type) {
    case 'SUMMARY':
      return <WeekSummaryModal key={activeModal.id} />;
    case 'CRISIS':
      return <CrisisModal key={activeModal.id} />;
    case 'AWARDS':
      return <AwardsCeremonyModal key={activeModal.id} />;
    default:
      return null;
  }
};

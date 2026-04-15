import React from 'react';
import { useUIStore } from '@/store/uiStore';
// Lazy Loaded Modals
const WeekSummaryModal = React.lazy(() => import('./WeekSummaryModal').then(m => ({ default: m.WeekSummaryModal })));
const CrisisModal = React.lazy(() => import('./CrisisModal').then(m => ({ default: m.CrisisModal })));
const AwardsCeremonyModal = React.lazy(() => import('./AwardsCeremonyModal').then(m => ({ default: m.AwardsCeremonyModal })));
const FestivalMarketModal = React.lazy(() => import('./FestivalMarketModal').then(m => ({ default: m.FestivalMarketModal })));
const CreatePackageModal = React.lazy(() => import('./CreatePackageModal').then(m => ({ default: m.CreatePackageModal })));
const PackageDetailModal = React.lazy(() => import('./PackageDetailModal').then(m => ({ default: m.PackageDetailModal })));

/**
 * Unified Modal Manager.
 * Listens to the UI Store's modalQueue and renders the active high-priority modal.
 */
export const ModalManager: React.FC = () => {
  const { activeModal } = useUIStore();

  if (!activeModal) return null;

  return (
    <React.Suspense fallback={null}>
      {(() => {
        switch (activeModal.type) {
          case 'SUMMARY':
            return <WeekSummaryModal key={activeModal.id} />;
          case 'CRISIS':
            return <CrisisModal key={activeModal.id} />;
          case 'AWARDS':
            return <AwardsCeremonyModal key={activeModal.id} />;
          case 'FESTIVAL_MARKET':
            return <FestivalMarketModal key={activeModal.id} />;
          case 'CREATE_PACKAGE':
            return <CreatePackageModal key={activeModal.id} {...(activeModal.payload as any)} />;
          case 'PACKAGE_DETAIL':
            return <PackageDetailModal key={activeModal.id} />;
          default:
            return null;
        }
      })()}
    </React.Suspense>
  );
};

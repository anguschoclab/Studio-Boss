import React from "react";
import {useUIStore} from "@/store/uiStore";
// Lazy Loaded Modals
const WeekSummaryModal = React.lazy(() =>
  import("./WeekSummaryModal").then((m) => ({ default: m.WeekSummaryModal }))
);
const CrisisModal = React.lazy(() =>
  import("./CrisisModal").then((m) => ({ default: m.CrisisModal }))
);
const AwardsCeremonyModal = React.lazy(() =>
  import("./AwardsCeremonyModal").then((m) => ({ default: m.AwardsCeremonyModal }))
);
const FestivalMarketModal = React.lazy(() =>
  import("./FestivalMarketModal").then((m) => ({ default: m.FestivalMarketModal }))
);
const DirectorsCutModal = React.lazy(() =>
  import("./DirectorsCutModal").then((m) => ({ default: m.DirectorsCutModal }))
);
const UpfrontsModal = React.lazy(() =>
  import("./UpfrontsModal").then((m) => ({ default: m.UpfrontsModal }))
);
const BiddingWarModal = React.lazy(() =>
  import("./BiddingWarModal").then((m) => ({ default: m.BiddingWarModal }))
);
const BreakoutBiddingWarModal = React.lazy(() =>
  import("./BreakoutBiddingWarModal").then((m) => ({ default: m.BreakoutBiddingWarModal }))
);
const RebootOpportunityModal = React.lazy(() =>
  import("./RebootOpportunityModal").then((m) => ({ default: m.RebootOpportunityModal }))
);
const GameOverModal = React.lazy(() =>
  import("./GameOverModal").then((m) => ({ default: m.GameOverModal }))
);
const ReleaseStrategyModal = React.lazy(() =>
  import("./ReleaseStrategyModal").then((m) => ({ default: m.ReleaseStrategyModal }))
);
const PostProductionModal = React.lazy(() =>
  import("./PostProductionModal").then((m) => ({ default: m.PostProductionModal }))
);
const AchievementUnlockedModal = React.lazy(() =>
  import("./AchievementUnlockedModal").then((m) => ({ default: m.AchievementUnlockedModal }))
);
const PackageDealOfferedModal = React.lazy(() =>
  import("./PackageDealOfferedModal").then((m) => ({ default: m.PackageDealOfferedModal }))
);
const DistressedAssetOfferModal = React.lazy(() =>
  import("./DistressedAssetOfferModal").then((m) => ({ default: m.DistressedAssetOfferModal }))
);
const AcquisitionConfirmModal = React.lazy(() =>
  import("./AcquisitionConfirmModal").then((m) => ({ default: m.AcquisitionConfirmModal }))
);
const GreenlightDecisionModal = React.lazy(() =>
  import("./GreenlightDecisionModal").then((m) => ({ default: m.GreenlightDecisionModal }))
);
const CastingConstraintModal = React.lazy(() =>
  import("./CastingConstraintModal").then((m) => ({ default: m.CastingConstraintModal }))
);

/** Modal types with a renderer in the switch below — others are auto-resolved. */
const HANDLED_MODAL_TYPES: ReadonlySet<string> = new Set([
  "SUMMARY",
  "CRISIS",
  "AWARDS",
  "FESTIVAL_MARKET",
  "DIRECTORS_CUT_AVAILABLE",
  "UPFRONTS",
  "BIDDING_WAR",
  "BREAKOUT_BIDDING_WAR",
  "REBOOT_OPPORTUNITY",
  "GAME_OVER",
  "RELEASE_STRATEGY",
  "POST_PRODUCTION",
  "ACHIEVEMENT_UNLOCKED",
  "PACKAGE_DEAL_OFFERED",
  "DISTRESSED_ASSET_OFFER",
  "ACQUISITION_CONFIRM",
  "GREENLIGHT_DECISION",
  "CASTING_CONSTRAINT",
]);

/**
 * Unified Modal Manager.
 * Listens to the UI Store's modalQueue and renders the active high-priority modal.
 */
export const ModalManager: React.FC = () => {
  const { activeModal, resolveCurrentModal } = useUIStore();

  const isHandled = !!activeModal && HANDLED_MODAL_TYPES.has(activeModal.type);

  React.useEffect(() => {
    if (activeModal && !isHandled) resolveCurrentModal();
  }, [activeModal, isHandled, resolveCurrentModal]);

  if (!activeModal || !isHandled) return null;

  return (
    <React.Suspense fallback={null}>
      {(() => {
        switch (activeModal.type) {
          case "SUMMARY":
            return <WeekSummaryModal key={activeModal.id} />;
          case "CRISIS":
            return <CrisisModal key={activeModal.id} />;
          case "AWARDS":
            return <AwardsCeremonyModal key={activeModal.id} />;
          case "FESTIVAL_MARKET":
            return <FestivalMarketModal key={activeModal.id} />;
          case "DIRECTORS_CUT_AVAILABLE":
            return <DirectorsCutModal key={activeModal.id} />;
          case "UPFRONTS":
            return <UpfrontsModal key={activeModal.id} />;
          case "BIDDING_WAR":
            return <BiddingWarModal key={activeModal.id} />;
          case "BREAKOUT_BIDDING_WAR":
            return <BreakoutBiddingWarModal key={activeModal.id} />;
          case "REBOOT_OPPORTUNITY":
            return <RebootOpportunityModal key={activeModal.id} />;
          case "GAME_OVER":
            return <GameOverModal key={activeModal.id} />;
          case "RELEASE_STRATEGY":
            return <ReleaseStrategyModal key={activeModal.id} />;
          case "POST_PRODUCTION":
            return <PostProductionModal key={activeModal.id} />;
          case "ACHIEVEMENT_UNLOCKED":
            return <AchievementUnlockedModal key={activeModal.id} payload={activeModal.payload} />;
          case "PACKAGE_DEAL_OFFERED":
            return <PackageDealOfferedModal key={activeModal.id} />;
          case "DISTRESSED_ASSET_OFFER":
            return <DistressedAssetOfferModal key={activeModal.id} />;
          case "ACQUISITION_CONFIRM":
            return <AcquisitionConfirmModal key={activeModal.id} />;
          case "GREENLIGHT_DECISION":
            return <GreenlightDecisionModal key={activeModal.id} />;
          case "CASTING_CONSTRAINT":
            return <CastingConstraintModal key={activeModal.id} />;
          default:
            return null;
        }
      })()}
    </React.Suspense>
  );
};

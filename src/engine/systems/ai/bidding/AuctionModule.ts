import { GameState, StateImpact } from "@/engine/types";import { RandomGenerator } from "../../../utils/rng";
import { AgencyLeverageEngine } from "../AgencyLeverage";

const ArchetypeMultipliers: Record<string, (genre: string) => number> = {
  indie: (genre) => (genre === "Drama" || genre === "Horror" ? 1.4 : 0.8),
  major: (genre) => (genre === "Sci-Fi" || genre === "Action" ? 1.6 : 0.6),
  "mid-tier": () => 1.15,
};

export function tickAuctions(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  const currWeek = state.week;
  const opportunities = state.market.opportunities.filter(
    (o) => (o.expirationWeek || 0) >= currWeek
  );

  const rivalsMap = state.entities.rivals || {};
  const rivalsList: (typeof state.entities.rivals)[string][] = [];
  for (const rid in rivalsMap) {
    rivalsList.push(rivalsMap[rid]);
  }

  opportunities.forEach((opportunity) => {
    let currentHighest = 0;
    const bidsMap = opportunity.bids || {};
    for (const bidKey in bidsMap) {
      if (bidsMap[bidKey].amount > currentHighest) currentHighest = bidsMap[bidKey].amount;
    }

    let opportunityLeverageAggression = 1.0;
    if (opportunity.attachedTalentIds && opportunity.attachedTalentIds.length > 0) {
      const mainTalent = state.entities.talents[opportunity.attachedTalentIds[0]];
      if (mainTalent) {
        const agency = mainTalent.agencyId
          ? state.industry.agencies.find((a) => a.id === mainTalent.agencyId)
          : undefined;
        const agent = mainTalent.agentId
          ? state.industry.agents.find((a) => a.id === mainTalent.agentId)
          : undefined;
        const leverage = AgencyLeverageEngine.calculateNegotiationLeverage(
          mainTalent,
          agency,
          agent,
          state.finance.marketState
        );
        opportunityLeverageAggression = 1.0 + leverage.score * 0.3;
      }
    }

    rivalsList.forEach((rival) => {
      const myBid = opportunity.bids[rival.id]?.amount || 0;

      const isPlayerLeading = opportunity.highestBidderId === "PLAYER";
      const aggressionFactor = isPlayerLeading ? 1.5 : 1.0;

      const isFranchiseBuilder = rival.currentMotivation === "FRANCHISE_BUILDING";
      const isCashCrunch = rival.currentMotivation === "CASH_CRUNCH";
      const isMarketDisruptor = rival.currentMotivation === "MARKET_DISRUPTION";
      const isAwardChaser = rival.currentMotivation === "AWARD_CHASE";
      const motivationAggression = (rival.motivationProfile?.aggression || 50) / 100;

      const liquidityBuffer = isMarketDisruptor
        ? 1.02
        : isFranchiseBuilder
          ? 1.05
          : isAwardChaser
            ? 1.1
            : isCashCrunch
              ? 1.5
              : 1.25 - motivationAggression * 0.15;

      const bidFloor = Math.max(currentHighest, opportunity.costToAcquire);

      if (myBid < bidFloor && rival.cash > bidFloor * liquidityBuffer) {
        const leverageAggression = opportunityLeverageAggression;

        const isKeyIPGenre =
          opportunity.genre === "Sci-Fi" ||
          opportunity.genre === "Action" ||
          opportunity.genre === "Fantasy";
        // 🎭 The Method Actor Tuning: Boost franchise aggression for key IP genres to simulate fierce studio bidding wars.
        const franchiseAggression =
          isFranchiseBuilder && isKeyIPGenre ? 2.2 : isFranchiseBuilder ? 1.2 : 1.0;

        const isPrestigeGenre =
          opportunity.genre === "Drama" ||
          opportunity.genre === "Historical" ||
          opportunity.genre === "Biopic";
        const awardAggression = isAwardChaser && isPrestigeGenre ? 1.4 : isAwardChaser ? 1.1 : 1.0;

        const disruptorAggression = isMarketDisruptor ? 1.6 : 1.0;

        const multiplier =
          (ArchetypeMultipliers[rival.archetype]?.(opportunity.genre) || 1.0) *
          aggressionFactor *
          franchiseAggression *
          awardAggression *
          disruptorAggression *
          leverageAggression;
        const newBid = Math.floor(bidFloor * (1 + (rng.range(1.05, 1.25) - 1) * multiplier));

        const maxBidCap = Math.min(
          0.95,
          (isMarketDisruptor
            ? 0.9
            : isFranchiseBuilder
              ? 0.8
              : isAwardChaser && isPrestigeGenre
                ? 0.75
                : isCashCrunch
                  ? 0.15
                  : 0.4 + motivationAggression * 0.1) * leverageAggression
        );
        if (newBid < rival.cash * maxBidCap) {
          impacts.push({
            type: "OPPORTUNITY_UPDATED",
            payload: {
              opportunityId: opportunity.id,
              rivalId: rival.id,
              bid: { amount: newBid, terms: "aggressive" },
            },
          });

          if (newBid > 10_000_000 && rng.next() < 0.2) {
            impacts.push({
              type: "NEWS_ADDED",
              payload: {
                headline: `STREET TALK: ${rival.name} desperate for "${opportunity.title}"?`,
                description: `${rival.name} has escalated the bidding for "${opportunity.title}", signaling they might view it as a cornerstone asset for their next slate.`,
                category: "market",
              },
            });
          }
        }
      }
    });
  });

  return impacts;
}

export { ArchetypeMultipliers };

import { GameState, StateImpact } from "@/engine/types";
import { RandomGenerator } from "../../utils/rng";
import { buildProjectAndContracts } from "../../../store/storeUtils";
import { generateOpportunity } from "../../generators/opportunities";
import { getSimMemory } from "../../core/simMemory";

/**
 * Opportunity System
 * Handles the resolution of expired project auctions.
 */
import { CreateProjectParams } from "../../../store/storeUtils";

/**
 * Opportunity System
 * Handles the resolution of expired project auctions.
 */
export const OpportunitySystem = {
  tick(state: GameState, _rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    const expired = state.market.opportunities.filter((o) => o.expirationWeek <= state.week);

    expired.forEach((opp) => {
      // 1. Resolve Highest Bidder
      // ⚡ Bolt Optimization: Replaced Object.entries().sort() with a single-pass for...in loop to find the highest bidder
      let winnerId: string | null = null;
      let maxBidAmount = -1;

      for (const bidderId in opp.bids) {
        if (!Object.prototype.hasOwnProperty.call(opp.bids, bidderId)) continue;
        const bid = opp.bids[bidderId];
        if (bid.amount > maxBidAmount) {
          maxBidAmount = bid.amount;
          winnerId = bidderId;
        }
      }

      if (!winnerId) {
        // No one bid, just expire it
        impacts.push({
          type: "OPPORTUNITY_UPDATED",
          payload: { opportunityId: opp.id, action: "EXPIRE" },
        });
        return;
      }

      const bidData = opp.bids[winnerId];

      // 2. Build Project
      const params: CreateProjectParams = {
        title: opp.title,
        format: opp.format,
        genre: opp.genre,
        budgetTier: opp.budgetTier,
        targetAudience: opp.targetAudience,
        flavor: opp.flavor,
        tvFormat: opp.tvFormat,
        unscriptedFormat: opp.unscriptedFormat,
        episodes: opp.episodes,
        releaseModel: opp.releaseModel,
        initialBuzzBonus: opp.qualityBonus || 0,
        attachedTalentIds: opp.attachedTalentIds,
      };

      const { project, newContracts } = buildProjectAndContracts(state, params);

      // Acquisition cost is paid via FUNDS_DEDUCTED/FINANCE_TRANSACTION only —
      // not folded into project.budget (would skew ROI).
      const winnerProject = {
        ...project,
        isAcquired: true,
      };

      // 3. Apply Impacts based on Winner
      const isPlayerWinner = winnerId === state.studio.id || winnerId === "PLAYER";
      if (isPlayerWinner) {
        impacts.push({
          type: "FUNDS_DEDUCTED",
          payload: { amount: bidData.amount },
        });
        impacts.push({
          newProjects: [{ ...winnerProject, ownerId: state.studio.id }],
          newContracts: newContracts,
        } as StateImpact);
        impacts.push({
          type: "NEWS_ADDED",
          payload: {
            headline: `AUCTION WON: ${state.studio.name} acquires "${opp.title}"`,
            description: `After a competitive bidding process, ${state.studio.name} secured the rights for $${(bidData.amount / 1000000).toFixed(1)}M.`,
            category: "general",
          },
        });

        // Relations ledger: every rival who bid and lost to the player
        // remembers the outbid — feeds stance/spite in RivalBrain.
        const relations = getSimMemory(state).rivalRelations || {};
        for (const bidderId in opp.bids) {
          if (bidderId === winnerId || bidderId === state.studio.id || bidderId === "PLAYER") {
            continue;
          }
          if (!state.entities.rivals?.[bidderId]) continue;
          const rel = relations[bidderId] || {
            playerOutbids: 0,
            playerPoaches: 0,
            lastHostileWeek: 0,
          };
          impacts.push({
            type: "INDUSTRY_UPDATE",
            payload: {
              update: {
                [`simMemory.rivalRelations.${bidderId}`]: {
                  ...rel,
                  playerOutbids: rel.playerOutbids + 1,
                  lastHostileWeek: state.week,
                },
              },
            },
          } as StateImpact);
        }
      } else {
        // Rival Winner
        const rival = state.entities.rivals[winnerId];
        if (rival) {
          // PROJECT_UPDATED cannot insert — the project must arrive via the
          // newProjects bag field or the rival is charged for nothing.
          impacts.push({
            newProjects: [{ ...winnerProject, ownerId: rival.id }],
            newContracts,
          } as StateImpact);
          impacts.push({
            type: "FINANCE_TRANSACTION",
            payload: {
              amount: -bidData.amount,
              description: `Won auction for "${opp.title}"`,
              targetId: winnerId,
            },
          });
          impacts.push({
            type: "NEWS_ADDED",
            payload: {
              headline: `AUCTION LOST: ${rival.name} outbids competition for "${opp.title}"`,
              description: `${rival.name} has emerged victorious in the bidding for ${opp.title}, paying a premium $${(bidData.amount / 1000000).toFixed(1)}M.`,
              category: "general",
            },
          });
        }
      }
    });

    // 5. Cleanup & Replenishment
    const remainingOpportunities = state.market.opportunities.filter(
      (o) => o.expirationWeek > state.week
    );

    if (expired.length > 0 || remainingOpportunities.length < 8) {
      const toGenerate = Math.max(0, 8 - remainingOpportunities.length);
      const newOpps = Array.from({ length: toGenerate }, () => generateOpportunity(state.week));

      impacts.push({
        type: "INDUSTRY_UPDATE",
        payload: {
          update: { "market.opportunities": [...remainingOpportunities, ...newOpps] },
        },
      });
    }

    return impacts;
  },
};

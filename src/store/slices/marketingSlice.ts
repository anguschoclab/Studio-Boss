import {StateCreator} from "zustand";
import {GameStore} from "../gameStore";
import {RandomGenerator} from "@/engine/utils/rng";
import {AudienceQuadrant, MarketingAngle, StateImpact} from "@/engine/types";
import {calculateAudienceIndex} from "@/engine/systems/demographics";
import {applyImpacts} from "@/engine/core/impactReducer";
import {launchAwardsCampaign as launchAwardsCampaignEngine} from "@/engine/systems/awards/AwardsCampaign";

export interface CampaignTier {
  cost: number;
  buzz: number;
  risk: number;
  type: "awards" | "marketing";
}

export const CAMPAIGN_TIERS: Record<string, CampaignTier> = {
  // Awards Campaigns (FYC)
  Grassroots: { cost: 250_000, buzz: 5, risk: 0, type: "awards" },
  Trade: { cost: 1_000_000, buzz: 15, risk: 2, type: "awards" },
  Blitz: { cost: 5_000_000, buzz: 40, risk: 12, type: "awards" },

  // Marketing Campaigns (Revenue/Buzz)
  Standard: { cost: 2_000_000, buzz: 10, risk: 1, type: "marketing" },
  Tentpole: { cost: 10_000_000, buzz: 25, risk: 3, type: "marketing" },
  Saturation: { cost: 50_000_000, buzz: 60, risk: 8, type: "marketing" },
};

export interface MarketingSlice {
  launchAwardsCampaign: (projectId: string, tierKey: "Grassroots" | "Trade" | "Blitz", targetCategories?: string[]) => void;
  launchMarketingCampaign: (
    projectId: string,
    tierKey: "Standard" | "Tentpole" | "Saturation",
    angle: MarketingAngle,
    target: AudienceQuadrant
  ) => void;
}

export const createMarketingSlice: StateCreator<GameStore, [], [], MarketingSlice> = (
  set,
  get
) => ({
  launchAwardsCampaign: (projectId, tierKey, targetCategories) => {
    const state = get().gameState;
    if (!state) return;

    const rng = new RandomGenerator(state.rngState ?? state.gameSeed);
    const result = launchAwardsCampaignEngine(state, projectId, tierKey, rng, targetCategories);
    if (!result) return;

    const newsEvents: import("@/engine/types").NewsEvent[] = [];
    for (const impact of result.impacts) {
      if (impact.newsEvents) {
        newsEvents.push(...impact.newsEvents);
      }
    }

    set((s) => {
      if (!s.gameState) return s;

      return {
        gameState: {
          ...s.gameState,
          finance: {
            ...s.gameState.finance,
            cash: s.gameState.finance.cash - result.cost,
          },
          studio: {
            ...s.gameState.studio,
            activeCampaigns: {
              ...s.gameState.studio.activeCampaigns,
              [projectId]: result.campaign,
            },
          },
          rngState: result.rngState,
        },
      };
    });

    // Side effects must run outside the set() updater — updaters can re-run.
    if (newsEvents.length > 0) {
      get().appendNewsEvents(newsEvents);
    }
  },

  launchMarketingCampaign: (projectId, tierKey, angle, target) => {
    const tier = CAMPAIGN_TIERS[tierKey];
    const state = get().gameState;
    if (!state || !state.entities.projects[projectId]) return;

    if (state.finance.cash < tier.cost) {
      return;
    }

    const project = state.entities.projects[projectId];
    const alignment = calculateAudienceIndex(project, target);
    const finalBuzzGain = Math.floor(tier.buzz * alignment);

    set((s) => {
      if (!s.gameState) return s;

      const impact: StateImpact = {
        type: "PROJECT_UPDATED",
        payload: {
          projectId,
          update: {
            buzz: Math.min(100, (project.buzz || 0) + finalBuzzGain),
            targetDemographic: target,
            marketingBudget: (project.marketingBudget || 0) + tier.cost,
          },
        },
      };

      const fundsImpact: StateImpact = {
        type: "FUNDS_CHANGED",
        payload: { amount: -tier.cost },
      };

      return {
        gameState: applyImpacts(s.gameState, [impact, fundsImpact]),
      };
    });
  },
});

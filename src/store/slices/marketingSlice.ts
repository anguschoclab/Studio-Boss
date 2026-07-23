/* eslint-disable @typescript-eslint/no-explicit-any */
import { StateCreator } from "zustand";
import { GameStore } from "../gameStore";
import { RandomGenerator } from "@/engine/utils/rng";
import { AudienceQuadrant, MarketingAngle } from "@/engine/types";
import { calculateAudienceIndex } from "@/engine/systems/demographics";
import { applyImpacts } from "@/engine/core/impactReducer";
import { launchAwardsCampaign as launchAwardsCampaignEngine } from "@/engine/systems/awards/AwardsCampaign";

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

    const rng = new RandomGenerator(state.rngState ?? 0);
    const result = launchAwardsCampaignEngine(state, projectId, tierKey, rng, targetCategories);
    if (!result) return;

    set((s) => {
      if (!s.gameState) return s;

      const newState = {
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
      };

      for (const impact of result.impacts) {
        if (impact.newHeadlines) {
          newState.news = {
            ...newState.news,
            headlines: [...impact.newHeadlines, ...newState.news.headlines],
          };
        }
      }

      return {
        gameState: newState,
        finance: newState.finance,
      };
    });
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
      const rng = new RandomGenerator(s.gameState.rngState ?? 0);

      const impact = {
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

      const fundsImpact = {
        type: "FUNDS_CHANGED",
        payload: { amount: -tier.cost },
      };

      const newState = applyImpacts(s.gameState, [impact as any, fundsImpact as any]);

      return {
        gameState: {
          ...newState,
          rngState: rng.getState(),
        },
        finance: newState.finance,
      };
    });
  },
});

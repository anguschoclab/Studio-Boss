import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { CampaignData } from '@/engine/types/state.types';
import { RandomGenerator } from '@/engine/utils/rng';
import { checkCampaignBacklash } from '@/engine/systems/awards';
import { AudienceQuadrant, MarketingAngle } from '@/engine/types';
import { calculateAudienceIndex } from '@/engine/systems/demographics';
import { applyImpacts } from '@/engine/core/impactReducer';

export interface CampaignTier {
  cost: number;
  buzz: number;
  risk: number;
  type: 'awards' | 'marketing';
}

export const CAMPAIGN_TIERS: Record<string, CampaignTier> = {
  // Awards Campaigns (FYC)
  Grassroots: { cost: 250_000, buzz: 5, risk: 0, type: 'awards' },
  Trade: { cost: 1_000_000, buzz: 15, risk: 2, type: 'awards' },
  Blitz: { cost: 5_000_000, buzz: 40, risk: 12, type: 'awards' },
  
  // Marketing Campaigns (Revenue/Buzz)
  Standard: { cost: 2_000_000, buzz: 10, risk: 1, type: 'marketing' },
  Tentpole: { cost: 10_000_000, buzz: 25, risk: 3, type: 'marketing' },
  Saturation: { cost: 50_000_000, buzz: 60, risk: 8, type: 'marketing' },
};

export interface MarketingSlice {
  launchAwardsCampaign: (projectId: string, tierKey: 'Grassroots' | 'Trade' | 'Blitz') => void;
  launchMarketingCampaign: (projectId: string, tierKey: 'Standard' | 'Tentpole' | 'Saturation', angle: MarketingAngle, target: AudienceQuadrant) => void;
}

export const createMarketingSlice: StateCreator<GameStore, [], [], MarketingSlice> = (set, get) => ({
  launchAwardsCampaign: (projectId, tierKey) => {
    const tier = CAMPAIGN_TIERS[tierKey];
    const state = get().gameState;
    if (!state) return;

    if (state.finance.cash < tier.cost) {
      console.warn('Insufficient funds for awards campaign');
      return;
    }

    const rng = new RandomGenerator(state.rngState);
    const project = state.entities.projects[projectId];
    const metaScore = project?.reception?.metaScore || project?.reviewScore || 60;
    
    const hasBacklash = checkCampaignBacklash(metaScore, tierKey, rng);

    set((s) => {
      if (!s.gameState) return s;

      const newCampaign: CampaignData = {
        id: rng.uuid('OPP'),
        projectId,
        budget: tier.cost,
        targetCategories: ['Best Picture'], // Default
        buzzBonus: tier.buzz,
        scandalRisk: tier.risk
      };

      const newState = {
        ...s.gameState,
        finance: {
          ...s.gameState.finance,
          cash: s.gameState.finance.cash - tier.cost
        },
        studio: {
          ...s.gameState.studio,
          activeCampaigns: {
            ...s.gameState.studio.activeCampaigns,
            [projectId]: newCampaign
          }
        },
        rngState: rng.getState()
      };

      if (hasBacklash) {
        const scandalHeadline = {
          id: rng.uuid('NWS'),
          text: `BACKLASH: Aggressive awards campaigning for "${project?.title}" sparks industry outcry!`,
          week: s.gameState.week,
          category: 'scandal' as const
        };
        newState.news.headlines.unshift(scandalHeadline);
      }
      
      newState.rngState = rng.getState();

      return {
        gameState: newState,
        finance: newState.finance
      };
    });
  },

  launchMarketingCampaign: (projectId, tierKey, angle, target) => {
    const tier = CAMPAIGN_TIERS[tierKey];
    const state = get().gameState;
    if (!state || !state.entities.projects[projectId]) return;

    if (state.finance.cash < tier.cost) {
      console.warn('Insufficient funds for marketing campaign');
      return;
    }

    const project = state.entities.projects[projectId];
    const alignment = calculateAudienceIndex(project, target);
    const finalBuzzGain = Math.floor(tier.buzz * alignment);

    set((s) => {
      if (!s.gameState) return s;
      const rng = new RandomGenerator(s.gameState.rngState);

      const impact = {
        type: 'PROJECT_UPDATED',
        payload: {
          projectId,
          update: {
            buzz: Math.min(100, (project.buzz || 0) + finalBuzzGain),
            targetDemographic: target,
            marketingBudget: (project.marketingBudget || 0) + tier.cost
          }
        }
      };

      const fundsImpact = {
        type: 'FUNDS_CHANGED',
        payload: { amount: -tier.cost }
      };

      const newState = applyImpacts(s.gameState, [impact as any, fundsImpact as any]);

      return {
        gameState: {
          ...newState,
          rngState: rng.getState()
        },
        finance: newState.finance
      };
    });
  }
});

import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { CampaignData } from '@/engine/types/state.types';
import { RandomGenerator } from '@/engine/utils/rng';
import { checkCampaignBacklash } from '@/engine/systems/awards';

export interface CampaignSlice {
  launchCampaign: (projectId: string, tierKey: 'Grassroots' | 'Trade' | 'Blitz') => void;
}

export const CAMPAIGN_TIERS = {
  Grassroots: { cost: 250_000, buzz: 5, risk: 0 },
  Trade: { cost: 1_000_000, buzz: 15, risk: 2 },
  Blitz: { cost: 5_000_000, buzz: 40, risk: 12 }
};

export const createCampaignSlice: StateCreator<GameStore, [], [], CampaignSlice> = (set, get) => ({
  launchCampaign: (projectId, tierKey) => {
    const tier = CAMPAIGN_TIERS[tierKey];
    const state = get().gameState;
    if (!state) return;

    // Check funds
    if (state.finance.cash < tier.cost) {
      console.warn('Insufficient funds for campaign');
      return;
    }

    // Deduct funds
    const newCash = state.finance.cash - tier.cost;
    
    // Create local RNG for backlash check
    const rng = new RandomGenerator(state.rngState);
    const project = state.entities.projects[projectId];
    const metaScore = project?.reception?.metaScore || project?.reviewScore || 60;
    
    const hasBacklash = checkCampaignBacklash(metaScore, tierKey, rng);

    // Update state
    set((s) => {
      if (!s.gameState) return s;

      const newCampaign: CampaignData = {
        projectId,
        budget: tier.cost,
        targetCategories: ['Best Picture'], // Default for now
        buzzBonus: tier.buzz,
        scandalRisk: tier.risk
      };

      const newState = {
        ...s.gameState,
        finance: {
          ...s.gameState.finance,
          cash: newCash
        },
        activeCampaigns: {
          ...s.gameState.activeCampaigns,
          [projectId]: newCampaign
        },
        rngState: rng.getState()
      };

      if (hasBacklash) {
        // Dispatch crisis/scandal
        const scandalHeadline = {
          id: rng.uuid('scandal'),
          text: `BACKLASH: Aggressive campaigning for "${project?.title}" sparks industry outcry!`,
          week: s.gameState.week,
          category: 'scandal' as const
        };
        newState.news.headlines.unshift(scandalHeadline);
      }
      
      // We must recapture the updated RNG state in case the backlash check bumped it
      newState.rngState = rng.getState();

      return {
        gameState: newState,
        finance: newState.finance
      };
    });

    console.log(`Launched ${tierKey} campaign for ${projectId}. Cost: ${tier.cost}`);
  }
});

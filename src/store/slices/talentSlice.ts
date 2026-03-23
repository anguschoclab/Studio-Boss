import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { Contract } from '@/engine/types';
import { offerFirstLookDeal } from '@/engine/systems/deals';

export interface TalentSlice {
  signContract: (talentId: string, projectId: string) => void;
  offerFirstLook: (talentId: string, duration: number, fee: number) => boolean;
}

export const createTalentSlice: StateCreator<GameStore, [], [], TalentSlice> = (set, get) => ({
  signContract: (talentId, projectId) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const talent = state.talentPool.find(t => t.id === talentId);
      if (!talent) return s;
      
      const pIndex = state.projects.findIndex(p => p.id === projectId);
      if (pIndex === -1) return s;
      
      let finalFee = talent.fee;
      if (state.firstLookDeals?.some(d => d.talentId === talentId)) {
         finalFee = talent.fee * 0.5;
      }
      
      if (state.cash < finalFee) return s;
      
      const newCash = state.cash - finalFee;
      
      const contract: Contract = {
        id: crypto.randomUUID(),
        projectId,
        talentId,
        fee: finalFee,
        backendPercent: talent.accessLevel === 'dynasty' ? 10 : 5,
        creativeControl: talent.accessLevel === 'dynasty' || talent.prestige > 85 ? true : undefined,
        sequelOption: talent.accessLevel === 'dynasty' || talent.prestige > 75 ? true : undefined,
        backendEscalator: talent.accessLevel === 'dynasty' ? 5 : undefined,
      };
      
      return {
        gameState: {
          ...state,
          cash: newCash,
          contracts: [...state.contracts, contract]
        }
      };
    });
  },

  offerFirstLook: (talentId, duration, fee) => {
    let success = false;
    set((s) => {
      const state = s.gameState;
      if (!state) return s;
      
      const talent = state.talentPool.find(t => t.id === talentId);
      if (!talent) return s;
      
      const lockFee = (talent.fee * 2);
      if (state.cash < lockFee) return s;
      
      const deal = offerFirstLookDeal(state, talentId, duration, true);
      
      if (deal) {
         success = true;
         const currentDeals = state.firstLookDeals || [];
         const newHeadlines = [...state.headlines];
         newHeadlines.unshift({
           id: crypto.randomUUID(),
           week: state.week,
           category: 'talent',
           text: `${talent.name} signs exclusive first-look pact with ${state.studio.name}.`
         });
         
         return {
           gameState: {
             ...state,
             cash: state.cash - lockFee,
             headlines: newHeadlines,
             firstLookDeals: [...currentDeals, deal]
           }
         };
      } else {
         const newHeadlines = [...state.headlines];
         newHeadlines.unshift({
           id: crypto.randomUUID(),
           week: state.week,
           category: 'general',
           text: `${talent.name} passes on first-look deal with ${state.studio.name}.`
         });
         
         return {
           gameState: {
             ...state,
             headlines: newHeadlines
           }
         };
      }
    });
    return success;
  },
});

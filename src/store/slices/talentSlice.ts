import { StateCreator } from 'zustand';
import { Contract } from '@/engine/types';

export interface TalentSlice {
  signContract: (talentId: string, projectId: string) => void;
  offerFirstLook: (talentId: string, duration: number, fee: number) => boolean;
}

export const createTalentSlice: StateCreator<any, [], [], TalentSlice> = (set, get) => ({
  signContract: (talentId, projectId) => {
    set((s: any) => {
      const state = s.gameState;
      if (!state) return s;

      const talent = state.talentPool.find((t: any) => t.id === talentId);
      if (!talent) return s;
      
      const pIndex = state.projects.findIndex((p: any) => p.id === projectId);
      if (pIndex === -1) return s;
      
      let finalFee = talent.fee;
      if (state.firstLookDeals?.some((d: any) => d.talentId === talentId)) {
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
    set((s: any) => {
      const state = s.gameState;
      if (!state) return s;
      
      const talent = state.talentPool.find((t: any) => t.id === talentId);
      if (!talent) return s;
      
      const lockFee = (talent.fee * 2);
      if (state.cash < lockFee) return s;
      
<<<<<<< Updated upstream
=======
      // Note: In slice, we might need to handle the require carefully or pass it in.
      // For now, let's assume it's available or we can import it.
>>>>>>> Stashed changes
      const dealsEngine = require('../../engine/systems/deals');
      const deal = dealsEngine.offerFirstLookDeal(state, talentId, duration, true);
      
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

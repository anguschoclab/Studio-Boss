import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { Contract } from '@/engine/types/index';
import { offerFirstLookDeal } from '@/engine/systems/deals';
import { buildProjectAndContracts, CreateProjectParams } from '../storeUtils';

export interface TalentSlice {
  signContract: (talentId: string, projectId: string) => void;
  offerFirstLook: (talentId: string, duration: number, fee: number) => boolean;
  acquireOpportunity: (oppId: string) => void;
}

export const createTalentSlice: StateCreator<GameStore, [], [], TalentSlice> = (set) => ({
  signContract: (talentId, projectId) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const talent = state.industry.talentPool.find(t => t.id === talentId);
      if (!talent) return s;
      
      const pIndex = state.studio.internal.projects.findIndex(p => p.id === projectId);
      if (pIndex === -1) return s;
      
      let finalFee = talent.fee;
      if (state.studio.internal.firstLookDeals?.some(d => d.talentId === talentId)) {
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
          studio: {
            ...state.studio,
            internal: {
              ...state.studio.internal,
              contracts: [...state.studio.internal.contracts, contract]
            }
          }
        }
      };
    });
  },

  offerFirstLook: (talentId, duration) => {
    let success = false;
    set((s) => {
      const state = s.gameState;
      if (!state) return s;
      
      const talent = state.industry.talentPool.find(t => t.id === talentId);
      if (!talent) return s;
      
      const lockFee = (talent.fee * 2);
      if (state.cash < lockFee) return s;
      
      const { deal, update } = offerFirstLookDeal(state, talentId, duration, true);
      
      if (deal) {
         success = true;
         const currentDeals = state.studio.internal.firstLookDeals || [];
         const newHeadlines = [...state.industry.headlines];
         newHeadlines.unshift({
           id: crypto.randomUUID(),
           week: state.week,
           category: 'talent' as const,
           text: update
         });
         
         return {
           gameState: {
             ...state,
             cash: state.cash - lockFee,
             studio: {
               ...state.studio,
               internal: {
                 ...state.studio.internal,
                 firstLookDeals: [...currentDeals, deal]
               }
             },
             industry: {
               ...state.industry,
               headlines: newHeadlines,
             }
           }
         };
      } else {
         const newHeadlines = [...state.industry.headlines];
         newHeadlines.unshift({
           id: crypto.randomUUID(),
           week: state.week,
           category: 'general' as const,
           text: update
         });
         
         return {
           gameState: {
             ...state,
             industry: {
               ...state.industry,
               headlines: newHeadlines
             }
           }
         };
      }
    });
    return success;
  },

  acquireOpportunity: (oppId) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const oppIndex = state.market.opportunities.findIndex(o => o.id === oppId);
      if (oppIndex === -1) return s;

      const opp = state.market.opportunities[oppIndex];
      const cost = opp.costToAcquire || 0;

      if (state.cash < cost) return s;

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
        initialBuzzBonus: opp.qualityBonus,
      };

      const { project, newContracts, talentFees } = buildProjectAndContracts(state, params);

      const updatedOpportunities = [...state.market.opportunities];
      updatedOpportunities.splice(oppIndex, 1);

      return {
        gameState: {
          ...state,
          cash: state.cash - cost - talentFees,
          studio: {
            ...state.studio,
            internal: {
              ...state.studio.internal,
              projects: [...state.studio.internal.projects, project],
              contracts: [...state.studio.internal.contracts, ...newContracts]
            }
          },
          market: {
            ...state.market,
            opportunities: updatedOpportunities
          }
        }
      };
    });
  },
});

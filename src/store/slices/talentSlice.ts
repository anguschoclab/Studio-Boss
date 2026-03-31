import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { Contract } from '@/engine/types';
import { buildProjectAndContracts, CreateProjectParams } from '../storeUtils';

export interface TalentSlice {
  signContract: (talentId: string, projectId: string) => void;
  offerFirstLook: (talentId: string, duration: number, fee: number) => boolean;
  acquireOpportunity: (oppId: string) => void;
  getTalentFilmography: (talentId: string) => any[];
  getTalentCareerStats: (talentId: string) => any;
  calculateStarMeter: (talentId: string) => number;
}

export const createTalentSlice: StateCreator<GameStore, [], [], TalentSlice> = (set, get) => ({
  signContract: (talentId, projectId) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const talent = state.industry.talentPool[talentId];
      if (!talent) return s;
      
      const p = state.studio.internal.projects[projectId];
      if (!p) return s;
      
      let finalFee = talent.fee;
      if (state.studio.internal.firstLookDeals?.some(d => d.talentId === talentId)) {
         finalFee = talent.fee * 0.5;
      }
      
      if (state.finance.cash < finalFee) return s;
      
      const newCash = state.finance.cash - finalFee;
      
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
          finance: { ...state.finance, cash: newCash },
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
      
      const talent = state.industry.talentPool[talentId];
      if (!talent) return s;
      
      const lockFee = (talent.fee * 2);
      if (state.finance.cash < lockFee) return s;
      
      // Simplified: just create the deal directly
      const accepted = Math.random() > 0.3; // 70% acceptance
      
      if (accepted) {
         success = true;
         const deal = {
           id: crypto.randomUUID(),
           talentId,
           weeksRemaining: duration,
           exclusivity: true,
         };
         const currentDeals = state.studio.internal.firstLookDeals || [];
         const newNewsHistory = [...state.industry.newsHistory];
         newNewsHistory.unshift({
           id: crypto.randomUUID(),
           week: state.week,
           type: 'STUDIO_EVENT' as const,
           headline: `${talent.name} signs first-look pact with ${state.studio.name}.`,
           description: `${talent.name} has signed an exclusive first-look deal.`,
         });
         
         return {
           gameState: {
             ...state,
             finance: { ...state.finance, cash: state.finance.cash - lockFee },
             studio: {
               ...state.studio,
               internal: {
                 ...state.studio.internal,
                 firstLookDeals: [...currentDeals, deal]
               }
             },
             industry: {
               ...state.industry,
               newsHistory: newNewsHistory,
             }
           }
         };
      } else {
         const newNewsHistory = [...state.industry.newsHistory];
         newNewsHistory.unshift({
           id: crypto.randomUUID(),
           week: state.week,
           type: 'STUDIO_EVENT' as const,
           headline: `${talent.name} passes on first-look deal with ${state.studio.name}.`,
           description: `${talent.name} has declined an exclusive first-look pact.`,
         });
         
         return {
           gameState: {
             ...state,
             industry: {
               ...state.industry,
               newsHistory: newNewsHistory,
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

      if (state.finance.cash < cost) return s;

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
          finance: { ...state.finance, cash: state.finance.cash - cost - talentFees },
          studio: {
            ...state.studio,
            internal: {
              ...state.studio.internal,
              projects: { ...state.studio.internal.projects, [project.id]: project },
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

  getTalentFilmography: (talentId) => {
    const s = get();
    if (!s.gameState) return [];
    const talent = s.gameState.industry.talentPool[talentId];
    return talent?.filmography || [];
  },

  getTalentCareerStats: (talentId) => {
    const s = get();
    if (!s.gameState) return null;
    const talent = s.gameState.industry.talentPool[talentId];
    if (!talent) return null;
    
    return {
      careerGross: talent.careerGross || 0,
      highestSalaryMovie: talent.highestSalaryMovie,
      highestSalaryTv: talent.highestSalaryTv,
      starMeter: talent.starMeter || 50
    };
  },

  calculateStarMeter: (talentId) => {
    const s = get();
    if (!s.gameState) return 50;
    const talent = s.gameState.industry.talentPool[talentId];
    if (!talent) return 50;

    const filmography = talent.filmography || [];
    const recentProjects = filmography.slice(0, 3);
    const momentum = recentProjects.length > 0
      ? recentProjects.reduce((sum, p) => sum + (p.gross > 50000000 ? 100 : 50), 0) / recentProjects.length
      : 50;

    return Math.floor((talent.prestige * 0.4) + (talent.draw * 0.4) + (momentum * 0.2));
  },
});

import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { Contract, Opportunity, StateImpact } from '@/engine/types';
import { buildProjectAndContracts, CreateProjectParams, applyStateImpact } from '../storeUtils';
import { calculateLiveCounterBid } from '@/engine/systems/ai/biddingEngine';
import { RandomGenerator } from '@/engine/utils/rng';

export interface TalentSlice {
  signContract: (talentId: string, projectId: string) => void;
  offerFirstLook: (talentId: string, duration: number, fee: number) => boolean;
  acquireOpportunity: (oppId: string) => void;
  placeBid: (oppId: string, amount: number) => void;
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
      
      // Auction requirement: Only acquire if player is highest bidder and auction expired
      // OR if it's a non-auction acquisition (costToAcquire > 0)
      const currentHighest = Object.values(opp.bids || {}).reduce((max: number, b) => Math.max(max, (b as any).amount || 0), 0);
      const isWinner = opp.highestBidderId === 'PLAYER';
      const isExpired = state.week >= opp.expirationWeek;

      if (opp.costToAcquire === 0 && (!isWinner || !isExpired)) return s;

      const cost = opp.costToAcquire > 0 ? opp.costToAcquire : currentHighest;

      if (state.finance.cash < (cost + 100000)) return s; // Buffer for fees

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

      // Initialize new project roles & script state if scripted
      if (params.format !== 'unscripted') {
        const scripted = project as any; // Temporary cast to handle the fact that we know it's scripted
        scripted.scriptHeat = 50;
        scripted.activeRoles = ['protagonist', 'antagonist', 'mentor', 'love_interest'].slice(0, project.budgetTier === 'blockbuster' ? 4 : 3);
        scripted.scriptEvents = [];
      }
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

  placeBid: (oppId, amount) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const oppIndex = state.market.opportunities.findIndex(o => o.id === oppId);
      if (oppIndex === -1) return s;

      const opp = state.market.opportunities[oppIndex];
      if (state.finance.cash < amount) return s;

      // Update player bid
      const updatedBids = { ...opp.bids, PLAYER: { amount, terms: 'standard' } };
      const bidHistory = [...(opp.bidHistory || []), { rivalId: 'PLAYER', amount, week: state.week }];
      
      let nextState = {
        ...state,
        market: {
          ...state.market,
          opportunities: state.market.opportunities.map(o => 
            o.id === oppId ? { ...o, bids: updatedBids, highestBidderId: 'PLAYER', bidHistory } : o
          )
        }
      };

      // Live Counter Bid Logic
      const rng = new RandomGenerator(state.gameSeed + state.week + amount);
      const aggressiveRivals = state.industry.rivals.filter(r => r.cash > amount * 1.5 && r.prestige > 40);
      
      if (aggressiveRivals.length > 0) {
        const rival = aggressiveRivals[Math.floor(rng.next() * aggressiveRivals.length)];
        const counterImpact = calculateLiveCounterBid(opp, amount, rival, rng, state.week);
        
        if (counterImpact) {
          nextState = applyStateImpact(nextState, [counterImpact]);
        }
      }

      return { gameState: nextState };
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

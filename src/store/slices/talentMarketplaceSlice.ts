import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { Opportunity, CharacterArchetype, StateImpact } from '@/engine/types';
import { type ProjectId, type OpportunityId, type StudioId, type TalentId, type ContractId } from '@/engine/types/shared.types';
import { buildProjectAndContracts, CreateProjectParams, applyStateImpact } from '../storeUtils';
import { calculateLiveCounterBid } from '@/engine/systems/ai/biddingEngine';
import { RandomGenerator } from '@/engine/utils/rng';

export interface TalentMarketplaceSlice {
  acquireOpportunity: (oppId: OpportunityId) => void;
  placeBid: (oppId: OpportunityId, amount: number) => void;
}

export const createTalentMarketplaceSlice: StateCreator<GameStore, [], [], TalentMarketplaceSlice> = (set, get) => ({
  acquireOpportunity: (oppId) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const oppIndex = state.market.opportunities.findIndex(o => (o.id as any) === oppId);
      if (oppIndex === -1) return s;

      const opp = state.market.opportunities[oppIndex];
      const rng = new RandomGenerator(state.rngState);
      const currentHighest = Object.values(opp.bids || {}).reduce((max: number, b) => Math.max(max, b.amount || 0), 0);
      const isWinner = opp.highestBidderId === 'PLAYER';
      const isExpired = state.week >= opp.expirationWeek;

      if (opp.costToAcquire === 0 && (!isWinner || !isExpired)) return s;

      const cost = opp.costToAcquire > 0 ? opp.costToAcquire : currentHighest;

      if (state.finance.cash < (cost + 100000)) return s; 

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

      const { project, newContracts, talentFees } = buildProjectAndContracts(state, params, rng);

      if (params.format !== 'unscripted') {
        const roles: CharacterArchetype[] = ['protagonist', 'antagonist', 'mentor', 'love_interest'];
        const activeRoles: CharacterArchetype[] = roles.slice(0, project.budgetTier === 'blockbuster' ? 4 : 3);
        
        if (project.type === 'FILM') {
           const film = project as import('@/engine/types').FilmProject;
           film.scriptHeat = 50;
           film.activeRoles = activeRoles;
           film.scriptEvents = [];
        } else if (project.type === 'SERIES') {
           const series = project as import('@/engine/types').SeriesProject;
           series.scriptHeat = 50;
           series.activeRoles = activeRoles;
           series.scriptEvents = [];
        }
      }
      const updatedOpportunities = [...state.market.opportunities];
      updatedOpportunities.splice(oppIndex, 1);

      const contracts = { ...state.entities.contracts };
      newContracts.forEach(c => { contracts[c.id as ContractId] = c; });

      return {
        gameState: {
          ...state,
          finance: { ...state.finance, cash: state.finance.cash - cost - talentFees },
          entities: {
            ...state.entities,
            projects: { ...state.entities.projects, [project.id as ProjectId]: project },
            contracts
          },
          market: {
            ...state.market,
            opportunities: updatedOpportunities
          },
          rngState: rng.getState()
        }
      };
    });
  },

  placeBid: (oppId, amount) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const oppIndex = state.market.opportunities.findIndex(o => (o.id as any) === oppId);
      if (oppIndex === -1) return s;

      const opp = state.market.opportunities[oppIndex];
      if (state.finance.cash < amount) return s;

      const updatedBids = { ...opp.bids, PLAYER: { amount, terms: 'standard' } };
      const bidHistory = [...(opp.bidHistory || []), { rivalId: 'PLAYER' as StudioId, amount, week: state.week }];
      
      let nextState = {
        ...state,
        market: {
          ...state.market,
          opportunities: state.market.opportunities.map(o => 
            (o.id as any) === oppId ? { ...o, bids: updatedBids, highestBidderId: 'PLAYER', bidHistory } : o
          )
        }
      };

      const rng = new RandomGenerator(state.rngState);
      const aggressiveRivals = Object.values(state.entities.rivals).filter(r => r.cash > amount * 1.5 && r.prestige > 40);
      
      if (aggressiveRivals.length > 0) {
        const rivalIdx = Math.floor(rng.next() * aggressiveRivals.length);
        const rival = aggressiveRivals[rivalIdx];
        const counterImpact = calculateLiveCounterBid(opp, amount, rival, rng, state.week);
        
        if (counterImpact) {
          nextState = applyStateImpact(nextState, [counterImpact]);
        }
      }

      nextState.rngState = rng.getState();
      return { gameState: nextState };
    });
  }
});

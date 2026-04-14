import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { Contract, Opportunity, StateImpact, TalentPact, TalentRole, CharacterArchetype, Talent } from '@/engine/types';
import { buildProjectAndContracts, CreateProjectParams, applyStateImpact } from '../storeUtils';
import { calculateLiveCounterBid } from '@/engine/systems/ai/biddingEngine';
import { RandomGenerator } from '@/engine/utils/rng';
import { TalentAgentInteractionEngine } from '@/engine/systems/talent/talentAgentInteractions';

export interface TalentSlice {
  signContract: (talentId: string, projectId: string) => void;
  offerFirstLook: (talentId: string, duration: number, fee: number) => boolean;
  acquireOpportunity: (oppId: string) => void;
  placeBid: (oppId: string, amount: number) => void;
  getTalentFilmography: (talentId: string) => import('@/engine/types/talent.types').Talent['filmography'];
  getTalentCareerStats: (talentId: string) => { 
    careerGross: number; 
    highestSalaryMovie?: import('@/engine/types/talent.types').Talent['highestSalaryMovie']; 
    highestSalaryTv?: import('@/engine/types/talent.types').Talent['highestSalaryTv']; 
    starMeter: number; 
  } | null;
  calculateStarMeter: (talentId: string) => number;
  removeTalentFromProject: (talentId: string, projectId: string) => void;
}

export const createTalentSlice: StateCreator<GameStore, [], [], TalentSlice> = (set, get) => ({
  signContract: (talentId, projectId) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const talent = state.entities.talents[talentId];
      if (!talent) return s;
      
      const p = state.entities.projects[projectId];
      if (!p) return s;
      
      let finalFee = talent.fee;
      if (state.deals?.activeDeals?.some(d => d.talentId === talentId)) {
         finalFee = talent.fee * 0.5;
      }

      // Apply relationship bonus if talent has an agent
      let relationshipBonus = 0;
      if (talent.agentId) {
        const relationship = state.talentAgentRelationships[`${talentId}-${talent.agentId}`];
        if (relationship) {
          relationshipBonus = TalentAgentInteractionEngine.getLoyaltyBonus(relationship);
          // Apply loyalty bonus to reduce fee (max 20% reduction)
          finalFee = finalFee * (1 - (relationshipBonus / 100));
        }
      }
      
      const currentCash = state.finance.cash;
      if (currentCash < finalFee) return s;
      
      const rng = new RandomGenerator(state.rngState);
      
      const contract: Contract = {
        id: rng.uuid('CON'),
        projectId,
        talentId,
        fee: finalFee,
        ownerId: state.studio.id,
        backendPercent: talent.accessLevel === 'dynasty' ? 10 : 5,
        creativeControl: talent.accessLevel === 'dynasty' || talent.prestige > 85 ? true : undefined,
        sequelOption: talent.accessLevel === 'dynasty' || talent.prestige > 75 ? true : undefined,
        backendEscalator: talent.accessLevel === 'dynasty' ? 5 : undefined,
        role: (talent.role || 'actor') as TalentRole
      };
      
      const estimatedWeeks = 40; 
      const commitment: import('@/engine/types/talent.types').TalentCommitment = {
        projectId: p.id,
        projectTitle: p.title,
        startWeek: state.week,
        endWeek: state.week + (p.productionWeeks || estimatedWeeks),
        role: contract.role,
        format: p.format === 'film' ? 'feature' : (p.format === 'tv' ? 'series' : p.format as any)
      };

      const updatedTalent = {
        ...talent,
        commitments: [...(talent.commitments || []), commitment]
      };

      // Update relationship after successful signing
      const updatedRelationships = { ...state.talentAgentRelationships };
      if (talent.agentId) {
        const relationshipId = `${talentId}-${talent.agentId}`;
        const relationship = updatedRelationships[relationshipId];
        if (relationship) {
          updatedRelationships[relationshipId] = TalentAgentInteractionEngine.updateRelationship(
            relationship,
            true,
            finalFee
          );
        }
      }

      return {
        gameState: {
          ...state,
          finance: {
            ...state.finance,
            cash: currentCash - finalFee
          },
          entities: {
            ...state.entities,
            contracts: { ...state.entities.contracts, [contract.id]: contract },
            talents: { ...state.entities.talents, [talentId]: updatedTalent }
          },
          talentAgentRelationships: updatedRelationships,
          rngState: rng.getState()
        }
      };
    });
  },

  offerFirstLook: (talentId, duration, fee) => {
    let success = false;
    set((s) => {
      const state = s.gameState;
      if (!state) return s;
      
      const talent = state.entities.talents[talentId];
      if (!talent) return s;
      
      const lockFee = fee || (talent.fee * 2);
      if (state.finance.cash < lockFee) return s;
      
      const rng = new RandomGenerator(state.rngState);
      const acceptanceChance = 70; 
      const accepted = (rng.next() * 100) <= acceptanceChance;
      
      if (accepted) {
          success = true;
          const deal: TalentPact = {
            id: rng.uuid('PCT'),
            talentId,
            studioId: 'PLAYER',
            type: 'first_look',
            startDate: state.week,
            endDate: state.week + duration,
            weeklyOverhead: Math.floor(lockFee * 0.05),
            exclusivity: true,
            status: 'active'
          };
          const currentDeals = state.deals?.activeDeals || [];
          const newNewsHistory = [...state.industry.newsHistory];
          newNewsHistory.unshift({
            id: rng.uuid('NWS'),
            week: state.week,
            type: 'STUDIO_EVENT' as const,
            headline: `${talent.name} signs first-look pact with ${state.studio.name}.`,
            description: `${talent.name} has signed an exclusive first-look deal.`,
          });
          
          return {
            gameState: {
              ...state,
              finance: { ...state.finance, cash: state.finance.cash - lockFee },
              deals: {
                ...state.deals,
                activeDeals: [...currentDeals, deal]
              },
              industry: {
                ...state.industry,
                newsHistory: newNewsHistory,
              },
              rngState: rng.getState()
            }
          };
       } else {
          const newNewsHistory = [...state.industry.newsHistory];
          newNewsHistory.unshift({
            id: rng.uuid('NWS'),
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
              },
              rngState: rng.getState()
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
      const rng = new RandomGenerator(state.rngState);

      let currentHighest = 0;
      if (opp.bids) {
        for (const bidId in opp.bids) {
          if (Object.prototype.hasOwnProperty.call(opp.bids, bidId)) {
            currentHighest = Math.max(currentHighest, opp.bids[bidId].amount || 0);
          }
        }
      }

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
      newContracts.forEach(c => { contracts[c.id] = c; });

      return {
        gameState: {
          ...state,
          finance: { ...state.finance, cash: state.finance.cash - cost - talentFees },
          entities: {
            ...state.entities,
            projects: { ...state.entities.projects, [project.id]: project },
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

      const oppIndex = state.market.opportunities.findIndex(o => o.id === oppId);
      if (oppIndex === -1) return s;

      const opp = state.market.opportunities[oppIndex];
      if (state.finance.cash < amount) return s;

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

      const rng = new RandomGenerator(state.rngState);
      const aggressiveRivals: RivalStudio[] = [];
      const rivals = state.entities.rivals;
      for (const rid in rivals) {
        if (Object.prototype.hasOwnProperty.call(rivals, rid)) {
          const r = rivals[rid];
          if (r.cash > amount * 1.5 && r.prestige > 40) {
            aggressiveRivals.push(r);
          }
        }
      }
      
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
  },

  getTalentFilmography: (talentId) => {
    const s = get();
    if (!s.gameState) return [] as import('@/engine/types/talent.types').Talent['filmography'];
    const talent = s.gameState.entities.talents[talentId];
    return (talent?.filmography || []) as import('@/engine/types/talent.types').Talent['filmography'];
  },

  getTalentCareerStats: (talentId) => {
    const s = get();
    if (!s.gameState) return null;
    const talent = s.gameState.entities.talents[talentId];
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
    const talent = s.gameState.entities.talents[talentId];
    if (!talent) return 50;

    const filmography = talent.filmography || [];
    const recentProjects = filmography.slice(0, 3);
    const momentum = recentProjects.length > 0
      ? recentProjects.reduce((sum, p) => sum + (p.gross > 50000000 ? 100 : 50), 0) / recentProjects.length
      : 50;

    return Math.floor((talent.prestige * 0.4) + (talent.draw * 0.4) + (momentum * 0.2));
  },

  removeTalentFromProject: (talentId, projectId) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const talent = state.entities.talents[talentId];
      if (!talent) return s;

      const project = state.entities.projects[projectId];
      if (!project) return s;

      // 🌌 PHASE 2: Apply 20% reshoot penalty if in production
      let penalty = 0;
      if (project.state === 'production') {
        penalty = Math.floor(project.budget * 0.20);
      }

      const updatedContracts = { ...state.entities.contracts };
      for (const id in updatedContracts) {
        if (!Object.prototype.hasOwnProperty.call(updatedContracts, id)) continue;
        const c = updatedContracts[id];
        if (c.talentId === talentId && c.projectId === projectId) {
          delete updatedContracts[id];
        }
      }

      const updatedCommitments = (talent.commitments || []).filter(
        c => c.projectId !== projectId
      );

      const updatedTalent = {
        ...talent,
        commitments: updatedCommitments
      };

      return {
        gameState: {
          ...state,
          finance: {
            ...state.finance,
            cash: state.finance.cash - penalty
          },
          entities: {
            ...state.entities,
            talents: { ...state.entities.talents, [talentId]: updatedTalent },
            contracts: updatedContracts
          }
        }
      };
    });
  },
});

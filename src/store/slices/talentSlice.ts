import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { Contract, Opportunity, StateImpact, Talent, TalentPact, TalentCommitment, TalentRole, RivalStudio, CharacterArchetype, FilmProject, SeriesProject } from '@/engine/types';
import { type TalentId, type ProjectId, type ContractId, type StudioId, type PactId, type NewsId } from '@/engine/types/shared.types';
import { buildProjectAndContracts, CreateProjectParams, applyStateImpact } from '../storeUtils';
import { calculateLiveCounterBid } from '@/engine/systems/ai/biddingEngine';
import { RandomGenerator } from '@/engine/utils/rng';
import { addContractToIndex, addContractsToIndex, removeContractsByTalentFromIndex, addContractToTalentIndex, addContractsToTalentIndex, removeContractsByProjectFromTalentIndex } from '@/engine/utils';
import { TalentAgentInteractionEngine } from '@/engine/systems/talent/talentAgentInteractions';

export interface TalentSlice {
  signContract: (talentId: string, projectId: string) => void;
  offerFirstLook: (talentId: string, duration: number, fee: number) => boolean;
  removeTalentFromProject: (talentId: string, projectId: string) => void;
  signBreakoutTalent: (talentId: string, premiumFee: number) => void;
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

      const talent = state.entities.talents[talentId];
      if (!talent) return s;
      
      const p = state.entities.projects[projectId];
      if (!p) return s;
      
      let finalFee = talent.fee;
      if (state.deals?.activeDeals?.some((d: any) => d.talentId === talentId)) {
         finalFee = talent.fee * 0.5;
      }

      let relationshipBonus = 0;
      if (talent.agentId) {
        const relationship = state.talentAgentRelationships?.[`${talentId}-${talent.agentId}`];
        if (relationship) {
          relationshipBonus = TalentAgentInteractionEngine.getLoyaltyBonus(relationship as any);
          finalFee = finalFee * (1 - (relationshipBonus / 100));
        }
      }
      
      const currentCash = state.finance.cash;
      if (currentCash < finalFee) return s;
      
      const rng = new RandomGenerator(state.rngState ?? state.gameSeed);
      
      const contract: Contract = {
        id: rng.uuid('CON') as ContractId,
        projectId,
        talentId,
        fee: finalFee,
        ownerId: state.studio.id as StudioId,
        backendPercent: talent.accessLevel === 'dynasty' ? 10 : 5,
        creativeControl: talent.accessLevel === 'dynasty' || talent.prestige > 85 ? true : undefined,
        sequelOption: talent.accessLevel === 'dynasty' || talent.prestige > 75 ? true : undefined,
        backendEscalator: talent.accessLevel === 'dynasty' ? 5 : undefined,
        role: (talent.role || 'actor') as TalentRole
      };
      
      const estimatedWeeks = 40; 
      const role: string = contract.role || 'actor';
      const commitment: TalentCommitment = {
        projectId,
        projectTitle: p.title,
        startWeek: state.week,
        endWeek: state.week + (p.productionWeeks || estimatedWeeks),
        role,
        format: p.format === 'film' ? 'feature' : (p.format === 'tv' ? 'series' : 'unscripted')
      };

      const updatedTalent: Talent = {
        ...talent,
        commitments: [...(talent.commitments || []), commitment]
      };

      const updatedRelationships = { ...state.talentAgentRelationships } as Record<string, any>;
      if (talent.agentId) {
        const relationshipId = `${talentId}-${talent.agentId}`;
        const relationship = updatedRelationships[relationshipId];
        if (relationship) {
          updatedRelationships[relationshipId] = TalentAgentInteractionEngine.updateRelationship(
            relationship as any,
            true,
            finalFee
          );
        }
      }

      const contracts = { ...state.entities.contracts };
      contracts[contract.id] = contract;

      const talents = { ...state.entities.talents };
      talents[talentId] = updatedTalent;

      const newIndex = addContractToIndex(state.entities.contractsByProjectId, projectId, contract.id);
      const newTalentIndex = addContractToTalentIndex(state.entities.contractsByTalentId, talentId, contract.id);

      return {
        gameState: {
          ...state,
          finance: {
            ...state.finance,
            cash: currentCash - finalFee
          },
          entities: {
            ...state.entities,
            contracts,
            talents,
            contractsByProjectId: newIndex,
            contractsByTalentId: newTalentIndex
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
      
      const rng = new RandomGenerator(state.rngState ?? state.gameSeed);
      const acceptanceChance = 70; 
      const accepted = (rng.next() * 100) <= acceptanceChance;
      
      if (accepted) {
          success = true;
          const deal: TalentPact = {
            id: rng.uuid('PCT') as PactId,
            talentId,
            studioId: 'PLAYER' as StudioId,
            type: 'first_look',
            startDate: state.week,
            endDate: state.week + duration,
            weeklyOverhead: Math.floor(lockFee * 0.05),
            exclusivity: true,
            status: 'active'
          };
          const newNewsHistory = [...state.industry.newsHistory];
          newNewsHistory.unshift({
            id: rng.uuid('NWS') as NewsId,
            week: state.week,
            type: 'STUDIO_EVENT' as const,
            headline: `${talent.name} signs first-look pact with ${state.studio.name}.`,
            description: `${talent.name} has signed an exclusive first-look deal.`,
          });
          
          const currentDeals = state.deals?.activeDeals || [];
          return {
            gameState: {
              ...state,
              finance: { ...state.finance, cash: state.finance.cash - lockFee },
              deals: {
                ...state.deals,
                activeDeals: [...currentDeals, deal]
              } as any,
              industry: {
                ...state.industry,
                newsHistory: newNewsHistory,
              },
              rngState: rng.getState()
            } as any
          };
       } else {
          const newNewsHistory = [...state.industry.newsHistory];
          newNewsHistory.unshift({
            id: rng.uuid('NWS') as NewsId,
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

  removeTalentFromProject: (talentId, projectId) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const talent = state.entities.talents[talentId];
      if (!talent) return s;

      const project = state.entities.projects[projectId];
      if (!project) return s;

      let penalty = 0;
      if (project.state === 'production') {
        penalty = Math.floor(project.budget * 0.20);
      }

      const { index: newIndex, removedIds } = removeContractsByTalentFromIndex(
        state.entities.contractsByProjectId,
        state.entities.contracts,
        projectId,
        talentId
      );
      const { index: newTalentIndex } = removeContractsByProjectFromTalentIndex(
        state.entities.contractsByTalentId,
        state.entities.contracts,
        projectId,
        talentId
      );

      const updatedContracts = { ...state.entities.contracts };
      removedIds.forEach(id => delete updatedContracts[id]);

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
            contracts: updatedContracts,
            contractsByProjectId: newIndex,
            contractsByTalentId: newTalentIndex
          }
        }
      };
    });
  },

  signBreakoutTalent: (talentId, premiumFee) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;
      const talent = state.entities.talents[talentId];
      if (!talent) return s;
      if (state.finance.cash < premiumFee) return s;
      const rng = new RandomGenerator(state.rngState ?? state.gameSeed);
      const deal: TalentPact = {
        id: rng.uuid('PCT') as PactId,
        talentId,
        studioId: 'PLAYER' as StudioId,
        type: 'first_look',
        startDate: state.week,
        endDate: state.week + 52,
        weeklyOverhead: Math.floor(premiumFee * 0.02),
        exclusivity: true,
        status: 'active'
      };
      const updatedTalent = { ...talent, fee: premiumFee };
      const currentDeals = state.deals?.activeDeals || [];
      const newsEntry = {
        id: rng.uuid('NWS'),
        week: state.week,
        type: 'STUDIO_EVENT' as const,
        headline: `${state.studio.name} wins bidding war, signs breakout star ${talent.name}.`,
        description: `${talent.name} signed amid heavy rival interest.`,
      };
      return {
        gameState: {
          ...state,
          finance: { ...state.finance, cash: state.finance.cash - premiumFee },
          entities: { ...state.entities, talents: { ...state.entities.talents, [talentId]: updatedTalent } },
          deals: { ...state.deals, activeDeals: [...currentDeals, deal] } as any,
          industry: { ...state.industry, newsHistory: [newsEntry, ...state.industry.newsHistory] },
          rngState: rng.getState()
        } as any
      };
    });
  },

  acquireOpportunity: (oppId) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const oppIndex = state.market.opportunities.findIndex(o => (o.id as any) === oppId);
      if (oppIndex === -1) return s;

      const opp = state.market.opportunities[oppIndex];
      const rng = new RandomGenerator(state.rngState ?? state.gameSeed);
      let currentHighest = 0;
      if (opp.bids) {
        for (const bidId in opp.bids) {
          if (opp.bids[bidId].amount > currentHighest) {
            currentHighest = opp.bids[bidId].amount;
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

      const { project, newContracts, talentFees } = buildProjectAndContracts(state, params);

      if (params.format !== 'unscripted') {
        const roles: CharacterArchetype[] = ['protagonist', 'antagonist', 'mentor', 'love_interest'];
        const activeRoles: CharacterArchetype[] = roles.slice(0, project.budgetTier === 'blockbuster' ? 4 : 3);
        
        if (project.type === 'FILM') {
           const film = project as FilmProject;
           film.scriptHeat = 50;
           film.activeRoles = activeRoles;
           film.scriptEvents = [];
        } else if (project.type === 'SERIES') {
           const series = project as SeriesProject;
           series.scriptHeat = 50;
           series.activeRoles = activeRoles;
           series.scriptEvents = [];
        }
      }
      const updatedOpportunities = [...state.market.opportunities];
      updatedOpportunities.splice(oppIndex, 1);

      const contracts = { ...state.entities.contracts };
      newContracts.forEach(c => { contracts[c.id as ContractId] = c; });

      const newIndex = addContractsToIndex(state.entities.contractsByProjectId, newContracts);
      const newTalentIndex = addContractsToTalentIndex(state.entities.contractsByTalentId, newContracts);

      return {
        gameState: {
          ...state,
          finance: { ...state.finance, cash: state.finance.cash - cost - talentFees },
          entities: {
            ...state.entities,
            projects: { ...state.entities.projects, [project.id as ProjectId]: project },
            contracts,
            contractsByProjectId: newIndex,
            contractsByTalentId: newTalentIndex
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

      const studioId = state.studio.id as StudioId;
      const updatedBids = { ...opp.bids, [studioId]: { amount, terms: 'standard' } };
      const bidHistory = [...(opp.bidHistory || []), { rivalId: studioId, amount, week: state.week }];
      
      let nextState = {
        ...state,
        market: {
          ...state.market,
          opportunities: state.market.opportunities.map(o => 
            (o.id as any) === oppId ? { ...o, bids: updatedBids, highestBidderId: studioId, bidHistory } : o
          )
        }
      };

      const rng = new RandomGenerator(state.rngState ?? state.gameSeed);
      const aggressiveRivals: RivalStudio[] = [];
      for (const rId in state.entities.rivals) {
        const r = state.entities.rivals[rId];
        if (r.cash > amount * 1.5 && r.prestige > 40) {
          aggressiveRivals.push(r);
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
    if (!s.gameState) return [];
    const talent = s.gameState.entities.talents[talentId];
    return talent?.filmography || [];
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
});

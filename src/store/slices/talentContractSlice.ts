import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { Contract, TalentPact, TalentRole, Talent } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';
import { TalentAgentInteractionEngine } from '@/engine/systems/talent/talentAgentInteractions';

export interface TalentContractSlice {
  signContract: (talentId: string, projectId: string) => void;
  offerFirstLook: (talentId: string, duration: number, fee: number) => boolean;
  removeTalentFromProject: (talentId: string, projectId: string) => void;
}

export const createTalentContractSlice: StateCreator<GameStore, [], [], TalentContractSlice> = (set, get) => ({
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

      let relationshipBonus = 0;
      if (talent.agentId) {
        const relationship = state.talentAgentRelationships[`${talentId}-${talent.agentId}`];
        if (relationship) {
          relationshipBonus = TalentAgentInteractionEngine.getLoyaltyBonus(relationship);
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

      const updatedContracts = { ...state.entities.contracts };
      Object.keys(updatedContracts).forEach(id => {
        const c = updatedContracts[id];
        if (c.talentId === talentId && c.projectId === projectId) {
          delete updatedContracts[id];
        }
      });

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
  }
});

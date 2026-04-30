import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { CreateProjectParams, buildProjectAndContracts, applyStateImpact } from '../storeUtils';
import { RandomGenerator } from '@/engine/utils/rng';
import { Project, GameState, SeriesProject } from '@/engine/types';
import { type ProjectId } from '@/engine/types/shared.types';

export interface ProjectCreationSlice {
  createProject: (params: CreateProjectParams) => void;
  renewProject: (id: ProjectId) => void;
}

export const createProjectCreationSlice: StateCreator<GameStore, [], [], ProjectCreationSlice> = (set) => ({
  createProject: (params) => {
    set((s) => {
      if (!s.gameState) return s;
      const rng = new RandomGenerator(s.gameState.rngState);
      const { project, newContracts, talentFees } = buildProjectAndContracts(s.gameState, params, rng);
      
      const stateWithFees = applyStateImpact(s.gameState, {
        type: 'FUNDS_DEDUCTED',
        payload: { amount: talentFees }
      });

      const contracts = { ...stateWithFees.entities.contracts };
      newContracts.forEach(c => { contracts[c.id] = c; });

      return {
        gameState: {
          ...stateWithFees,
          entities: {
            ...stateWithFees.entities,
            projects: { ...stateWithFees.entities.projects, [project.id]: project },
            contracts: { ...stateWithFees.entities.contracts, ...newContracts.reduce((acc, c) => ({ ...acc, [c.id]: c }), {}) }
          },
          rngState: rng.getState()
        }
      };
    });
  },

  renewProject: (id) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const p = state.entities.projects[id as ProjectId];
      if (!p) return s;

      if (p.type === 'SERIES') {
        const tv = (p as SeriesProject).tvDetails;
        if (tv && tv.status === 'RENEWED') {
          const nextSeason = (tv.currentSeason || 1) + 1;
          return {
            gameState: applyStateImpact(state, [{
              type: 'PROJECT_UPDATED',
              payload: {
                projectId: id,
                update: {
                  state: 'development',
                  accumulatedCost: 0,
                  releaseWeek: null,
                  buzz: 0,
                  revenue: 0,
                  weeklyRevenue: 0,
                  weeksInPhase: 0,
                  developmentWeeks: 0,
                  productionWeeks: 0,
                  tvDetails: {
                    ...tv,
                    currentSeason: nextSeason,
                    episodesAired: 0,
                    status: 'IN_DEVELOPMENT'
                  }
                }
              }
            }])
          };
        }
      }
      return s;
    });
  }
});

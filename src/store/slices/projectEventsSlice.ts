import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { applyStateImpact } from '../storeUtils';
import { resolveCrisis } from '@/engine/systems/crises';
import * as festivalsEngine from '@/engine/systems/festivals';
import { releaseDirectorsCut } from '@/engine/systems/ratings/directorsCuts';
import { RandomGenerator } from '@/engine/utils/rng';
import { Project, GameState, AwardBody, MarketingCampaign } from '@/engine/types';

export interface ProjectEventsSlice {
  resolveProjectCrisis: (projectId: string, optionIndex: number) => void;
  submitToFestival: (projectId: string, festivalBody: AwardBody) => void;
  lockMarketingCampaign: (projectId: string, level: 'none' | 'basic' | 'blockbuster') => void;
  releaseDirectorsCutAction: (projectId: string) => void;
  resolveMerger: (accept: boolean, attackerId: string, targetId: string, offerAmount: number) => void;
}

export const createProjectEventsSlice: StateCreator<GameStore, [], [], ProjectEventsSlice> = (set, get) => ({
  resolveProjectCrisis: (projectId, optionIndex) => {
    const state = get().gameState;
    if (!state) return;

    const project = state.entities.projects[projectId];
    if (!project) return;

    const rng = new RandomGenerator(state.rngState); 
    const impact = resolveCrisis(state, project.id, optionIndex, rng);
    const newState = applyStateImpact(state, impact);
    newState.rngState = rng.getState();
    set({ gameState: newState });
  },

  submitToFestival: (projectId, festivalBody) => {
    set((s) => {
      if (!s.gameState) return s;
      const rng = new RandomGenerator(s.gameState.rngState);
      const impact = festivalsEngine.submitToFestival(s.gameState, projectId, festivalBody, rng);
      if (!impact) return s;
      const newState = applyStateImpact(s.gameState, impact);
      newState.rngState = rng.getState();
      return { gameState: newState };
    });
  },

  releaseDirectorsCutAction: (projectId) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;
      const project = state.entities.projects[projectId];
      if (!project) return s;
      const rng = new RandomGenerator(state.rngState);
      const contractsArr = Object.values(state.entities.contracts || {});
      const directorContract = contractsArr.find(c => c.projectId === projectId && c.role === 'director');
      const directorId = directorContract?.talentId ?? null;
      const impacts = releaseDirectorsCut(project, directorId, rng);
      const newState = applyStateImpact(state, impacts);
      newState.rngState = rng.getState();
      return { gameState: newState };
    });
  },

  resolveMerger: (accept, attackerId, targetId, offerAmount) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;
      if (accept) {
        const newState = applyStateImpact(state, [
          {
            type: 'FUNDS_CHANGED',
            payload: { amount: offerAmount }
          },
          {
            type: 'INDUSTRY_UPDATE',
            payload: { mergedRivalId: targetId, acquirerId: attackerId }
          }
        ]);
        return { gameState: newState };
      }
      return s;
    });
  },

  lockMarketingCampaign: (projectId, level) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const project = state.entities.projects[projectId];
      if (!project) return s;
      
      let cost = 0;
      let buzzGain = 0;

      if (level === 'basic') {
        cost = Math.floor(project.budget * 0.10);
        buzzGain = 15;
      } else if (level === 'blockbuster') {
        cost = Math.floor(project.budget * 0.50);
        buzzGain = 40;
      }

      const campaign: MarketingCampaign = {
        primaryAngle: 'SELL_THE_STORY',
        domesticBudget: cost * 0.6,
        foreignBudget: cost * 0.4,
        weeksInMarketing: 1
      };

      return {
        gameState: applyStateImpact(state, [
          {
            type: 'FUNDS_DEDUCTED',
            payload: { amount: cost }
          },
          {
            type: 'PROJECT_UPDATED',
            payload: {
              projectId,
              update: {
                marketingLevel: level,
                marketingBudget: cost,
                marketingCampaign: campaign,
                buzz: Math.min(100, project.buzz + buzzGain),
                state: project.state === 'marketing' ? 'released' : project.state
              }
            }
          }
        ])
      };
    });
  }
});

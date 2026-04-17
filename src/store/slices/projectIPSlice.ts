import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { CreateProjectParams, buildProjectAndContracts, applyStateImpact } from '../storeUtils';
import { generateSpinoffProposal } from '@/engine/systems/ip/spinoffFactory';
import { calculateFranchiseFatigue } from '@/engine/systems/ip/fatigueEngine';
import { RandomGenerator } from '@/engine/utils/rng';
import { Project, GameState, StateImpact } from '@/engine/types';

export interface ProjectIPSlice {
  exploitFranchise: (projectId: string) => void;
  acquireAndRebootIP: (ipAssetId: string) => void;
}

export const createProjectIPSlice: StateCreator<GameStore, [], [], ProjectIPSlice> = (set, get) => ({
  exploitFranchise: (projectId) => {
    const state = get().gameState;
    if (!state) return;

    const project = state.entities.projects[projectId];
    if (!project) return;

    let status: 'HEALTHY' | 'FATIGUED' | 'LEGACY' = 'HEALTHY';
    let relatedCount = 0;

    if (project.franchiseId && state.ip.franchises[project.franchiseId]) {
      const franchise = state.ip.franchises[project.franchiseId];
      relatedCount = franchise.assetIds.length;
      
      let genreSaturation = 0;
      for (const key in state.entities.projects) {
        if (!Object.prototype.hasOwnProperty.call(state.entities.projects, key)) continue;
        if (state.entities.projects[key].genre === project.genre) {
          genreSaturation++;
        }
      }
      const fatigue = calculateFranchiseFatigue(franchise, genreSaturation, project.genre);
      
      if (fatigue > 0.4) status = 'FATIGUED';
      
      const lastRelease = Math.max(...franchise.lastReleaseWeeks, 0);
      if (state.week - lastRelease > 520) status = 'LEGACY';
    }

    const rng = new RandomGenerator(state.rngState);
    const sourceAsset = state.ip.vault.find(a => a.originalProjectId === project.id);
    const spinoffParams = generateSpinoffProposal(rng, project, status, relatedCount, sourceAsset);
    
    const finalParams = {
      ...spinoffParams,
      franchiseId: project.franchiseId
    } as CreateProjectParams;

    get().createProject(finalParams);
  },

  acquireAndRebootIP: (ipAssetId) => {
    set((s) => {
      const state = s.gameState;
      if (!state) return s;

      const asset = state.ip.vault.find(a => a.id === ipAssetId);
      if (!asset || asset.rightsOwner !== 'MARKET') return s;

      if (state.finance.cash < asset.baseValue) {
        return s;
      }

      const rebootParams: CreateProjectParams = {
        title: `${asset.title}`,
        format: 'film',
        genre: 'DRAMA',
        budgetTier: asset.baseValue > 100000000 ? 'blockbuster' : 'high',
        targetAudience: 'GENERAL',
        flavor: 'reboot',
        franchiseId: asset.franchiseId,
        initialBuzzBonus: Math.floor(asset.decayRate * 50) + 20
      };

      const rng = new RandomGenerator(state.rngState);
      const { project, newContracts } = buildProjectAndContracts(state, rebootParams, rng);

      const impacts: StateImpact[] = [
        {
          type: 'FUNDS_DEDUCTED' as const,
          payload: { amount: asset.baseValue }
        },
        {
          type: 'NEWS_ADDED' as const,
          payload: {
            id: rng.uuid('NWS'),
            headline: `STUDIO ACQUIRES "${asset.title}" RIGHTS`,
            description: `Major industry shift as rights for the classic property return to production slate.`
          }
        }
      ];

      const intermediateState = applyStateImpact(state, impacts);

      const contracts = { ...intermediateState.entities.contracts };
      newContracts.forEach(c => { contracts[c.id] = c; });

      return {
        gameState: {
          ...intermediateState,
          ip: {
            ...intermediateState.ip,
            vault: state.ip.vault.map(a => a.id === ipAssetId ? { ...a, rightsOwner: 'STUDIO' as const } : a)
          },
          entities: {
            ...intermediateState.entities,
            projects: { ...intermediateState.entities.projects, [project.id]: project },
            contracts
          },
          rngState: rng.getState()
        }
      };
    });
  }
});

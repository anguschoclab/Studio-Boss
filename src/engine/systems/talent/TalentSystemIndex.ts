import { GameState, Talent, Project, Contract, Award } from '@/engine/types';
import { StateImpact } from '../../types/state.types';
import { RandomGenerator } from '../../utils/rng';
import { BardResolver } from '../bardResolver';
import { advanceTalentLifecycle } from './LifecycleModule';
import { advanceOpportunityLifecycle } from './OpportunityModule';
import { applyProjectResults } from './PerformanceModule';

export const TalentSystem = {
  advance(state: GameState, rng: RandomGenerator): StateImpact {
    const talentUpdates = advanceTalentLifecycle(state, rng);
    const { updatedOpportunities, uiNotifications } = advanceOpportunityLifecycle(state, rng);
    
    const notificationsWithBard = uiNotifications.map(msg => 
      BardResolver.resolve({
        domain: 'Talent',
        subDomain: 'Health',
        intensity: 50,
        context: { message: msg },
        rng
      })
    );

    return {
      type: 'SYSTEM_TICK',
      newOpportunities: updatedOpportunities,
      talentUpdates,
      uiNotifications: notificationsWithBard
    };
  },

  applyProjectResults(
    project: Project,
    contracts: Contract[],
    talentPool: Record<string, Talent> | Talent[],
    projectAwards: Award[] = []
  ): Talent[] {
    return applyProjectResults(project, contracts, talentPool, projectAwards);
  }
};

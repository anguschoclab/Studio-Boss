import { GameState } from '../../types';
import { TickContext, WeekFilter } from './types';

// System Imports
import { tickProduction } from '../../systems/productionEngine';
import { ProductionProjectProcessor } from './ProductionProjectProcessor';
import { tickTelevision } from '../../systems/television/televisionTick';
import { calculateFranchiseEvolutionImpacts, tickIPVault } from '../../systems/ip/franchiseCoordinator';
import { SchedulingEngine } from '../../systems/schedulingEngine';

/**
 * Production Filter
 * Handles project production logic including script drafting, crises, and release simulation
 */
export class ProductionFilter implements WeekFilter {
  name = 'ProductionFilter';

  execute(state: GameState, context: TickContext): void {
    context.impacts.push(...tickProduction(state, context.rng));

    const projectsObj = state.entities.projects || {};
    for (const key in projectsObj) {
      if (!Object.prototype.hasOwnProperty.call(projectsObj, key)) continue;
      const project = projectsObj[key];
      ProductionProjectProcessor.processProject(project, state, context);
    }

    context.impacts.push(...tickTelevision(state, context.rng));
    context.impacts.push(...calculateFranchiseEvolutionImpacts(state, context.rng));
    context.impacts.push(...tickIPVault(state));
    context.impacts.push(...SchedulingEngine.tick(state, context.rng));
  }
}

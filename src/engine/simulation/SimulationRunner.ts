import { GameState, StateImpact, WeekSummary } from '../types';
import { initializeGame } from '../core/gameInit';
import { WeekCoordinator } from '../services/WeekCoordinator';
import { TalentLifecycleSystem } from '../systems/talent/TalentLifecycleSystem';
import { HeadlessController } from './HeadlessController';
import { MetricsCollector } from './MetricsCollector';
import { RandomGenerator } from '../utils/rng';
import { advanceProject } from '../systems/projects';
import { applyImpacts } from '../core/impactReducer';
import { StudioAutomation } from './StudioAutomation';

export interface SimulationResult {
  finalState: GameState;
  metrics: MetricsCollector;
}

/**
 * Simulation Runner
 * Orchestrates the headless execution of the Studio Boss engine.
 */
export class SimulationRunner {
  static run(
    weeks: number, 
    seed: number = 42, 
    archetype: any = 'major', 
    persona: string = 'balanced',
    autoPilot: boolean = true
  ): SimulationResult {
    const metrics = new MetricsCollector();
    let state = initializeGame('Headless Studio', archetype, seed);
    (state as any).persona = persona;
    
    // Initial record
    metrics.record(state, { fromWeek: 0, toWeek: 1 } as any);

    for (let i = 0; i < weeks; i++) {
      const rng = new RandomGenerator(state.gameSeed + state.week + (state.tickCount || 0));
      
      // 1. Core Engine Tick
      const { newState: steppedState, summary, impacts: engineImpacts } = WeekCoordinator.execute(state, rng);
      state = steppedState;

      // 3. Studio Automation (Greenlights, Pitches, Releases)
      // This handles the operational "blocking" states for both player and rivals
      const playerAutomation = autoPilot ? StudioAutomation.tick(state, rng, true) : [];
      const rivalAutomation = StudioAutomation.tick(state, rng, false);
      
      // 4. Headless Bidding/Buying for Player
      const playerBidding = autoPilot ? HeadlessController.tick(state, rng) : [];
      
      // 5. Talent Lifecycle (Aging/Retirement)
      const lifecycleImpacts = TalentLifecycleSystem.tick(state, rng);

      // 6. Consolidate and Apply All Side Impacts
      const allImpacts = [
          ...engineImpacts, 
          ...playerAutomation, 
          ...rivalAutomation, 
          ...playerBidding, 
          ...lifecycleImpacts
      ];
      state = applyImpacts(state, allImpacts);

      // 7. Update Metrics (Inject summary data for reporting)
      const retiredCount = allImpacts.filter(imp => imp.type === 'TALENT_REMOVED').length;
      (summary as any).retiredCount = retiredCount;
      
      metrics.record(state, summary);
    }

    return {
      finalState: state,
      metrics
    };
  }
}

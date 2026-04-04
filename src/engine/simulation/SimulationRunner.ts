import { GameState, StateImpact } from '@/engine/types';
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
    autoPilot: boolean = true
  ): SimulationResult {
    const metrics = new MetricsCollector();
    let state = initializeGame('Headless Studio', archetype, seed);
    
    // Initial record
    metrics.record(state, { fromWeek: 0, toWeek: 1 } as any);

    for (let i = 0; i < weeks; i++) {
      const rng = new RandomGenerator(state.gameSeed + state.week + (state.tickCount || 0));
      
      // 1. Core Engine Tick
      const { newState: steppedState, summary, impacts: engineImpacts } = WeekCoordinator.execute(state, rng);
      state = steppedState;

      // 2. Project Phase Advancement (The missing link)
      const advancementImpacts: StateImpact[] = [];
      const talentMap = new Map(Object.entries(state.industry.talentPool));
      
      // Player Projects
      Object.values(state.studio.internal.projects).forEach(project => {
        const contracts = state.studio.internal.contracts.filter(c => c.projectId === project.id);
        const { project: nextProject, update } = advanceProject(
          project, 
          state.week, 
          state.studio.prestige, 
          contracts, 
          talentMap as any, 
          rng
        );
        
        if (nextProject.state !== project.state || nextProject.weeksInPhase !== project.weeksInPhase) {
          advancementImpacts.push({
            type: 'PROJECT_UPDATED',
            payload: { projectId: project.id, update: nextProject }
          });
          if (update) {
            advancementImpacts.push({
              type: 'NEWS_ADDED',
              payload: { headline: update, description: '', category: 'general' }
            });
          }
        }
      });

      // Rival Projects
      state.industry.rivals.forEach(rival => {
        if (!rival.projects) return;
        Object.values(rival.projects).forEach(project => {
          const { project: nextProject } = advanceProject(
            project,
            state.week,
            rival.prestige,
            [], // Rivals have simplified contracts for now
            talentMap as any,
            rng
          );

          if (nextProject.state !== project.state || nextProject.weeksInPhase !== project.weeksInPhase) {
            advancementImpacts.push({
              type: 'RIVAL_UPDATED',
              payload: { 
                rivalId: rival.id, 
                update: { 
                  projects: { ...rival.projects, [project.id]: nextProject } 
                } 
              }
            });
          }
        });
      });

      // 3. Studio Automation (Greenlights, Pitches, Releases)
      // This handles the operational "blocking" states for both player and rivals
      const playerAutomation = autoPilot ? StudioAutomation.tick(state, rng, true) : [];
      const rivalAutomation = StudioAutomation.tick(state, rng, false);
      
      // 4. Headless Bidding/Buying for Player (Still use Controller for persona specific bidding)
      const playerBidding = autoPilot ? HeadlessController.tick(state, rng) : [];
      
      // 5. Talent Lifecycle (Aging/Retirement)
      const lifecycleImpacts = TalentLifecycleSystem.tick(state, rng);

      // 6. Consolidate and Apply All Side Impacts
      const allImpacts = [
          ...engineImpacts, 
          ...advancementImpacts, 
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

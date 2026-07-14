import { GameState, ArchetypeKey } from "../types";
import { initializeGame } from "../core/gameInit";
import { WeekCoordinator } from "../services/WeekCoordinator";
import { TalentLifecycleSystem } from "../systems/talent/TalentLifecycleSystem";
import { HeadlessController } from "./HeadlessController";
import { MetricsCollector } from "./MetricsCollector";
import { RandomGenerator } from "../utils/rng";
import { applyImpacts } from "../core/impactReducer";
import { StudioAutomation } from "./StudioAutomation";

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
    archetype: ArchetypeKey = "major",
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    persona: string = "balanced",
    autoPilot: boolean = true
  ): SimulationResult {
    const metrics = new MetricsCollector();
    let state = initializeGame("Headless Studio", archetype, seed);

    // Initial record
    metrics.record(state, {
      fromWeek: 0,
      toWeek: 1,
      activeProjects: 0,
      completedProjects: 0,
      revenue: 0,
      expenses: 0,
      net: 0,
      headlines: [],
    } as any);

    let cashLast = state.finance.cash || 0;
    const CASH_DEBUG = process.env.CASH_DEBUG === "1";
    for (let i = 0; i < weeks; i++) {
      const rng = new RandomGenerator(state.gameSeed + state.week + (state.tickCount || 0));

      // 1. Core Engine Tick
      const { newState: steppedState, summary } = WeekCoordinator.execute(state);
      state = steppedState;

      // 3. Studio Automation (Greenlights, Pitches, Releases)
      // Note: called ONCE; StudioAutomation.tick iterates every rival internally.
      const automationImpacts = StudioAutomation.tick(state, rng);

      // 4. Headless Bidding/Buying for Player
      const playerBidding = autoPilot ? HeadlessController.tick(state, rng) : [];

      // 5. Talent Lifecycle (Aging/Retirement). Applied BEFORE player bidding in the
      // batch so the player's attributeTalent prestige gains aren't stomped by the
      // yearly decay (both emit TALENT_UPDATED; last-writer-wins on shallow merge).
      const lifecycleImpacts = TalentLifecycleSystem.tick(state, rng);

      // 6. Consolidate and Apply side-effect impacts ONLY
      // Order: automation -> lifecycle -> player bidding (so attribution survives year-end decay).
      const allImpacts = [...automationImpacts, ...lifecycleImpacts, ...playerBidding];
      state = applyImpacts(state, allImpacts);
      if (CASH_DEBUG) {
        const now = state.finance.cash || 0;
        const delta = now - cashLast;
        if (Math.abs(delta) > 5_000_000) {
          console.log(
            `[CASH] w${state.week} cash=${(now / 1e6).toFixed(1)}M Δ=${(delta / 1e6).toFixed(1)}M`
          );
        }
        cashLast = now;
      }

      // 7. Update Metrics (Inject summary data for reporting)
      metrics.record(state, summary);
    }

    return {
      finalState: state,
      metrics,
    };
  }
}

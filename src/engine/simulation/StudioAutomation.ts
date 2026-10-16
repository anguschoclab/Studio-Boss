import { GameState, StateImpact } from "@/engine/types";
import { RandomGenerator } from "../utils/rng";
import { buildWorldAssessment } from "../systems/ai/WorldAssessment";
import { planRivalWeek } from "../systems/ai/rival/RivalBrain";
import { tickRivalSlate } from "../systems/ai/rival/RivalSlateExecutor";
import { RivalPlan } from "../systems/ai/rival/plan.types";

/**
 * StudioAutomation — compatibility shim for direct headless/test callers.
 *
 * The live weekly tick (WeekCoordinator) runs the unified rival slate
 * pipeline itself via tickRivalPlans + tickRivalSlate. This shim generates
 * the same weekly plans and executes them through the shared executor, so
 * there is exactly one rival project lifecycle in the engine.
 */
export class StudioAutomation {
  static tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const world = buildWorldAssessment(state);
    const plans: Record<string, RivalPlan> = {};
    const rivals = state.entities.rivals || {};
    for (const rid in rivals) {
      if (!rivals[rid]) continue;
      plans[rid] = planRivalWeek(rivals[rid], world, state, rng);
    }
    return tickRivalSlate(state, rng, plans);
  }
}

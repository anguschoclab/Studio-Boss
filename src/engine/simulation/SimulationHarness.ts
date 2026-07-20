import { GameState, ArchetypeKey } from "../types";
import { initializeGame } from "../core/gameInit";
import { advanceWeek } from "../core/weekAdvance";
import { RandomGenerator } from "../utils/rng";

export interface SimulationResult {
  finalState: GameState;
  durationWeeks: number;
  anomalies: string[];
  metrics: {
    totalIndustryCash: number;
    avgRivalCash: number;
    totalActiveProjects: number;
    marketShareConcentration: number; // HHI or similar
    talentBurnoutRate: number;
  }[];
}

/**
 * SimulationHarness: Headless execution engine for long-term stability testing.
 * Runs the simulation for a specified number of weeks without UI overhead.
 */
export class SimulationHarness {
  static run(
    studioName: string = "Stress Test Studios",
    archetype: ArchetypeKey = "major",
    weeks: number = 260,
    seed: number = 42
  ): SimulationResult {
    let state = initializeGame(studioName, archetype, seed);
    const anomalies: string[] = [];
    const metrics: SimulationResult["metrics"] = [];

    for (let w = 1; w <= weeks; w++) {
      try {
        const { newState } = advanceWeek(state);
        state = newState;

        let totalRivalCash = 0;
        let rivalProjectsCount = 0;
        let hhi = 0;
        let rivalsCount = 0;
        for (const rid in state.entities.rivals || {}) {
          const r = state.entities.rivals[rid];
          totalRivalCash += r.cash || 0;
          rivalProjectsCount += Object.keys(r.projects || {}).length;
          const ms = r.marketShare || 0;
          hhi += (ms * 100) ** 2;
          rivalsCount++;
        }

        // Collect Snapshot Metrics
        const totalIndustryCash = totalRivalCash + state.finance.cash;
        const totalProjects = Object.keys(state.entities.projects).length + rivalProjectsCount;

        // Talent Burnout Audit
        let talentPoolCount = 0;
        let burntOutCount = 0;
        for (const tid in state.entities.talents || {}) {
          const t = state.entities.talents[tid];
          talentPoolCount++;
          if ((t.fatigue ?? 0) > 80) burntOutCount++;
        }
        const burnoutRate = talentPoolCount > 0 ? burntOutCount / talentPoolCount : 0;

        metrics.push({
          totalIndustryCash,
          avgRivalCash: rivalsCount > 0 ? totalRivalCash / rivalsCount : 0,
          totalActiveProjects: totalProjects,
          marketShareConcentration: hhi,
          talentBurnoutRate: burnoutRate,
        });

        // Anomaly Detection
        if (state.finance.cash < -100_000_000) {
          anomalies.push(`Week ${w}: Player deep in debt ($${state.finance.cash})`);
        }
        if (totalProjects < 5) {
          anomalies.push(
            `Week ${w}: Industrial collapse warning - only ${totalProjects} projects in production`
          );
        }
        if (hhi > 4000) {
          anomalies.push(`Week ${w}: Monopolistic concentration detected (HHI: ${hhi.toFixed(0)})`);
        }

        if (w % 52 === 0) {
          const avgRivalCash = rivalsCount > 0 ? totalRivalCash / rivalsCount : 0;
          console.log(
            `📍 Week ${w} Milestone: Industry Cash ${(totalIndustryCash / 1e9).toFixed(2)}B | Avg Rival Cash ${(avgRivalCash / 1e6).toFixed(1)}M`
          );
        }
      } catch (error) {
        anomalies.push(
          `Week ${w}: CRITICAL ENGINE FAILURE - ${error instanceof Error ? error.message : String(error)}`
        );
        break;
      }
    }

    return {
      finalState: state,
      durationWeeks: state.week,
      anomalies,
      metrics,
    };
  }
}

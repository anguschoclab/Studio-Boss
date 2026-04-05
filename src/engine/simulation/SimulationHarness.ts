import { GameState, WeekSummary, ArchetypeKey } from '../types';
import { initializeGame } from '../core/gameInit';
import { advanceWeek } from '../core/weekAdvance';
import { RandomGenerator } from '../utils/rng';

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
    console.log(`🚀 Starting headles simulation stress test: ${weeks} weeks...`);
    
    let state = initializeGame(studioName, archetype, seed);
    const anomalies: string[] = [];
    const metrics: SimulationResult['metrics'] = [];

    for (let w = 1; w <= weeks; w++) {
      const rng = new RandomGenerator(state.gameSeed + w + state.tickCount);
      
      try {
        const { newState, summary } = advanceWeek(state, rng);
        state = newState;

        // Collect Snapshot Metrics
        const totalRivalCash = state.industry.rivals.reduce((sum, r) => sum + r.cash, 0);
        const totalIndustryCash = totalRivalCash + state.finance.cash;
        const totalProjects = state.industry.rivals.reduce((sum, r) => sum + Object.keys(r.projects).length, 0) + Object.keys(state.studio.internal.projects).length;
        
        // Calculate Market Share Concentration (HHI - Herfindahl-Hirschman Index)
        const marketShares = state.industry.rivals.map(r => r.marketShare || 0);
        const hhi = marketShares.reduce((sum, ms) => sum + (ms * 100) ** 2, 0);

        // Talent Burnout Audit
        const talentPool = Object.values(state.industry.talentPool);
        const burntOutCount = talentPool.filter(t => t.fatigue > 80).length;
        const burnoutRate = burntOutCount / talentPool.length;

        metrics.push({
          totalIndustryCash,
          avgRivalCash: totalRivalCash / state.industry.rivals.length,
          totalActiveProjects: totalProjects,
          marketShareConcentration: hhi,
          talentBurnoutRate: burnoutRate
        });

        // Anomaly Detection
        if (state.finance.cash < -100_000_000) {
            anomalies.push(`Week ${w}: Player deep in debt ($${state.finance.cash})`);
        }
        if (totalProjects < 5) {
            anomalies.push(`Week ${w}: Industrial collapse warning - only ${totalProjects} projects in production`);
        }
        if (hhi > 4000) {
            anomalies.push(`Week ${w}: Monopolistic concentration detected (HHI: ${hhi.toFixed(0)})`);
        }

        if (w % 52 === 0) {
            console.log(`📍 Week ${w} Milestone: Industry Cash $${(totalIndustryCash / 1e9).toFixed(2)}B | Avg Rival Cash $${( (totalRivalCash / state.industry.rivals.length) / 1e6).toFixed(1)}M`);
        }

      } catch (error) {
        anomalies.push(`Week ${w}: CRITICAL ENGINE FAILURE - ${error instanceof Error ? error.message : String(error)}`);
        break;
      }
    }

    console.log(`✅ Simulation Complete. Final State: Week ${state.week}. Total Anomalies: ${anomalies.length}`);

    return {
      finalState: state,
      durationWeeks: state.week,
      anomalies,
      metrics
    };
  }
}

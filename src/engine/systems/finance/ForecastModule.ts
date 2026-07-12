import { GameState } from "@/engine/types";
import { RandomGenerator } from "../../utils/rng";
import { getContractsByProjectId } from "../../utils";
import { generateWeeklyFinancialReport } from "./ReportsModule";

export function generateCashflowForecast(
  state: GameState,
  weeks: number = 12
): { week: number; projected: number }[] {
  // Use index to collect only contracts for released projects
  const releasedProjects = Object.values(state.entities.projects || {}).filter(
    (p) => p.state === "released"
  );
  const relevantContracts = releasedProjects.flatMap((p) =>
    getContractsByProjectId(
      state.entities?.contractsByProjectId,
      state.entities?.contracts || {},
      p.id
    )
  );

  const { report } = generateWeeklyFinancialReport(
    state,
    state.studio.id,
    state.entities.projects,
    state.finance.cash,
    state.studio.archetype,
    state.studio.prestige,
    relevantContracts,
    state.deals?.activeDeals || [],
    new RandomGenerator(state.gameSeed + state.week),
    []
  );
  const netProfit = report.netProfit;

  const forecast: { week: number; projected: number }[] = [];
  let runningCash = state.finance.cash;
  for (let i = 1; i <= weeks; i++) {
    runningCash += netProfit;
    forecast.push({ week: state.week + i, projected: runningCash });
  }
  return forecast;
}

import { GameState } from "@/engine/types";
import { RandomGenerator } from "../../utils/rng";
import { getContractsByProjectId } from "../../utils";
import { generateWeeklyFinancialReport } from "./ReportsModule";

export function generateCashflowForecast(
  state: GameState,
  weeks: number = 12
): { week: number; projected: number }[] {
  // ⚡ Bolt: Replace Object.values().filter().flatMap() with a direct for...in loop for relevant contracts
  const relevantContracts = [];
  const projects = state.entities.projects || {};
  for (const id in projects) {
    if (projects[id].state === "released") {
      relevantContracts.push(
        ...getContractsByProjectId(
          state.entities?.contractsByProjectId,
          state.entities?.contracts || {},
          id
        )
      );
    }
  }

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

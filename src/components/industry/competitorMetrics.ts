import {countPlayerProjects, countRivalProjects} from "@/engine/utils";
import {GameState, RivalStudio} from "@/engine/types";

export function computeRadarMetrics(
  gameState: GameState,
  studio: Pick<GameState["studio"], "prestige">,
  rivals: RivalStudio[]
) {
  const maxCash = Math.max(gameState.finance.cash, ...rivals.map((r) => r.cash)) || 1;
  const playerProjectCount = countPlayerProjects(gameState);
  const rivalProjectCounts = rivals.map((r) => countRivalProjects(gameState, r));
  const rivalProjectTotal = rivalProjectCounts.reduce((sum, n) => sum + n, 0);
  const maxProjects = Math.max(playerProjectCount, ...rivalProjectCounts) || 1;

  return [
    {
      metric: "Cash",
      player: (gameState.finance.cash / maxCash) * 100,
      avgRival:
        (rivals.reduce((sum, r) => sum + r.cash, 0) / (rivals.length || 1) / maxCash) * 100,
    },
    {
      metric: "Prestige",
      player: studio.prestige,
      avgRival: rivals.reduce((sum, r) => sum + r.prestige, 0) / (rivals.length || 1),
    },
    {
      metric: "Projects",
      player: (playerProjectCount / maxProjects) * 100,
      avgRival: (rivalProjectTotal / (rivals.length || 1) / maxProjects) * 100,
    },
    {
      metric: "Strength",
      player:
        rivals.length > 0
          ? 100 - rivals.reduce((sum, r) => sum + r.strength, 0) / rivals.length
          : 50,
      avgRival: 50,
    },
  ];
}

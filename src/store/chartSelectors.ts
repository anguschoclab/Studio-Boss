/**
 * Chart & Visualization Selectors
 *
 * Selectors that feed visualization components. Base game-state selectors
 * (entities, finance, talent) live in selectors.ts.
 */

import { GameState } from "../engine/types";
import { selectProjects } from "./selectors";
import { AWARD_CONFIGS } from "../engine/data/awards.data";

export interface AwardProbability {
  projectTitle: string;
  awardBody: string;
  category: string;
  probability: number;
}

/**
 * Awards probability data for AwardsProbabilityChart visualization
 */
export const selectAwardsProbability = (state: GameState | null): AwardProbability[] => {
  const projects = selectProjects(state);

  // ⚡ Bolt Optimization: Replaced chained .filter().flatMap() and nested .filter().map()
  // with a single-pass loop to eliminate temporary array allocations and reduce garbage
  // collection pressure during frequent chart selector re-evaluations.
  const probabilities: AwardProbability[] = [];

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    if (!project.awardsProfile) continue;

    const format = project.format;
    for (let j = 0; j < AWARD_CONFIGS.length; j++) {
      const config = AWARD_CONFIGS[j];
      if (config.format === format || config.format === "both") {
        const rawScore = config.evaluator(project);
        const probability = Math.min(100, Math.round(rawScore / 2));
        probabilities.push({
          projectTitle: project.title,
          awardBody: config.body,
          category: config.category,
          probability,
        });
      }
    }
  }
  return probabilities;
};

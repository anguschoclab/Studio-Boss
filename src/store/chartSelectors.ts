/**
 * Chart & Visualization Selectors
 *
 * Selectors that feed visualization components. Base game-state selectors
 * (entities, finance, talent) live in selectors.ts.
 */

import {GameState} from "../engine/types";
import {selectProjects} from "./selectors";
import {AWARD_CONFIGS} from "../engine/data/awards.data";

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
  const projects = selectProjects(state).filter((p) => p.awardsProfile);
  return projects.flatMap((project) => {
    const format = project.format;
    return AWARD_CONFIGS
      .filter((c) => c.format === format || c.format === "both")
      .map((config) => {
        const rawScore = config.evaluator(project);
        const probability = Math.min(100, Math.round(rawScore / 2));
        return {
          projectTitle: project.title,
          awardBody: config.body,
          category: config.category,
          probability,
        };
      });
  });
};

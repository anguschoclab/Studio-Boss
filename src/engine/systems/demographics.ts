import { Project, AudienceQuadrant, GameState } from "@/engine/types";

/**
 * Evaluates how strongly a project resonates with a specific marketing target audience.
 * Returns a score between 0.0 and 2.0 (where >1.0 means highly efficient reach).
 */
const GENRE_AFFINITIES: Record<string, Partial<Record<string, number>>> = {
  male: { Action: 0.3, "Sci-Fi": 0.3, Romance: -0.3 },
  female: { Romance: 0.3, Drama: 0.3, Action: -0.2 },
  under_25: { Horror: 0.4, Animation: 0.4, Documentary: -0.4, Historical: -0.4 },
  over_25: { Documentary: 0.2, Thriller: 0.2, Animation: -0.3 },
  four_quadrant: { Horror: -0.5, Documentary: -0.5 },
};

/**
 * Evaluates how strongly a project resonates with a specific marketing target audience.
 * Returns a score between 0.0 and 2.0 (where >1.0 means highly efficient reach).
 */
export function calculateAudienceIndex(project: Project, target: AudienceQuadrant): number {
  let index = 1.0;

  // Apply genre affinities from map
  const genre = project.genre;
  if (genre) {
    // Check specific quadrant affinities
    Object.entries(GENRE_AFFINITIES).forEach(([quadrant, affinities]) => {
      if (target === quadrant || target.includes(quadrant)) {
        const affinity = affinities[genre];
        if (affinity !== undefined) {
          index += affinity;
        }
      }
    });
  }

  if (target === "four_quadrant") {
    // Four quadrant requires high budget / broad appeal
    if (project.budgetTier === "blockbuster") index += 0.5;
    else if (project.budgetTier === "low") index -= 0.4;
  }

  // Content Rating affinity
  if (project.rating === "R" || project.rating === "NC-17") {
    if (target.includes("under_25") || target === "four_quadrant") {
      index -= 0.5; // Restricting access drops efficiency massively
    } else {
      index += 0.2; // Over_25 might actually like edgy content more
    }
  }

  if (project.rating === "G" || project.rating === "PG") {
    if (target.includes("over_25") && project.genre !== "Animation") {
      index -= 0.3; // Adults might find it boring
    }
  }

  return Math.max(0.1, Math.min(2.0, index));
}

/**
 * Executes a marketing push, spending cash to generate buzz.
 */
export function simulateMarketingCampaign(
  state: GameState,
  projectId: string,
  spend: number,
  target: AudienceQuadrant
): GameState {
  const project = state.entities.projects[projectId];

  if (!project || state.finance.cash < spend) return state;

  // Calculate how much buzz this spend buys
  const baseBuzzGain = spend / 100_000; // 1 buzz point per 100k

  // Modify by audience index
  const alignment = calculateAudienceIndex(project, target);

  const finalBuzzGain = Math.floor(baseBuzzGain * alignment);

  // Record marketing spend in the project
  const updatedProject = {
    ...project,
    buzz: Math.min(100, project.buzz + finalBuzzGain),
    marketingBudget: (project.marketingBudget || 0) + spend,
    targetDemographic: target,
  };

  const newProjects = { ...state.entities.projects };
  newProjects[projectId] = updatedProject;

  return {
    ...state,
    finance: { ...state.finance, cash: state.finance.cash - spend },
    entities: {
      ...state.entities,
      projects: newProjects,
    },
  };
}

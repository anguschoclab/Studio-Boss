import { GameState, StateImpact } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';

// Default number of weeks a project spends in post-production
const DEFAULT_POST_PRODUCTION_WEEKS = 3;

// Probability of a director requesting a final cut each week
const DIRECTORS_CUT_REQUEST_CHANCE = 0.2;

// Probability of a ratings-board delay adding one extra week
const RATINGS_BOARD_DELAY_CHANCE = 0.1;

/**
 * Called weekly by WeekCoordinator.
 * Processes all projects currently in the 'post_production' state.
 *
 * Each week:
 *  - Decrements postProductionWeeksRemaining (defaulting to 3 if absent)
 *  - 20% chance: triggers DIRECTORS_CUT_AVAILABLE modal
 *  - 10% chance: ratings-board delays add 1 extra week
 *  - At 0 weeks remaining: transitions project to 'marketing' and emits a news headline
 */
export function tickPostProduction(
  state: GameState,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];

  // ⚡ The Framerate Fanatic: Replaced Object.values() with a direct for...in loop
  // to avoid O(N) array allocation overhead every tick for high-frequency state records.
  for (const projectId in state.entities.projects) {
    if (!Object.prototype.hasOwnProperty.call(state.entities.projects, projectId)) continue;
    const project = state.entities.projects[projectId];
    if (project.state !== 'post_production') continue;

    const currentWeeksRemaining: number =
      (project as unknown as Record<string, unknown>).postProductionWeeksRemaining ??
      DEFAULT_POST_PRODUCTION_WEEKS;

    let weeksRemaining = currentWeeksRemaining;

    // ── Ratings-board delay (10%) ────────────────────────────────────────────
    if (rng.next() < RATINGS_BOARD_DELAY_CHANCE) {
      weeksRemaining += 1;

      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          headline: `"${project.title}" faces ratings board delay`,
          description: `The ratings board has requested additional review time for "${project.title}", adding one week to post-production.`,
          category: 'general',
        },
      });
    }

    // ── Director's cut request (20%) ─────────────────────────────────────────
    if (
      rng.next() < DIRECTORS_CUT_REQUEST_CHANCE &&
      !(project as unknown as Record<string, unknown>).directorsCutNotified
    ) {
      impacts.push({
        type: 'PROJECT_UPDATED',
        payload: {
          projectId: project.id,
          update: { directorsCutNotified: true } as unknown as Partial<import("@/engine/types").Project>,
        },
      });

      impacts.push({
        type: 'MODAL_TRIGGERED' as unknown as import("@/engine/types").StateImpact["type"],
        payload: {
          modalType: 'DIRECTORS_CUT_AVAILABLE',
          priority: 40,
          payload: { projectId: project.id, projectTitle: project.title },
        },
      });
    }

    // ── Decrement counter ────────────────────────────────────────────────────
    weeksRemaining = Math.max(0, weeksRemaining - 1);

    // ── Completion: transition to marketing ──────────────────────────────────
    if (weeksRemaining === 0) {
      impacts.push({
        type: 'PROJECT_UPDATED',
        payload: {
          projectId: project.id,
          update: {
            state: 'marketing' as unknown as import("@/engine/types").Project["state"],
            postProductionWeeksRemaining: 0,
            weeksInPhase: 0,
          } as unknown as Partial<import("@/engine/types").Project>,
        },
      });

      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          headline: `"${project.title}" wraps post-production`,
          description: `"${project.title}" has completed post-production and is now entering the marketing phase.`,
          category: 'general',
        },
      });
    } else {
      // Still in post-production — persist updated counter
      impacts.push({
        type: 'PROJECT_UPDATED',
        payload: {
          projectId: project.id,
          update: {
            postProductionWeeksRemaining: weeksRemaining,
          } as unknown as Partial<import("@/engine/types").Project>,
        },
      });
    }
  }

  return impacts;
}

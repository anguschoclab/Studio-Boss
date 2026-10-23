import { GameState, StateImpact, SeriesProject } from "@/engine/types";
import { calculateWeeklyRating } from "./ratingsEvaluator";
import { evaluateRenewal } from "./renewalEngine";
import { RandomGenerator } from "../../utils/rng";
import {
  calculateNielsenRatings,
  buildNielsenProfile,
  rankShows,
  assignTimeSlot,
  NielsenSnapshot,
} from "./nielsenSystem";

export type TVStatus =
  | "IN_DEVELOPMENT"
  | "ON_AIR"
  | "ON_BUBBLE"
  | "RENEWED"
  | "CANCELLED"
  | "SYNDICATED";

/**
 * Weekly TV Tick with integrated Nielsen ratings system.
 * `plans` carries rival series intents (renew/cancel temperament) produced by
 * RivalBrain — rival-owned shows obey the plan's declared decision instead of
 * the bare ratings threshold when a decision was declared.
 */
export function tickTelevision(
  state: GameState,
  rng: RandomGenerator,
  plans?: Record<string, import("../ai/rival/plan.types").RivalPlan>
): StateImpact[] {
  const impacts: StateImpact[] = [];

  // ⚡ The Framerate Fanatic: Replaced Object.values().filter() with a direct for...in loop
  // to avoid O(N) array allocation overhead every tick for high-frequency state records.
  const series: SeriesProject[] = [];
  const airingShows: SeriesProject[] = [];

  for (const id in state.entities.projects) {
    const p = state.entities.projects[id];
    if (p.type === "SERIES" && "tvDetails" in p) {
      const sp = p as SeriesProject;
      series.push(sp);
      if (sp.tvDetails.status === "ON_AIR") {
        airingShows.push(sp);
      }
    }
  }

  const weekSnapshots = new Map<string, NielsenSnapshot>();

  // Phase 1: Generate Nielsen snapshots for all airing shows
  airingShows.forEach((project) => {
    const aired = (project.tvDetails.episodesAired || 0) + 1;
    const snapshot = calculateNielsenRatings(project, aired, airingShows.length, rng);
    snapshot.week = state.week + 1;
    weekSnapshots.set(project.id, snapshot);
  });

  // Phase 2: Rank all shows by key demo
  const rankedSnapshots = rankShows(weekSnapshots);

  // Phase 3: Process each series
  series.forEach((project) => {
    if (project.tvDetails.status !== "ON_AIR") return;

    const snapshot = rankedSnapshots.get(project.id);
    if (!snapshot) return;

    const aired = (project.tvDetails.episodesAired || 0) + 1;

    // Legacy rating (keep backward compat)
    const newRating = calculateWeeklyRating(project, project.buzz || 0, rng);
    const totalRatingSum =
      project.tvDetails.averageRating * (project.tvDetails.episodesAired || 0) + newRating;
    const nextAverageRating = Math.round((totalRatingSum / aired) * 10) / 10;

    // Renewal logic — plan-declared rival intents override the raw threshold:
    // prestige studios over-renew vanity shows, cash-crunched studios axe early,
    // genre specialists protect commercial anchors.
    let nextStatus: TVStatus = project.tvDetails.status;
    if (aired >= project.tvDetails.episodesOrdered) {
      nextStatus = evaluateRenewal(project, nextAverageRating) as TVStatus;
      const ownerPlan = project.ownerId ? plans?.[project.ownerId] : undefined;
      const intent = ownerPlan?.series.find((s) => s.projectId === project.id);
      if (intent) {
        if (intent.decision === "renew" && nextStatus !== "RENEWED") {
          nextStatus = "RENEWED";
        } else if (
          intent.decision === "cancel" &&
          nextStatus !== "CANCELLED" &&
          nextAverageRating < 60
        ) {
          nextStatus = "CANCELLED";
        }
      }
    }

    // Build updated Nielsen profile
    const existingSnapshots = project.nielsenProfile?.snapshots || [];
    const timeSlot = project.nielsenProfile?.timeSlot || assignTimeSlot(project);
    const updatedSnapshots = [...existingSnapshots, snapshot];
    const nielsenProfile = buildNielsenProfile(updatedSnapshots, timeSlot);

    impacts.push({
      type: "PROJECT_UPDATED",
      payload: {
        projectId: project.id,
        update: {
          tvDetails: {
            ...project.tvDetails,
            episodesAired: aired,
            averageRating: nextAverageRating,
            status: nextStatus,
          },
          nielsenProfile,
        },
      },
    });

    if (nextStatus === "CANCELLED") {
      impacts.push({
        type: "PROJECT_REMOVED",
        payload: { projectId: project.id },
      });
    }
  });

  return impacts;
}

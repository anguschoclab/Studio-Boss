import { Project } from "@/engine/types";
import { RandomGenerator } from "../../utils/rng";
import { randRange } from "../../utils";

export interface PostReleaseResult {
  update: string | null;
}

export function handlePostReleasePhase(
  p: Project,
  rng?: RandomGenerator
): PostReleaseResult {
  let update: string | null = null;
  let weeklyAncillary = 0;

  const isFamilyOrAnim = p.genre === "Family" || p.genre === "Animation";
  const isPrestige = p.genre === "Drama" || p.targetAudience === "Prestige / Critics";
  const range = (min: number, max: number) =>
    rng ? rng.range(min, max) : randRange(min, max);

  if (p.weeksInPhase === 1) {
    if (isPrestige && (p.reviewScore || 0) > 80) {
      weeklyAncillary = p.budget * range(0.5, 1.5);
      update = `A fierce bidding war erupts for the streaming rights to "${p.title}"!`;
    } else if (p.format === "film") {
      weeklyAncillary = p.revenue * range(0.1, 0.3);
      update = `"${p.title}" drops on VOD and physical media.`;
    } else if (p.format === "tv") {
      weeklyAncillary = p.revenue * range(0.05, 0.15);
      update = `"${p.title}" lands on streaming platforms.`;
    } else if (p.format === "unscripted") {
      weeklyAncillary = p.revenue * range(0.02, 0.08);
      update = `"${p.title}" finds its secondary platform audience.`;
    }
  } else {
    if (isFamilyOrAnim) {
      weeklyAncillary = p.revenue * 0.005;
    } else {
      weeklyAncillary = p.revenue * 0.001;
    }
    weeklyAncillary *= Math.max(0.1, 1 - p.weeksInPhase / 52);
  }

  p.ancillaryRevenue = (p.ancillaryRevenue || 0) + weeklyAncillary;
  p.revenue += weeklyAncillary;
  p.weeklyRevenue = 0;

  if (p.weeksInPhase >= 26) {
    p.state = "archived";
  }

  return { update };
}

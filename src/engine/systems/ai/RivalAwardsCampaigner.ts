import { GameState, StateImpact, RivalStudio, Project } from "@/engine/types";
import { RandomGenerator } from "../../utils/rng";
import { getStudioArchetype } from "../../data/aiArchetypes";
import { checkCampaignBacklash } from "../awards/NominationCalculator";
import { impacts as I } from "../../core/impacts";

type CampaignTier = "Grassroots" | "Trade" | "Blitz";

const TIER_COSTS: Record<CampaignTier, number> = {
  Grassroots: 250_000,
  Trade: 1_000_000,
  Blitz: 5_000_000,
};

const TIER_BUZZ: Record<CampaignTier, number> = {
  Grassroots: 5,
  Trade: 15,
  Blitz: 40,
};

/**
 * Weekly tick: rivals with AWARD_CHASE motivation launch awards campaigns
 * for their eligible released projects. Boosts project buzz directly (since
 * CeremonyRunner uses p.buzz * 0.1 as campaignBuzz) and deducts cost from
 * rival cash.
 */
export function tickRivalAwardsCampaigns(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  const rivalsObj = state.entities?.rivals || {};
  const projectsObj = state.entities?.projects || {};

  for (const rid in rivalsObj) {
    const rival = rivalsObj[rid];
    if (rival.currentMotivation !== "AWARD_CHASE") continue;

    // Find eligible released projects (released within last 52 weeks, reviewScore >= 70)
    const eligibleProjects: Project[] = [];
    for (const pid in projectsObj) {
      const p = projectsObj[pid];
      if (
        p.ownerId === rival.id &&
        p.state === "released" &&
        p.releaseWeek !== null &&
        state.week - (p.releaseWeek as number) <= 52 &&
        (p.reviewScore ?? 0) >= 70
      ) {
        eligibleProjects.push(p);
      }
    }

    if (eligibleProjects.length === 0) continue;

    // Pick the best project (highest reviewScore)
    const project = eligibleProjects.reduce((best, p) =>
      (p.reviewScore ?? 0) > (best.reviewScore ?? 0) ? p : best
    );

    // Determine campaign tier based on archetype awardObsession and cash
    const archetype = getStudioArchetype(rival.archetypeId || rival.behaviorId || "major");
    const awardObsession = archetype.awardObsession;
    const cash = rival.cash || 0;

    let tier: CampaignTier | null = null;
    if (awardObsession >= 80) {
      if (cash > 50_000_000) tier = "Blitz";
      else if (cash > 10_000_000) tier = "Trade";
      else if (cash > 2_000_000) tier = "Grassroots";
    } else if (awardObsession >= 50) {
      if (cash > 10_000_000) tier = "Trade";
      else if (cash > 2_000_000) tier = "Grassroots";
    } else {
      if (cash > 2_000_000) tier = "Grassroots";
    }

    if (!tier) continue;

    const cost = TIER_COSTS[tier];
    const buzzBonus = TIER_BUZZ[tier];

    // Check for backlash on low-score projects
    const metaScore = project.reception?.metaScore || project.reviewScore || 60;
    const hasBacklash = checkCampaignBacklash(metaScore, tier, rng);

    // Deduct cost from rival cash
    impacts.push(
      I.rivalUpdated(rival.id, { cash: cash - cost })
    );

    // Boost project buzz (capped at 100)
    const newBuzz = Math.min(100, (project.buzz ?? 50) + buzzBonus);
    impacts.push({
      type: "PROJECT_UPDATED",
      payload: { projectId: project.id, update: { buzz: newBuzz } },
    });

    // Emit backlash news if applicable
    if (hasBacklash) {
      impacts.push(
        I.newsAdded({
          headline: `BACKLASH: ${rival.name}'s aggressive awards campaigning for "${project.title}" sparks industry outcry!`,
          description: `Critics question the sincerity of the campaign given the project's reception.`,
          category: "scandal",
        })
      );
    }
  }

  return impacts;
}

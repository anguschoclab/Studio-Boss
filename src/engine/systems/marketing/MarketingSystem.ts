import { GameState, StateImpact, Project, MarketingCampaign } from "../../types";
import { RandomGenerator } from "../../utils/rng";
import { computeCampaignMultiplier } from "../projectHandlers/MarketingHandler";
import { evaluateMarketingEfficiency } from "./efficiencyEvaluator";

/**
 * MarketingSystem — weekly awareness accrual loop.
 *
 * The previous design only applied a marketing multiplier at release
 * (releaseSimulation.ts → evaluateMarketingEfficiency). There was no ongoing
 * spend→awareness accrual and no competitive share-of-voice model. This system
 * closes that gap: each week a project sits in the `marketing` phase, its
 * `awareness` (0–100) grows from spend, modulated by angle fit, week-4 decay,
 * and the studio's share of total industry marketing voice.
 *
 * Deterministic: consumes the per-tick `RandomGenerator` (seeded from
 * gameSeed + tickCount) and emits only `StateImpact`s — never mutates state.
 */

// Awareness gained per $1M of effective weekly spend at week 1 (tuned baseline).
const AWARENESS_PER_MILLION = 1.2;
// Share-of-voice scaling: a studio with 0% of voice accrues at this floor;
// 100% of voice accrues at the cap. Linear between.
const SOV_FLOOR = 0.35;
const SOV_CAP = 1.15;

function totalSpend(campaign: MarketingCampaign): number {
  return (campaign.domesticBudget || 0) + (campaign.foreignBudget || 0);
}

function computeShareOfVoice(campaignSpend: number, industryIntensity: number): number {
  if (industryIntensity <= 0) return 1;
  return Math.min(1, campaignSpend / industryIntensity);
}

function sovMultiplier(share: number): number {
  return SOV_FLOOR + (SOV_CAP - SOV_FLOOR) * share;
}

/**
 * Accrue awareness for a single marketing-phase project.
 * Returns the new awareness value (0–100) and the share-of-voice achieved.
 */
export function accrueAwareness(
  project: Project,
  campaign: MarketingCampaign,
  industryIntensity: number,
  rng: RandomGenerator
): { awareness: number; shareOfVoice: number } {
  const spend = totalSpend(campaign);
  const weeksInMarketing = campaign.weeksInMarketing || project.weeksInPhase || 0;

  // Base accrual from effective weekly spend.
  const weeklySpend = spend / Math.max(1, weeksInMarketing);
  const angleMult = computeCampaignMultiplier(campaign as any, project);
  const efficiency = evaluateMarketingEfficiency(project, campaign).multiplier;

  let gain = (weeklySpend / 1_000_000) * AWARENESS_PER_MILLION * angleMult * efficiency;

  // Diminishing returns after week 4 (mirrors efficiencyEvaluator decay rule).
  if (weeksInMarketing > 4) {
    const overdue = weeksInMarketing - 4;
    gain *= Math.pow(0.95, overdue);
  }

  // Competitive share-of-voice.
  const share = computeShareOfVoice(spend, industryIntensity);
  gain *= sovMultiplier(share);

  // Small deterministic noise so identical campaigns still vary slightly by seed.
  gain *= 0.95 + rng.next() * 0.1;

  const current = project.awareness ?? 0;
  const awareness = Math.max(0, Math.min(100, current + gain));

  return { awareness, shareOfVoice: share };
}

/**
 * Weekly marketing tick. Iterates all marketing-phase projects with an active
 * campaign, accrues awareness, and writes the industry `marketingIntensity`
 * aggregate so release simulation and rivals can read competitive pressure.
 *
 * @param rivalSpend Total rival marketing spend this week (0 until Plan 5 wires
 *   rival campaigns in). Included so player share-of-voice is measured against
 *   the whole industry, not just the player's own campaigns.
 */
export function tickMarketing(
  state: GameState,
  rng: RandomGenerator,
  rivalSpend: number = 0
): StateImpact[] {
  const impacts: StateImpact[] = [];

  // 1. Sum total industry marketing spend this week (player campaigns + rivals).
  let industryIntensity = rivalSpend;
  const marketingProjects: Project[] = [];
  for (const id in state.entities.projects) {
    const p = state.entities.projects[id];
    if (p.state === "marketing" && p.marketingCampaign) {
      industryIntensity += totalSpend(p.marketingCampaign);
      marketingProjects.push(p);
    }
  }

  // 2. Accrue awareness per project.
  for (const p of marketingProjects) {
    const campaign = p.marketingCampaign!;
    const { awareness, shareOfVoice } = accrueAwareness(p, campaign, industryIntensity, rng);

    impacts.push({
      type: "PROJECT_UPDATED",
      payload: {
        projectId: p.id,
        update: {
          awareness,
          shareOfVoice,
          marketingCampaign: {
            ...campaign,
            weeksInMarketing: (campaign.weeksInMarketing || 0) + 1,
            awareness,
            shareOfVoice,
          },
        } as Partial<Project>,
      },
    });
  }

  // 3. Publish the aggregate for this week.
  if (industryIntensity > 0) {
    impacts.push({
      type: "MARKET_EVENT_UPDATED",
      payload: {
        marketingIntensity: industryIntensity,
      } as any,
    });
  }

  return impacts;
}

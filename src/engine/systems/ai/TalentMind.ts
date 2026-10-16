import { GameState, StateImpact, Talent, TalentMotivation } from "../../types";
import { RandomGenerator } from "../../utils/rng";
import { WorldAssessment } from "./WorldAssessment";

/**
 * TalentMind — per-talent motivation layer.
 *
 * The Talent type has had dormant motivation fields forever
 * (currentMotivation / motivationImpulse, seeded "NONE" at generation and
 * never updated). Downstream systems already read them — CompetitionModule
 * gates poach pricing on MONEY_GRABBER, willingnessEngine reads psychology —
 * so making motivations *live* immediately deepens existing decisions.
 *
 * Motivations are derived from the talent's MotivationProfile, career phase,
 * morale/scandal state, and the shared world assessment (awards season etc.).
 * Impacts only fire when a field actually changes — no weekly update spam.
 */

export function deriveTalentMotivation(
  talent: Talent,
  world: WorldAssessment | undefined,
  state: GameState
): TalentMotivation {
  const profile = talent.motivationProfile;
  const financial = profile?.financial ?? 50;
  const prestige = profile?.prestige ?? 50;
  const legacy = profile?.legacy ?? 50;
  const aggression = profile?.aggression ?? 50;

  // Rehab arc dominates: high scandal propensity or morale collapse.
  const scandalTail = (talent.psychology?.scandalRisk ?? 0) > 85;
  const moraleCollapsed = (talent.morale ?? 70) < 30;
  const onLeave = (talent.medicalLeaveEndsWeek ?? 0) > state.week;
  if (scandalTail || (moraleCollapsed && !onLeave)) return "REHAB_ARC";

  // Declining careers with financial pressure grab the check.
  if (talent.careerTrajectory === "declining" && financial >= 50) return "MONEY_GRABBER";
  if (financial > prestige + 20 && financial > 65) return "MONEY_GRABBER";

  // Awards season awakens the prestige hunter in high-prestige-profile talent.
  if (
    world?.calendarPhase === "AWARDS_SEASON" &&
    prestige > 55 &&
    !(talent.awards && talent.awards.length > 0)
  ) {
    return "PRESTIGE_HUNTER";
  }
  if (prestige > financial + 20 && prestige > 65) return "PRESTIGE_HUNTER";

  // Rising, aggressive, low-prestige talent chases fame.
  if (
    talent.careerTrajectory === "rising" &&
    aggression > 60 &&
    (talent.prestige ?? 50) < 70
  ) {
    return "FAME_SEEKER";
  }

  // Established auteurs/legacies want creative control.
  if (legacy > 70 && (talent.prestige ?? 50) > 70) return "CREATIVE_FREEDOM";

  return "NONE";
}

function impulseFor(
  motivation: TalentMotivation,
  talent: Talent,
  world: WorldAssessment | undefined
): NonNullable<Talent["motivationImpulse"]> {
  switch (motivation) {
    case "MONEY_GRABBER":
      return "CASH_OUT";
    case "PRESTIGE_HUNTER":
      return world?.calendarPhase === "AWARDS_SEASON" ? "AWARDS_RUN" : "VANITY";
    case "REHAB_ARC":
      return "REHAB";
    case "CREATIVE_FREEDOM":
      return "VANITY";
    default:
      return talent.psychology?.ego && talent.psychology.ego > 80 ? "VANITY" : "NONE";
  }
}

/**
 * Weekly talent mind tick — recomputes live motivations, emits TALENT_UPDATED
 * only on change, and surfaces occasional morale/motivation news so the
 * player can see talent posture shifting.
 */
export function tickTalentMinds(
  state: GameState,
  rng: RandomGenerator,
  world?: WorldAssessment
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const talents = state.entities.talents || {};

  for (const tid in talents) {
    const t = talents[tid];
    if (t.retired) continue;
    const next = deriveTalentMotivation(t, world, state);
    const impulse = impulseFor(next, t, world);
    if (next === (t.currentMotivation ?? "NONE") && impulse === (t.motivationImpulse ?? "NONE")) {
      continue;
    }
    impacts.push({
      type: "TALENT_UPDATED",
      payload: {
        talentId: tid,
        update: { currentMotivation: next, motivationImpulse: impulse },
      },
    });

    // Rare, honest signal to the player: a visible posture shift.
    if (next !== "NONE" && next !== (t.currentMotivation ?? "NONE") && rng.next() < 0.08) {
      const headline =
        next === "MONEY_GRABBER"
          ? `${t.name} signals they're chasing the biggest check`
          : next === "PRESTIGE_HUNTER"
            ? `${t.name} tells reps: awards or nothing`
            : next === "REHAB_ARC"
              ? `${t.name} retreats from the spotlight`
              : next === "CREATIVE_FREEDOM"
                ? `${t.name} demands final cut on next project`
                : `${t.name} is hungry for the spotlight`;
      impacts.push({
        type: "NEWS_ADDED",
        payload: {
          id: rng.uuid("NWS"),
          week: state.week,
          category: "talent",
          headline,
          description: `${t.name}'s reps are quietly reshaping their asking strategy — agents expect ${next === "MONEY_GRABBER" ? "record fee demands" : "tougher negotiations"}.`,
          talentId: tid,
        },
      });
    }
  }

  return impacts;
}

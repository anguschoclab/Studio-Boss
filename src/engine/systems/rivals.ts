import {RivalStudio, GameState, Talent} from "@/engine/types";
type TalentProfile = Talent;
import {StateImpact} from "../types/state.types";
import {clamp, pick, rand, generateId} from "../utils";

const INDIE_ACTIVITIES = [
  "Quietly developing a prestige drama slate",
  "Launched an ambitious awards campaign",
  "Prepping a major film festival submission",
  "Scouting new arthouse auteur directors",
];

const MAJOR_ACTIVITIES = [
  "Aggressively acquiring IP rights",
  "Riding high on a recent blockbuster success",
  "Doubling down on franchise expansion",
  "Courting A-list talent with lucrative deals",
  "Pivoting strategy after executive shakeup",
];

const MID_ACTIVITIES = [
  "Expanding into international co-productions",
  "Focusing on streaming-first genre releases",
  "Restructuring after a box office disappointment",
  "Betting heavily on a buzzy spec script",
];

export function rivalPoachTalent(rival: RivalStudio, stars: TalentProfile[]): string | null {
  if (rival.strategy === "acquirer" || rival.cash > 100_000_000) {
    if (rand() < 0.05) {
      // Find a highly prestigious talent
      if (stars.length > 0) {
        const star = pick(stars);

        // Add personality based on archetype
        const personalityPrefix =
          rival.archetype === "major"
            ? "Deep-pocketed"
            : rival.archetype === "indie"
              ? "Prestige-focused"
              : "Strategic";

        return `${personalityPrefix} ${rival.name} just poached ${star.name} with a massive overall deal!`;
      }
    }
  }
  return null;
}

export function updateRival(
  rival: RivalStudio,
  realProjectCount?: number
): { update: Partial<RivalStudio>; cashDelta: number } {
  const update: Partial<RivalStudio> = {};
  let cashDelta = 0;

  // projectCount reflects the real slate when provided; otherwise it stays honest
  // (no fabricated drift) and is left untouched.
  if (realProjectCount !== undefined) update.projectCount = realProjectCount;

  // Natural fluctuation
  update.strength = clamp(rival.strength + (rand() * 6 - 3), 20, 100);

  // Strategy driven behavior — cash moves are deltas so they compose with
  // other systems' transactions instead of overwriting them.
  if (rival.archetype === "major") {
    cashDelta = rand() * 40_000_000 - 10_000_000;
    if (rand() < 0.25) update.recentActivity = pick(MAJOR_ACTIVITIES);
    update.strategy = "acquirer";
  } else if (rival.archetype === "indie") {
    cashDelta = rand() * 10_000_000 - 4_000_000;
    if (rand() < 0.25) update.recentActivity = pick(INDIE_ACTIVITIES);
    update.strategy = "prestige_chaser";
  } else {
    // mid-tier
    cashDelta = rand() * 20_000_000 - 5_000_000;
    if (rand() < 0.25) update.recentActivity = pick(MID_ACTIVITIES);
    update.strategy = "genre_specialist";
  }

  // Check for M&A vulnerability
  const finalCash = rival.cash + cashDelta;
  const finalStrength = update.strength !== undefined ? update.strength : rival.strength;

  if (finalCash < 0 && finalStrength < 40) {
    update.isAcquirable = true;
    update.recentActivity = "Actively seeking a buyer amid cash crunch.";
  } else {
    update.isAcquirable = false;
  }

  return { update, cashDelta };
}

export function advanceRivals(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  const uiNotifications: string[] = [];
  const rivalsObj = state.entities.rivals;

  const projectsObj = state.entities.projects || {};

  for (const id in rivalsObj) {
    const rival = rivalsObj[id];
    let realProjectCount = Object.keys(rival.projects || {}).length;
    for (const pid in projectsObj) {
      if (projectsObj[pid].ownerId === rival.id) realProjectCount++;
    }
    const { update, cashDelta } = updateRival(rival, realProjectCount);

    impacts.push({
      type: "RIVAL_UPDATED",
      payload: {
        rivalId: rival.id,
        update,
      },
    });
    if (cashDelta !== 0) {
      impacts.push({
        type: "FINANCE_TRANSACTION",
        payload: {
          amount: cashDelta,
          description: "Weekly cash drift",
          targetId: rival.id,
        },
      });
    }

    // Log major rival events
    if (update.isAcquirable && !rival.isAcquirable) {
      const archetypeContext =
        rival.archetype === "major"
          ? "Once-mighty"
          : rival.archetype === "indie"
            ? "Critically-acclaimed"
            : "Mid-tier";

      impacts.push({
        type: "NEWS_ADDED",
        payload: {
          id: generateId("NWS"),
          type: "RIVAL",
          headline: `${archetypeContext} ${rival.name} Vulnerable to Takeover!`,
          description: `${rival.name} has hit a critical cash shortage. Strategy: ${update.recentActivity || rival.recentActivity}`,
          impact: "Available for acquisition",
          rivalId: rival.id,
        },
      });

      // Add to narrative events for weekly summary
      uiNotifications.push(
        `RIVAL: ${archetypeContext} ${rival.name} is vulnerable to takeover due to cash crunch`
      );
    }
  }

  // ⚡ The Framerate Fanatic: Pre-compute stars using a single for...in loop
  // to avoid O(N) Object.values allocations per rival inside the loop.
  const stars: TalentProfile[] = [];
  const talentsObj = state.entities.talents || {};
  for (const id in talentsObj) {
    if (talentsObj[id].prestige > 80) {
      stars.push(talentsObj[id]);
    }
  }

  // Talent Poaching News
  for (const id in rivalsObj) {
    const rival = rivalsObj[id];
    const poakMsg = rivalPoachTalent(rival, stars);
    if (poakMsg) {
      impacts.push({
        type: "NEWS_ADDED",
        payload: {
          id: generateId("NWS"),
          type: "RIVAL",
          headline: `Talent Poached by ${rival.name}`,
          description: poakMsg,
          impact: "Pool updated",
          rivalId: rival.id,
        },
      });

      // Add to narrative events for weekly summary
      uiNotifications.push(`RIVAL: ${poakMsg}`);
    }
  }

  // uiNotifications are collected by WeekCoordinator.buildSummary into
  // WeekSummary.narrativeEvents — emit as a bag impact so they still land there.
  if (uiNotifications.length > 0) {
    impacts.push({ uiNotifications });
  }

  return impacts;
}

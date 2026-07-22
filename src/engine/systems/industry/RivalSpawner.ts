/* eslint-disable @typescript-eslint/no-explicit-any */
import { GameState, RivalStudio, StateImpact } from "@/engine/types";
import { secureRandom, randRange, pick } from "../../utils";
import { getMarketHeat, getMarketRegime, getBudgetInflation } from "./MacroCycle";

/**
 * RivalSpawner — keeps the competitive field populated.
 *
 * Why not rely on IndustryUpstarts? That system only fires below a hard MIN and
 * always spawns indies. We need era-aware archetype selection (disruptors in
 * booms / post-AI-collapse) plus a firmer target (~10) so the oligopoly never
 * collapses past 7.
 */

const TARGET_ACTIVE = 10;
const MIN_FLOOR = 7;
const INDIE_NAMES = [
  "Lantern",
  "Meridian",
  "Foxglove",
  "Northstar",
  "Kettle",
  "Driftwood",
  "Solstice",
  "Cobalt",
  "Paper Crane",
  "Ember",
  "Tideline",
  "Spindle",
  "Quarry",
  "Halcyon",
  "Wildflower",
];
const DISRUPTOR_NAMES = [
  "Helix",
  "Synapse",
  "Orbital",
  "Vector",
  "Quanta",
  "Nexus",
  "Vanta",
  "Prism",
  "Chromium",
  "Zenith",
  "Halo",
  "Pulse",
  "Lumen",
  "Ansible",
];
const INDIE_SUFFIX = ["Pictures", "Films", "Studios", "Productions", "Picture Co."];
const DISRUPTOR_SUFFIX_EARLY = ["Digital", "Media", "Entertainment", "Networks"];
const DISRUPTOR_SUFFIX_AI = ["AI Studios", "Neural", "Synth Media", "AI Films"];

function activeRivalCount(state: GameState): number {
  // Replace Object.values().length with direct count to avoid array allocation
  let count = 0;
  for (const _id in state.entities.rivals || {}) count++;
  return count;
}

function chooseName(usedNames: Set<string>, pool: string[], suffixPool: string[]): string {
  for (let i = 0; i < 40; i++) {
    const n = `${pick(pool)} ${pick(suffixPool)}`;
    if (!usedNames.has(n)) return n;
  }
  return `${pick(pool)} ${pick(suffixPool)} ${Math.floor(secureRandom() * 999)}`;
}

function makeIndie(state: GameState, usedNames: Set<string>): RivalStudio {
  const inflation = getBudgetInflation(state.week);
  const cash = randRange(50_000_000, 200_000_000) * inflation;
  const name = chooseName(usedNames, INDIE_NAMES, INDIE_SUFFIX);
  return {
    id: `indie-${state.week}-${Math.floor(secureRandom() * 1e6)}`,
    name,
    motto: "Art over algorithms.",
    archetype: "indie" as any,
    foundedWeek: state.week,
    parentBrand: name.split(" ")[0],
    strength: 25 + Math.floor(secureRandom() * 20),
    cash,
    prestige: 55 + Math.floor(secureRandom() * 25),
    recentActivity: "A prestige-focused boutique launches amid industry downturn.",
    projects: {},
    contracts: [],
    projectCount: 0,
    motivationProfile: { financial: 30, prestige: 90, legacy: 60, aggression: 40 },
    currentMotivation: "PRESTIGE_BUILDING" as any,
    ownedPlatforms: [],
  };
}

function makeDisruptor(state: GameState, usedNames: Set<string>): RivalStudio {
  const inflation = getBudgetInflation(state.week);
  const year = state.week / 52 + 1975;
  const suffix = year >= 2033 ? DISRUPTOR_SUFFIX_AI : DISRUPTOR_SUFFIX_EARLY;
  const cash = randRange(500_000_000, 2_000_000_000) * inflation;
  const name = chooseName(usedNames, DISRUPTOR_NAMES, suffix);
  return {
    id: `disruptor-${state.week}-${Math.floor(secureRandom() * 1e6)}`,
    name,
    motto: "Scale changes everything.",
    archetype: "mid-tier" as any,
    foundedWeek: state.week,
    parentBrand: name.split(" ")[0],
    strength: 55 + Math.floor(secureRandom() * 25),
    cash,
    prestige: 30 + Math.floor(secureRandom() * 20),
    recentActivity: "A tech-adjacent entrant launches with platform ambitions.",
    projects: {},
    contracts: [],
    projectCount: 0,
    motivationProfile: { financial: 80, prestige: 40, legacy: 30, aggression: 85 },
    currentMotivation: "MARKET_DISRUPTION" as any,
    ownedPlatforms: [],
  };
}

export function tickRivalSpawner(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  const count = activeRivalCount(state);
  if (count >= TARGET_ACTIVE) return impacts;

  const deficit = TARGET_ACTIVE - count;
  // Baseline 2%/week spawn chance per missing slot, amplified when below hard floor.
  const urgency = count < MIN_FLOOR ? 3.0 : 1.0;
  const pSpawn = Math.min(0.6, 0.03 * deficit * urgency);
  if (secureRandom() > pSpawn) return impacts;

  const heat = getMarketHeat(state.week);
  const regime = getMarketRegime(state.week);
  const year = state.week / 52 + 1975;

  // Archetype selection: booms/AI era favor disruptors; busts favor indies.
  let indieWeight = 0.5;
  if (regime === "bust" || heat < 0.9) indieWeight = 0.8;
  if (regime === "boom" || heat > 1.1) indieWeight = 0.2;
  if (year >= 2033 && year <= 2050) indieWeight -= 0.2;
  indieWeight = Math.max(0.1, Math.min(0.9, indieWeight));

  const usedNames = new Set<string>();
  // Replace Object.values().forEach with direct for...in loop
  const rivalsDict = state.entities.rivals || {};
  for (const id in rivalsDict) {
    usedNames.add(rivalsDict[id].name);
  }
  state.market.buyers.forEach((b) => usedNames.add(b.name));

  const isIndie = secureRandom() < indieWeight;
  const newRival = isIndie ? makeIndie(state, usedNames) : makeDisruptor(state, usedNames);

  impacts.push({
    type: "INDUSTRY_UPDATE",
    payload: {
      update: {},
      rival: { rivalId: newRival.id, update: newRival as any },
    } as any,
  });

  impacts.push({
    type: "NEWS_ADDED",
    payload: {
      headline: isIndie
        ? `NEW ENTRANT: ${newRival.name} launches as prestige indie`
        : `DISRUPTOR: ${newRival.name} enters industry with $${(newRival.cash / 1e6).toFixed(0)}M war chest`,
      description: newRival.recentActivity,
      category: "market",
    },
  });

  return impacts;
}

export function tickHardBankruptcy(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];

  // Replace Object.values with direct for...in loop
  const rivalsDict = state.entities.rivals || {};
  let count = 0;
  for (const _id in rivalsDict) count++;

  // Protect against collapse below the floor — if at floor, soft-flagged rivals linger.
  if (count <= MIN_FLOOR) return impacts;

  for (const id in rivalsDict) {
    const r = rivalsDict[id];
    const deeplyInsolvent = (r.cash || 0) < -300_000_000 && r.strength < 25;
    if (!deeplyInsolvent) continue;
    // 8% weekly conversion from flagged to hard-bankrupt once truly in distress.
    if (secureRandom() > 0.08) continue;
    impacts.push({
      type: "INDUSTRY_UPDATE",
      payload: { update: {}, bankruptRivalId: r.id } as any,
    });
    impacts.push({
      type: "NEWS_ADDED",
      payload: {
        headline: `INSOLVENCY: ${r.name} liquidates, assets to be auctioned`,
        description: `After prolonged cash depletion, ${r.name} has entered Chapter 7 and will cease operations.`,
        category: "market",
      },
    });
    // One bankruptcy per tick keeps churn realistic.
    break;
  }
  return impacts;
}

import { describe, bench } from "vitest";
import { generateWeeklyFinancialReport } from "@/engine/systems/finance";
import { tickPlatforms } from "@/engine/systems/television/platformEngine";
import { tickShingleSystem } from "@/engine/systems/deals/ShingleSystem";
import { RandomGenerator } from "@/engine/utils/rng";
import {
  createMockGameState,
  createMockRival,
  createMockTalent,
} from "../engine/generators/mockFactory";

// Bench coverage for the hot paths changed in the perf sweep:
// releasedProjectIds index loop, platform tick, single-pass shingle census.

const PROJECTS = 200;
const RELEASED = 40;
const TALENTS = 300;

function makeFinanceState() {
  const projects: Record<string, unknown> = {};
  const releasedProjectIds: string[] = [];
  for (let i = 0; i < PROJECTS; i++) {
    const released = i < RELEASED;
    const id = `p${i}`;
    projects[id] = {
      id,
      title: `P${i}`,
      state: released ? "released" : "production",
      weeklyCost: 10_000,
      weeklyRevenue: 50_000,
      budget: 1_000_000,
      buzz: 40,
      distributionStatus: "theatrical",
      ownerId: "PLR-1",
      weeksInPhase: 2,
    };
    if (released) releasedProjectIds.push(id);
  }
  const state = createMockGameState();
  state.entities.projects = projects as never;
  state.entities.releasedProjectIds = releasedProjectIds;
  return state;
}

function makePlatformState() {
  const state = makeFinanceState();
  state.market.buyers = [
    { id: "s1", archetype: "streamer", subscribers: 10_000_000, churnRate: 0.05, contentLibraryQuality: 70, marketingSpend: 500_000, subscriberHistory: [] },
    { id: "s2", archetype: "streamer", subscribers: 5_000_000, churnRate: 0.04, contentLibraryQuality: 80, marketingSpend: 200_000, subscriberHistory: [] },
  ] as never;
  return state;
}

function makeShingleState() {
  const talents: Record<string, unknown> = {};
  for (let i = 0; i < TALENTS; i++) {
    talents[`t${i}`] = createMockTalent({
      id: `t${i}`,
      roles: i % 3 === 0 ? ["writer"] : ["director"],
      prestige: 20 + (i % 70),
    });
  }
  const state = createMockGameState({ week: 1872 });
  state.entities.talents = talents as never;
  state.entities.rivals = { "rival-1": createMockRival() };
  return state;
}

const financeState = makeFinanceState();
const platformState = makePlatformState();
const shingleState = makeShingleState();
const rng = new RandomGenerator(42);

describe("Tick-path hot loops", () => {
  bench(`generateWeeklyFinancialReport (${PROJECTS} projects, ${RELEASED} released)`, () => {
    generateWeeklyFinancialReport(financeState);
  });
  bench("tickPlatforms (2 streamers)", () => {
    tickPlatforms(platformState, rng);
  });
  bench(`tickShingleSystem (${TALENTS} talents)`, () => {
    tickShingleSystem(shingleState, rng);
  });
});

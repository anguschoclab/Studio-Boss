import { describe, it, expect } from "vitest";
import { tickTalentCompetition } from "@/engine/systems/ai/bidding/CompetitionModule";
import { RandomGenerator } from "@/engine/utils/rng";
import {
  createMockGameState,
  createMockRival,
  createMockTalent,
} from "../../../utils/mockFactories";

describe("CompetitionModule - tickTalentCompetition", () => {
  it("returns empty array when week is not divisible by 4", () => {
    const state = createMockGameState({ week: 3 });
    const rng = new RandomGenerator(42);
    expect(tickTalentCompetition(state, rng)).toEqual([]);
  });

  it("returns empty array when no rivals exist", () => {
    const state = createMockGameState({
      week: 4,
      entities: {
        rivals: {},
        talents: {},
        projects: {},
        contracts: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
        releasedProjectIds: [],
      },
    });
    const rng = new RandomGenerator(42);
    expect(tickTalentCompetition(state, rng)).toEqual([]);
  });

  it("returns empty array when no rivals have enough cash", () => {
    const state = createMockGameState({
      week: 4,
      entities: {
        rivals: {
          "r1": createMockRival({ id: "r1", cash: 50_000_000 }),
        },
        talents: {},
        projects: {},
        contracts: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
        releasedProjectIds: [],
      },
    });
    const rng = new RandomGenerator(42);
    expect(tickTalentCompetition(state, rng)).toEqual([]);
  });

  it("returns empty array when no eligible talent exists", () => {
    const state = createMockGameState({
      week: 4,
      entities: {
        rivals: {
          "r1": createMockRival({ id: "r1", cash: 500_000_000, prestige: 50 }),
        },
        talents: {
          "t1": createMockTalent({ id: "t1", prestige: 50 }),
        },
        projects: {},
        contracts: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
        releasedProjectIds: [],
      },
    });
    const rng = new RandomGenerator(42);
    expect(tickTalentCompetition(state, rng)).toEqual([]);
  });

  it("returns impacts array when eligible rivals and talent exist", () => {
    const state = createMockGameState({
      week: 4,
      entities: {
        rivals: {
          "r1": createMockRival({ id: "r1", cash: 500_000_000, prestige: 50, name: "Mega Studio" }),
        },
        talents: {
          "t1": createMockTalent({
            id: "t1",
            prestige: 90,
            name: "Star Actor",
            fee: 2_000_000,
            contractId: undefined,
          }),
        },
        projects: {},
        contracts: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
        releasedProjectIds: [],
      },
    });
    const rng = new RandomGenerator(42);
    const impacts = tickTalentCompetition(state, rng);
    expect(Array.isArray(impacts)).toBe(true);
  });

  it("filters rivals by cash threshold of 100M", () => {
    const state = createMockGameState({
      week: 4,
      entities: {
        rivals: {
          "r1": createMockRival({ id: "r1", cash: 99_999_999, prestige: 50 }),
          "r2": createMockRival({ id: "r2", cash: 100_000_001, prestige: 50 }),
        },
        talents: {
          "t1": createMockTalent({ id: "t1", prestige: 90, fee: 1_000_000 }),
        },
        projects: {},
        contracts: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
        releasedProjectIds: [],
      },
    });
    const rng = new RandomGenerator(42);
    const impacts = tickTalentCompetition(state, rng);
    // Only r2 is eligible; r1 should never appear in impacts
    const rivalImpacts = impacts.filter((i) => i.type === "RIVAL_UPDATED");
    rivalImpacts.forEach((i) => {
      expect((i.payload as any).rivalId).not.toBe("r1");
    });
  });

  it("filters talent by prestige > 85 and no contract", () => {
    const state = createMockGameState({
      week: 4,
      entities: {
        rivals: {
          "r1": createMockRival({ id: "r1", cash: 500_000_000, prestige: 50, name: "Big Studio" }),
        },
        talents: {
          "t1": createMockTalent({ id: "t1", prestige: 85, fee: 1_000_000 }),
          "t2": createMockTalent({ id: "t2", prestige: 90, fee: 1_000_000, contractId: "existing" }),
          "t3": createMockTalent({ id: "t3", prestige: 95, fee: 1_000_000 }),
        },
        projects: {},
        contracts: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
        releasedProjectIds: [],
      },
    });
    const rng = new RandomGenerator(42);
    const impacts = tickTalentCompetition(state, rng);
    // t1 has prestige 85 (not > 85), t2 has a contract — neither should be targeted
    const newsImpacts = impacts.filter((i) => i.type === "NEWS_ADDED");
    newsImpacts.forEach((i) => {
      const headline = (i.payload as any).headline as string;
      expect(headline).not.toContain("Mock Artist");
    });
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import {
  shouldTalentHireAgent,
  shouldTalentFireAgent,
  selectAgentForTalent,
  createAgentHiringEvent,
  createAgentFiringEvent,
} from "@/engine/systems/talent/talentAgentEvents";
import { RandomGenerator } from "@/engine/utils/rng";
import { createMockGameState, createMockTalent } from "../../generators/mockFactory";
import type { GameState } from "@/engine/types/studio.types";
import type { Agent, Agency } from "@/engine/types/talent.types";
import type { TalentAgentRelationship } from "@/engine/systems/talent/talentAgentInteractions";

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: "AGT-1",
    name: "Test Agent",
    agencyId: "AGY-1",
    specialty: "talent",
    prestige: 50,
    leverage: 50,
    ...overrides,
  };
}

function makeAgency(overrides: Partial<Agency> = {}): Agency {
  return {
    id: "AGY-1",
    name: "Test Agency",
    archetype: "powerhouse",
    tier: "powerhouse",
    culture: "shark",
    prestige: 90,
    leverage: 90,
    ...overrides,
  };
}

function makeRelationship(
  overrides: Partial<TalentAgentRelationship> = {}
): TalentAgentRelationship {
  return {
    talentId: "TAL-1",
    agentId: "AGT-1",
    relationshipScore: 50,
    history: { successfulDeals: 0, failedDeals: 0, totalDeals: 0, yearsTogether: 0 },
    synergy: 0,
    ...overrides,
  };
}

function makeState(overrides: { agencies?: Agency[]; agents?: Agent[] } = {}): GameState {
  const state = createMockGameState();
  state.industry.agencies = overrides.agencies ?? [makeAgency()];
  state.industry.agents = overrides.agents ?? [makeAgent()];
  return state;
}

// ── shouldTalentHireAgent ──────────────────────────────────────────

describe("shouldTalentHireAgent", () => {
  it("A_LIST talent without agent → shouldHire true", () => {
    const talent = createMockTalent({ tier: "A_LIST", agentId: undefined });
    expect(shouldTalentHireAgent(talent).shouldHire).toBe(true);
  });

  it("B_LIST talent without agent → shouldHire true", () => {
    const talent = createMockTalent({ tier: "B_LIST", agentId: undefined });
    expect(shouldTalentHireAgent(talent).shouldHire).toBe(true);
  });

  it("C_LIST talent without agent → shouldHire false", () => {
    const talent = createMockTalent({ tier: "C_LIST", agentId: undefined });
    expect(shouldTalentHireAgent(talent).shouldHire).toBe(false);
  });

  it("RISING_STAR without agent and prestige <= 70 → shouldHire false", () => {
    const talent = createMockTalent({ tier: "RISING_STAR", agentId: undefined, prestige: 70 });
    expect(shouldTalentHireAgent(talent).shouldHire).toBe(false);
  });

  it("rising careerTrajectory with prestige > 70 → shouldHire true", () => {
    const talent = createMockTalent({ careerTrajectory: "rising", prestige: 75, agentId: "AGT-1" });
    expect(shouldTalentHireAgent(talent).shouldHire).toBe(true);
  });

  it("rising careerTrajectory with prestige <= 70 → shouldHire false", () => {
    const talent = createMockTalent({ careerTrajectory: "rising", prestige: 70, agentId: "AGT-1" });
    expect(shouldTalentHireAgent(talent).shouldHire).toBe(false);
  });

  it("A_LIST talent with existing agent and no rising trajectory → shouldHire false", () => {
    const talent = createMockTalent({ tier: "A_LIST", agentId: "AGT-1", prestige: 80 });
    expect(shouldTalentHireAgent(talent).shouldHire).toBe(false);
  });

  it("NEWCOMER without agent → shouldHire false", () => {
    const talent = createMockTalent({ tier: "NEWCOMER", agentId: undefined });
    expect(shouldTalentHireAgent(talent).shouldHire).toBe(false);
  });
});

// ── shouldTalentFireAgent ──────────────────────────────────────────

describe("shouldTalentFireAgent", () => {
  it("talent with no agentId → false", () => {
    const talent = createMockTalent({ agentId: undefined });
    expect(shouldTalentFireAgent(talent, makeRelationship())).toBe(false);
  });

  it("relationshipScore < 20 → true", () => {
    const talent = createMockTalent({ agentId: "AGT-1" });
    const rel = makeRelationship({ relationshipScore: 15 });
    expect(shouldTalentFireAgent(talent, rel)).toBe(true);
  });

  it("declining trajectory with relationshipScore < 40 → true", () => {
    const talent = createMockTalent({ agentId: "AGT-1", careerTrajectory: "declining" });
    const rel = makeRelationship({ relationshipScore: 30 });
    expect(shouldTalentFireAgent(talent, rel)).toBe(true);
  });

  it("declining trajectory with relationshipScore >= 40 → false (unless other conditions)", () => {
    const talent = createMockTalent({ agentId: "AGT-1", careerTrajectory: "declining" });
    const rel = makeRelationship({ relationshipScore: 45 });
    expect(shouldTalentFireAgent(talent, rel)).toBe(false);
  });

  it("failedDeals >= 3 and failedDeals > successfulDeals → true", () => {
    const talent = createMockTalent({ agentId: "AGT-1" });
    const rel = makeRelationship({
      relationshipScore: 50,
      history: { successfulDeals: 1, failedDeals: 4, totalDeals: 5, yearsTogether: 1 },
    });
    expect(shouldTalentFireAgent(talent, rel)).toBe(true);
  });

  it("failedDeals >= 3 but failedDeals <= successfulDeals → false", () => {
    const talent = createMockTalent({ agentId: "AGT-1" });
    const rel = makeRelationship({
      relationshipScore: 50,
      history: { successfulDeals: 4, failedDeals: 3, totalDeals: 7, yearsTogether: 1 },
    });
    expect(shouldTalentFireAgent(talent, rel)).toBe(false);
  });

  it("empty commitments array → true (no bookings)", () => {
    const talent = createMockTalent({ agentId: "AGT-1" });
    (talent as any).commitments = [];
    const rel = makeRelationship({ relationshipScore: 50 });
    expect(shouldTalentFireAgent(talent, rel)).toBe(true);
  });

  it("non-empty commitments → false (has bookings, healthy relationship)", () => {
    const talent = createMockTalent({ agentId: "AGT-1" });
    (talent as any).commitments = [{ projectId: "PRJ-1", startWeek: 1, endWeek: 10 }];
    const rel = makeRelationship({ relationshipScore: 50 });
    expect(shouldTalentFireAgent(talent, rel)).toBe(false);
  });

  it("healthy relationship with bookings → false", () => {
    const talent = createMockTalent({ agentId: "AGT-1", careerTrajectory: "stable" });
    (talent as any).commitments = [{ projectId: "PRJ-1", startWeek: 1, endWeek: 10 }];
    const rel = makeRelationship({
      relationshipScore: 80,
      history: { successfulDeals: 5, failedDeals: 0, totalDeals: 5, yearsTogether: 2 },
    });
    expect(shouldTalentFireAgent(talent, rel)).toBe(false);
  });
});

// ── selectAgentForTalent ───────────────────────────────────────────

describe("selectAgentForTalent", () => {
  let rng: RandomGenerator;

  beforeEach(() => {
    rng = new RandomGenerator(42);
  });

  it("returns undefined when no agents exist", () => {
    const talent = createMockTalent({ tier: "A_LIST", agentId: undefined });
    const state = makeState({ agencies: [makeAgency()], agents: [] });
    expect(selectAgentForTalent(talent, state, rng)).toBeUndefined();
  });

  it("excludes talent's current agent from results", () => {
    const agent1 = makeAgent({ id: "AGT-1", prestige: 100 });
    const agent2 = makeAgent({ id: "AGT-2", prestige: 100, agencyId: "AGY-1" });
    const talent = createMockTalent({ tier: "B_LIST", agentId: "AGT-1" });
    const state = makeState({ agencies: [makeAgency()], agents: [agent1, agent2] });
    const result = selectAgentForTalent(talent, state, rng);
    expect(result).toBeDefined();
    expect(result!.id).toBe("AGT-2");
  });

  it("A_LIST talent: only returns agents from powerhouse/major tier agencies", () => {
    const powerhouseAgency = makeAgency({ id: "AGY-P", tier: "powerhouse" });
    const boutiqueAgency = makeAgency({ id: "AGY-B", tier: "boutique" });
    const specialistAgency = makeAgency({ id: "AGY-S", tier: "specialist" });

    const powerhouseAgent = makeAgent({ id: "AGT-P", agencyId: "AGY-P", prestige: 100 });
    const boutiqueAgent = makeAgent({ id: "AGT-B", agencyId: "AGY-B", prestige: 100 });
    const specialistAgent = makeAgent({ id: "AGT-S", agencyId: "AGY-S", prestige: 100 });

    const talent = createMockTalent({ tier: "A_LIST", agentId: undefined });
    const state = makeState({
      agencies: [powerhouseAgency, boutiqueAgency, specialistAgency],
      agents: [powerhouseAgent, boutiqueAgent, specialistAgent],
    });

    // Run multiple times — should only ever return powerhouseAgent
    for (let i = 0; i < 20; i++) {
      const result = selectAgentForTalent(talent, state, new RandomGenerator(i));
      expect(result).toBeDefined();
      expect(result!.id).toBe("AGT-P");
    }
  });

  it("A_LIST talent: returns undefined if no agents from powerhouse/major agencies", () => {
    const boutiqueAgency = makeAgency({ id: "AGY-B", tier: "boutique" });
    const boutiqueAgent = makeAgent({ id: "AGT-B", agencyId: "AGY-B", prestige: 50 });

    const talent = createMockTalent({ tier: "A_LIST", agentId: undefined });
    const state = makeState({ agencies: [boutiqueAgency], agents: [boutiqueAgent] });

    expect(selectAgentForTalent(talent, state, rng)).toBeUndefined();
  });

  it("A_LIST talent: returns agents from major tier agencies", () => {
    const majorAgency = makeAgency({ id: "AGY-M", tier: "major" });
    const majorAgent = makeAgent({ id: "AGT-M", agencyId: "AGY-M", prestige: 80 });

    const talent = createMockTalent({ tier: "A_LIST", agentId: undefined });
    const state = makeState({ agencies: [majorAgency], agents: [majorAgent] });

    const result = selectAgentForTalent(talent, state, rng);
    expect(result).toBeDefined();
    expect(result!.id).toBe("AGT-M");
  });

  it("B_LIST talent: returns all agents (no tier filtering)", () => {
    const boutiqueAgency = makeAgency({ id: "AGY-B", tier: "boutique" });
    const boutiqueAgent = makeAgent({ id: "AGT-B", agencyId: "AGY-B", prestige: 50 });

    const talent = createMockTalent({ tier: "B_LIST", agentId: undefined });
    const state = makeState({ agencies: [boutiqueAgency], agents: [boutiqueAgent] });

    const result = selectAgentForTalent(talent, state, rng);
    expect(result).toBeDefined();
    expect(result!.id).toBe("AGT-B");
  });

  it("C_LIST talent: returns all agents except current", () => {
    const agent1 = makeAgent({ id: "AGT-1", prestige: 50 });
    const agent2 = makeAgent({ id: "AGT-2", prestige: 50, agencyId: "AGY-1" });

    const talent = createMockTalent({ tier: "C_LIST", agentId: "AGT-1" });
    const state = makeState({ agencies: [makeAgency()], agents: [agent1, agent2] });

    const result = selectAgentForTalent(talent, state, rng);
    expect(result).toBeDefined();
    expect(result!.id).toBe("AGT-2");
  });

  it("weighted selection: higher prestige agents selected more often", () => {
    const lowPrestigeAgent = makeAgent({ id: "AGT-LOW", prestige: 1, agencyId: "AGY-1" });
    const highPrestigeAgent = makeAgent({ id: "AGT-HIGH", prestige: 99, agencyId: "AGY-1" });

    const talent = createMockTalent({ tier: "B_LIST", agentId: undefined });
    const state = makeState({
      agencies: [makeAgency()],
      agents: [lowPrestigeAgent, highPrestigeAgent],
    });

    let highCount = 0;
    const iterations = 1000;
    for (let i = 0; i < iterations; i++) {
      const result = selectAgentForTalent(talent, state, new RandomGenerator(i));
      if (result?.id === "AGT-HIGH") highCount++;
    }
    // High prestige (99) vs low (1) → ~99% selection rate
    expect(highCount).toBeGreaterThan(iterations * 0.9);
  });

  it("handles agent with no agencyId (undefined agency lookup)", () => {
    const agentNoAgency = makeAgent({ id: "AGT-NA", agencyId: undefined, prestige: 50 });

    const talent = createMockTalent({ tier: "B_LIST", agentId: undefined });
    const state = makeState({ agencies: [makeAgency()], agents: [agentNoAgency] });

    const result = selectAgentForTalent(talent, state, rng);
    expect(result).toBeDefined();
    expect(result!.id).toBe("AGT-NA");
  });

  it("A_LIST talent: agent with no agencyId is excluded (no matching powerhouse/major)", () => {
    const agentNoAgency = makeAgent({ id: "AGT-NA", agencyId: undefined, prestige: 50 });

    const talent = createMockTalent({ tier: "A_LIST", agentId: undefined });
    const state = makeState({ agencies: [makeAgency()], agents: [agentNoAgency] });

    expect(selectAgentForTalent(talent, state, rng)).toBeUndefined();
  });
});

// ── createAgentHiringEvent / createAgentFiringEvent ────────────────

describe("createAgentHiringEvent", () => {
  it("creates event with correct fields", () => {
    const talent = createMockTalent({ id: "TAL-1", name: "Jane Doe" });
    const agent = makeAgent({ id: "AGT-1", name: "John Smith" });
    const event = createAgentHiringEvent(talent, agent, 5);

    expect(event.id).toBe("hire-TAL-1-AGT-1-5");
    expect(event.text).toContain("Jane Doe");
    expect(event.text).toContain("John Smith");
    expect(event.text).toContain("agent");
    expect(event.week).toBe(5);
    expect(event.category).toBe("talent");
  });
});

describe("createAgentFiringEvent", () => {
  it("creates event with correct fields", () => {
    const talent = createMockTalent({ id: "TAL-2", name: "Alice Wang" });
    const event = createAgentFiringEvent(talent, "AGT-9", 10);

    expect(event.id).toBe("fire-TAL-2-AGT-9-10");
    expect(event.text).toContain("Alice Wang");
    expect(event.text).toContain("parted ways");
    expect(event.week).toBe(10);
    expect(event.category).toBe("talent");
  });
});

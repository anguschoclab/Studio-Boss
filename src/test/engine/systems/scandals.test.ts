import * as utils from "../../../engine/utils";
import { describe, it, expect } from "vitest";
import { advanceScandals } from "../../../engine/systems/scandals";
import { GameState, Scandal, Project, Contract } from "../../../engine/types";

describe("advanceScandals", () => {
  it("does nothing if there are no scandals", () => {
    const initialState = { industry: {} } as GameState;
    const nextState = advanceScandals(initialState);
    expect(nextState).toBe(initialState);
  });

  it("decrements weeksRemaining for active scandals and removes expired ones", () => {
    const s1: Scandal = { id: "s1", talentId: "t1", severity: 50, type: "personal", weeksRemaining: 3 };
    const s2: Scandal = { id: "s2", talentId: "t2", severity: 80, type: "legal", weeksRemaining: 1 };

    const initialState = {
      industry: { scandals: [s1, s2] },
      studio: { internal: { projects: [], contracts: [] } }
    } as unknown as GameState;

    const nextState = advanceScandals(initialState);

    // s2 should be removed because weeksRemaining > 1 is false for it
    expect(nextState.industry.scandals).toHaveLength(1);
    expect(nextState.industry.scandals![0].id).toBe("s1");
    expect(nextState.industry.scandals![0].weeksRemaining).toBe(2);
  });

  it("applies buzz penalty to projects attached to talent with an active scandal", () => {
    const scandal: Scandal = { id: "s1", talentId: "t1", severity: 50, type: "personal", weeksRemaining: 3 };

    const project: Project = { id: "p1", title: "Test Project", buzz: 50 } as Project;
    const unaffectedProject: Project = { id: "p2", title: "Safe Project", buzz: 50 } as Project;
    const contract: Contract = { id: "c1", talentId: "t1", projectId: "p1", weeklyFee: 0, weeksRemaining: 0, royaltyPercentage: 0 } as Contract;

    const initialState = {
      industry: { scandals: [scandal] },
      studio: {
        internal: {
          projects: [project, unaffectedProject],
          contracts: [contract]
        }
      }
    } as unknown as GameState;

    const nextState = advanceScandals(initialState);

    expect(nextState.studio.internal.projects[0].id).toBe("p1");
    expect(nextState.studio.internal.projects[0].buzz).toBe(48); // 50 - 2

    expect(nextState.studio.internal.projects[1].id).toBe("p2");
    expect(nextState.studio.internal.projects[1].buzz).toBe(50); // Unchanged
  });

  it("clamps buzz penalty at 0", () => {
    const scandal: Scandal = { id: "s1", talentId: "t1", severity: 50, type: "personal", weeksRemaining: 3 };
    const project: Project = { id: "p1", title: "Test Project", buzz: 1 } as Project;
    const contract: Contract = { id: "c1", talentId: "t1", projectId: "p1", weeklyFee: 0, weeksRemaining: 0, royaltyPercentage: 0 } as Contract;

    const initialState = {
      industry: { scandals: [scandal] },
      studio: {
        internal: {
          projects: [project],
          contracts: [contract]
        }
      }
    } as unknown as GameState;

    const nextState = advanceScandals(initialState);

    expect(nextState.studio.internal.projects[0].buzz).toBe(0); // 1 - 2 clamped to 0
  });

  it("preserves unmodified references for state efficiency", () => {
    const scandal: Scandal = { id: "s1", talentId: "t1", severity: 50, type: "personal", weeksRemaining: 3 };
    const project: Project = { id: "p1", title: "Test Project", buzz: 50 } as Project;
    const unaffectedProject: Project = { id: "p2", title: "Safe Project", buzz: 50 } as Project;
    const contract: Contract = { id: "c1", talentId: "t1", projectId: "p1", weeklyFee: 0, weeksRemaining: 0, royaltyPercentage: 0 } as Contract;

    const initialState = {
      industry: { scandals: [scandal] },
      studio: {
        internal: {
          projects: [project, unaffectedProject],
          contracts: [contract]
        }
      }
    } as unknown as GameState;

    const nextState = advanceScandals(initialState);

    // The unaffected project should be referentially identical
    expect(nextState.studio.internal.projects[1]).toBe(unaffectedProject);
  });
});

import { generateScandals } from "../../../engine/systems/scandals";
import { Talent } from "../../../engine/types";
import { vi, afterEach } from "vitest";

describe("generateScandals", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates no scandals when risk is low", () => {
    vi.spyOn(utils, "secureRandom").mockReturnValue(0.99); // 990 > risk (5)
    const talent: Talent = { id: "t1", name: "Safe Actor", controversyRisk: 5 } as Talent;
    const state = {
      industry: { talentPool: [talent] },
      studio: { internal: { contracts: [], projects: [] } },
      week: 1
    } as unknown as GameState;

    const result = generateScandals(state);

    expect(result.newScandals).toHaveLength(0);
    expect(result.headlines).toHaveLength(0);
    expect(result.projectUpdates).toHaveLength(0);
  });

  it("generates a scandal for unattached talent", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("uuid-1234");

    // secureRandom calls:
    // 1. risk check: 0.001 * 1000 = 1 < 5 (true)
    // 2. type index: 0.5 * 5 = 2.5 -> floor(2.5) = 2 ('onset_behavior')
    // 3. severity: 0.1 * 80 = 8 -> 20 + 8 = 28
    // 4. weeksRemaining: 0.5 * 8 = 4 -> 4 + 4 = 8
    vi.spyOn(utils, "secureRandom")
      .mockReturnValueOnce(0.001)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.5);

    const talent: Talent = { id: "t1", name: "Risky Actor", controversyRisk: 5 } as Talent;
    const state = {
      industry: { talentPool: [talent] },
      studio: { internal: { contracts: [], projects: [] } },
      week: 1
    } as unknown as GameState;

    const result = generateScandals(state);

    expect(result.newScandals).toHaveLength(1);
    expect(result.newScandals[0]).toEqual({
      id: "uuid-1234",
      talentId: "t1",
      severity: 28,
      type: "onset_behavior",
      weeksRemaining: 8
    });

    expect(result.headlines).toHaveLength(1);
    expect(result.headlines[0]).toEqual({
      id: "uuid-1234",
      week: 1,
      category: "talent",
      text: "PR NIGHTMARE: Massive onset_behavior scandal erupts violently around Risky Actor!"
    });

    expect(result.projectUpdates).toHaveLength(0);
  });

  it("generates a scandal and project crisis for attached talent", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("uuid-1234");

    // secureRandom calls:
    // 1. risk check: 0.001 * 1000 = 1 < 5 (true)
    // 2. type index: 0.5 * 5 = 2.5 -> floor(2.5) = 2 ('onset_behavior')
    // 3. severity: 0.1 * 80 = 8 -> 20 + 8 = 28 (<= 75 -> 'high')
    // 4. weeksRemaining: 0.5 * 8 = 4 -> 4 + 4 = 8
    vi.spyOn(utils, "secureRandom")
      .mockReturnValueOnce(0.001)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.5);

    const talent: Talent = { id: "t1", name: "Risky Actor", controversyRisk: 5 } as Talent;
    const contract: Contract = { id: "c1", talentId: "t1", projectId: "p1" } as Contract;
    const project: Project = { id: "p1", title: "Test Project" } as Project;

    const state = {
      industry: { talentPool: [talent] },
      studio: { internal: { contracts: [contract], projects: [project] } },
      week: 1
    } as unknown as GameState;

    const result = generateScandals(state);

    expect(result.newScandals).toHaveLength(1);
    expect(result.headlines).toHaveLength(1);

    expect(result.projectUpdates).toHaveLength(1);
    expect(result.projectUpdates[0].projectId).toBe("p1");
    expect(result.projectUpdates[0].crisis.severity).toBe("high");
    expect(result.projectUpdates[0].crisis.description).toContain("BREAKING NEWS: RISKY ACTOR has been involved in a massive onset_behavior scandal while working on \"Test Project\".");
    expect(result.projectUpdates[0].crisis.options[1].cashPenalty).toBe(280000); // 28 * 10000
  });

  it("calculates catastrophic severity correctly", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("uuid-1234");

    // secureRandom calls:
    // 1. risk check: 0.001
    // 2. type index: 0.5
    // 3. severity: 0.9 * 80 = 72 -> 20 + 72 = 92 (> 75 -> 'catastrophic')
    // 4. weeksRemaining: 0.5
    vi.spyOn(utils, "secureRandom")
      .mockReturnValueOnce(0.001)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.5);

    const talent: Talent = { id: "t1", name: "Risky Actor", controversyRisk: 5 } as Talent;
    const contract: Contract = { id: "c1", talentId: "t1", projectId: "p1" } as Contract;
    const project: Project = { id: "p1", title: "Test Project" } as Project;

    const state = {
      industry: { talentPool: [talent] },
      studio: { internal: { contracts: [contract], projects: [project] } },
      week: 1
    } as unknown as GameState;

    const result = generateScandals(state);

    expect(result.projectUpdates).toHaveLength(1);
    expect(result.projectUpdates[0].crisis.severity).toBe("catastrophic");
    expect(result.projectUpdates[0].crisis.options[1].cashPenalty).toBe(920000); // 92 * 10000
  });

  it("calculates high severity correctly", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("uuid-1234");

    // secureRandom calls:
    // 1. risk check: 0.001
    // 2. type index: 0.5
    // 3. severity: 0.68 * 80 = 54.4 -> floor -> 54 -> 20 + 54 = 74 (<= 75 -> 'high')
    // 4. weeksRemaining: 0.5
    vi.spyOn(utils, "secureRandom")
      .mockReturnValueOnce(0.001)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.68)
      .mockReturnValueOnce(0.5);

    const talent: Talent = { id: "t1", name: "Risky Actor", controversyRisk: 5 } as Talent;
    const contract: Contract = { id: "c1", talentId: "t1", projectId: "p1" } as Contract;
    const project: Project = { id: "p1", title: "Test Project" } as Project;

    const state = {
      industry: { talentPool: [talent] },
      studio: { internal: { contracts: [contract], projects: [project] } },
      week: 1
    } as unknown as GameState;

    const result = generateScandals(state);

    expect(result.projectUpdates).toHaveLength(1);
    expect(result.projectUpdates[0].crisis.severity).toBe("high");
    expect(result.projectUpdates[0].crisis.options[1].cashPenalty).toBe(740000); // 74 * 10000
  });
});

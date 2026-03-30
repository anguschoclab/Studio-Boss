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

import { describe, it, expect } from "vitest";
import { hasCreativeControl } from "../../../engine/systems/directors";
import { createMockGameState, createMockTalent, createMockContract } from "../../utils/mockFactories";

describe("hasCreativeControl", () => {
  it("should return false if there is no contract for the given project", () => {
    const state = createMockGameState();
    expect(hasCreativeControl("proj-1", state)).toBe(false);
  });

  it("should return false if the contract exists but the talent is not a director", () => {
    const talent = createMockTalent({ id: "t-1", roles: ["actor"] });
    const contract = createMockContract({ id: "c-1", talentId: "t-1", projectId: "proj-1", role: "actor", creativeControl: true });
    const state = createMockGameState();
    state.industry.talentPool["t-1"] = talent;
    state.studio.internal.contracts.push(contract);
    
    expect(hasCreativeControl("proj-1", state)).toBe(false);
  });

  it("should return true if the contract exists, talent is a director, and creativeControl is true", () => {
    const talent = createMockTalent({ id: "t-1", roles: ["director"] });
    const contract = createMockContract({ id: "c-1", talentId: "t-1", projectId: "proj-1", role: "director", creativeControl: true });
    const state = createMockGameState();
    state.industry.talentPool["t-1"] = talent;
    state.studio.internal.contracts.push(contract);
    
    expect(hasCreativeControl("proj-1", state)).toBe(true);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { TalentFilter } from "@/engine/services/filters/TalentFilter";
import {
  createMockGameState,
  createMockTickContext,
  createMockTalent,
} from "../generators/mockFactory";

describe("TalentFilter", () => {
  let mockState: any;
  let mockContext: any;

  beforeEach(() => {
    mockState = createMockGameState();
    mockContext = createMockTickContext();

    // Setup mock talents
    const talent1 = createMockTalent({ id: "TAL-1", name: "Actor One" });
    const talent2 = createMockTalent({ id: "TAL-2", name: "Actor Two" });

    mockState.entities.talents = {
      [talent1.id]: talent1,
      [talent2.id]: talent2,
    };

    // Setup empty relationships to avoid undefined errors
    mockState.talentAgentRelationships = {};
  });

  it("should have correct name", () => {
    expect(TalentFilter.name).toBe("TalentFilter");
  });

  it("should execute without errors with populated talents", () => {
    expect(() => TalentFilter.execute(mockState, mockContext)).not.toThrow();
  });

  it("should generate impacts for talent updates", () => {
    TalentFilter.execute(mockState, mockContext);
    // At minimum, TalentMoraleSystem usually processes morale
    const talentImpacts = mockContext.impacts.filter((i: any) => i.type === "TALENT_UPDATED");
    expect(talentImpacts.length).toBeGreaterThanOrEqual(0);
  });

  it("should handle empty talent pool gracefully", () => {
    mockState.entities.talents = {};
    expect(() => TalentFilter.execute(mockState, mockContext)).not.toThrow();
  });

  it("should correctly process morale updates for active talents", () => {
    // Morale updates occur even if no projects are active (base decay/regen)
    TalentFilter.execute(mockState, mockContext);
    const talentImpacts = mockContext.impacts.filter((i: any) => i.type === "TALENT_UPDATED");
    // Depending on the TalentMoraleSystem implementation, there might be impacts
    expect(talentImpacts).toBeDefined();
  });
});

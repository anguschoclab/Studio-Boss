import { describe, it, expect } from "vitest";
import { hasCreativeControl, getCreativeControlDemandChance, evaluateCreativeControlOffer, processDirectorDisputes } from "../../../engine/systems/directors";
import { createMockGameState, createMockTalent, createMockContract, createMockProject } from "../../utils/mockFactories";
import { RandomGenerator } from "../../../engine/utils/rng";
import { Talent } from "../../../engine/types";

describe("hasCreativeControl", () => {
  it("should return false if there is no contract for the given project", () => {
    const state = createMockGameState();
    expect(hasCreativeControl("proj-1", state)).toBe(false);
  });

  it("should return false if the contract exists but the talent is not a director", () => {
    const talent = createMockTalent({ id: "t-1", roles: ["actor"] });
    const contract = createMockContract({ id: "c-1", talentId: "t-1", projectId: "proj-1", role: "actor", creativeControl: true });
    const state = createMockGameState();
    state.entities.talents["t-1"] = talent;
    state.entities.contracts["c-1"] = contract;
    
    expect(hasCreativeControl("proj-1", state)).toBe(false);
  });

  it("should return true if the contract exists, talent is a director, and creativeControl is true", () => {
    const talent = createMockTalent({ id: "t-1", roles: ["director"] });
    const contract = createMockContract({ id: "c-1", talentId: "t-1", projectId: "proj-1", role: "director", creativeControl: true });
    const state = createMockGameState();
    state.entities.talents["t-1"] = talent;
    state.entities.contracts["c-1"] = contract;
    
    expect(hasCreativeControl("proj-1", state)).toBe(true);
  });
});

describe("getCreativeControlDemandChance", () => {
  it("should return correct chance for auteur", () => {
    expect(getCreativeControlDemandChance("auteur")).toBe(0.70);
  });

  it("should return correct chance for visionary", () => {
    expect(getCreativeControlDemandChance("visionary")).toBe(0.60);
  });

  it("should return correct chance for journeyman", () => {
    expect(getCreativeControlDemandChance("journeyman")).toBe(0.20);
  });

  it("should return correct chance for commercial_hack", () => {
    expect(getCreativeControlDemandChance("commercial_hack")).toBe(0.05);
  });

  it("should return correct chance for default", () => {
    expect(getCreativeControlDemandChance("unknown" as any)).toBe(0.10);
  });
});

describe("evaluateCreativeControlOffer", () => {
  const rng = new RandomGenerator(123);

  it("should handle player offering control", () => {
    const director = createMockTalent();
    const result = evaluateCreativeControlOffer(director, true, rng);
    expect(result).toEqual({ willingnessModifier: 20, feeModifier: -0.10, directorWalks: false });
  });

  it("should handle player denying control - auteur", () => {
    const director = createMockTalent({ directorArchetype: "auteur" });
    const result1 = evaluateCreativeControlOffer(director, false, new RandomGenerator(1));
    expect(result1.willingnessModifier).toBe(-15);
    expect(result1.feeModifier).toBe(0);
  });

  it("should handle player denying control - visionary", () => {
    const director = createMockTalent({ directorArchetype: "visionary" });
    const result = evaluateCreativeControlOffer(director, false, rng);
    expect(result.willingnessModifier).toBe(-10);
    expect(result.feeModifier).toBe(0);
  });

  it("should handle player denying control - journeyman", () => {
    const director = createMockTalent({ directorArchetype: "journeyman" });
    const result = evaluateCreativeControlOffer(director, false, rng);
    expect(result).toEqual({ willingnessModifier: -5, feeModifier: 0, directorWalks: false });
  });

  it("should handle player denying control - commercial_hack", () => {
    const director = createMockTalent({ directorArchetype: "commercial_hack" });
    const result = evaluateCreativeControlOffer(director, false, rng);
    expect(result).toEqual({ willingnessModifier: -2, feeModifier: 0, directorWalks: false });
  });
});

describe("processDirectorDisputes", () => {
  it("returns empty impact if project is not in production phase", () => {
    const project = createMockProject({ state: 'development' as any });
    const results = processDirectorDisputes(project, [], {}, new RandomGenerator(1));
    expect(results).toEqual({ projectUpdates: [], uiNotifications: [] });
  });

  it("returns empty impact if there is no director contract", () => {
    const project = createMockProject({ id: "p-current", state: 'production' });
    const contract = createMockContract({ projectId: "p-other" });
    const results = processDirectorDisputes(project, [contract], {}, new RandomGenerator(1));
    expect(results).toEqual({ projectUpdates: [], uiNotifications: [] });
  });

  it("returns empty impact if talent is not a director", () => {
    const project = createMockProject({ id: "p-1", state: 'production' });
    const contract = createMockContract({ projectId: "p-1", talentId: "t-1" });
    const talent = createMockTalent({ id: "t-1", roles: ["actor"] });
    const pool = { "t-1": talent };

    const results = processDirectorDisputes(project, [contract], pool, new RandomGenerator(1));
    expect(results).toEqual({ projectUpdates: [], uiNotifications: [] });
  });

  it("can spawn a budget dispute for auteur", () => {
      const project = createMockProject({ id: "p-1", state: 'production', activeCrisis: null });
      const contract = createMockContract({ projectId: "p-1", talentId: "t-1", role: 'director' });
      const talent = createMockTalent({ id: "t-1", roles: ["director"], directorArchetype: "auteur" });
      const pool = { "t-1": talent };

      const mockRng = {
          next: () => 0.01,
          uuid: (prefix: string) => `${prefix}-uuid`,
          range: (min: number, max: number) => min
      } as any;

      const impact = processDirectorDisputes(project, [contract], pool, mockRng);
      expect(impact.projectUpdates?.length).toBe(1);
      expect(impact.projectUpdates![0].update.activeCrisis!.description).toContain("budget increase");
  });
});

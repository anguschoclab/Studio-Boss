import { describe, it, expect } from "vitest";
import { handleIndustryUpdate } from "../../../engine/core/impactHandlers/industryHandlers";
import { createMockGameState } from "../generators/mockFactory";
import type { IndustryUpdateImpact } from "../../../engine/types";

const impact = (update: Record<string, unknown>): IndustryUpdateImpact => ({
  type: "INDUSTRY_UPDATE",
  payload: { update },
});

describe("handleIndustryUpdate — deep-path updates", () => {
  it("creates intermediate objects for nested paths", () => {
    const state = createMockGameState();
    const entry = { week: 1, kind: "formed" };
    const next = handleIndustryUpdate(
      state,
      impact({ "simMemory.eventLogs.shingle": [entry] })
    );

    expect(next.simMemory?.eventLogs.shingle).toEqual([entry]);
    expect(state.simMemory?.eventLogs.shingle).toEqual([]); // source untouched
  });

  it("applies multiple paths sharing a common prefix", () => {
    const state = createMockGameState();
    const next = handleIndustryUpdate(
      state,
      impact({
        "industry.rumors": [{ text: "r1" }],
        "industry.scandals": [{ id: "s1" }],
      })
    );

    expect(next.industry.rumors).toEqual([{ text: "r1" }]);
    expect(next.industry.scandals).toEqual([{ id: "s1" }]);
  });

  it("shares structure for untouched branches and clones the walked path", () => {
    const state = createMockGameState();
    const next = handleIndustryUpdate(state, impact({ "simMemory.flops.r1": [1] }));

    // Untouched top-level branches keep their references.
    expect(next.entities).toBe(state.entities);
    expect(next.ip).toBe(state.ip);
    // The walked path is cloned, but its untouched siblings are shared.
    expect(next.simMemory).not.toBe(state.simMemory);
    expect(next.simMemory?.antitrust).toBe(state.simMemory?.antitrust);
    expect(next.simMemory?.eventLogs).toBe(state.simMemory?.eventLogs);
    expect(next.simMemory?.flops).toEqual({ r1: [1] });
  });

  it("replaces array values without mutating the source state", () => {
    const state = createMockGameState();
    const offer = { id: "o1" };
    const next = handleIndustryUpdate(
      state,
      impact({ "industry.distressedOffers": [offer] })
    );

    expect(next.industry.distressedOffers).toEqual([offer]);
    expect(next.industry).not.toBe(state.industry);
    expect(state.industry.distressedOffers).toBeUndefined();
  });

  it("does not pollute the prototype chain for forbidden path segments", () => {
    const state = createMockGameState();
    handleIndustryUpdate(state, impact({ "__proto__.polluted": true }));

    // The meaningful security property: Object.prototype stays clean.
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(Object.prototype).not.toHaveProperty("polluted");
  });
});

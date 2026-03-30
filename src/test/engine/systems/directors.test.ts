import { describe, it, expect } from "vitest";
import { hasCreativeControl } from "../../../engine/systems/directors";
import { GameState } from "../../../engine/types";

describe.skip("hasCreativeControl", () => {
  const createMockState = (talentPool: any[], contracts: any[]): GameState => {
    return {
      studio: {
        internal: {
          contracts,
        },
      },
      industry: {
        talentPool,
      },
    } as unknown as GameState;
  };

  it("should return false if there is no contract for the given project", () => {
    const state = createMockState([], []);
    expect(hasCreativeControl("proj-1", state)).toBe(false);
  });

  it("should return false if the contract exists but the talent is not a director", () => {
    const state = createMockState(
      [{ id: "t-1", roles: ["actor"] }],
      [{ talentId: "t-1", projectId: "proj-1", creativeControl: true }]
    );
    expect(hasCreativeControl("proj-1", state)).toBe(false);
  });

  it("should return false if the contract exists, talent is a director, but creativeControl is false or undefined", () => {
    const state1 = createMockState(
      [{ id: "t-1", roles: ["director"] }],
      [{ talentId: "t-1", projectId: "proj-1", creativeControl: false }]
    );
    expect(hasCreativeControl("proj-1", state1)).toBe(false);

    const state2 = createMockState(
      [{ id: "t-1", roles: ["director"] }],
      [{ talentId: "t-1", projectId: "proj-1" }] // no creativeControl property
    );
    expect(hasCreativeControl("proj-1", state2)).toBe(false);
  });

  it("should return true if the contract exists, talent is a director, and creativeControl is true", () => {
    const state = createMockState(
      [{ id: "t-1", roles: ["director"] }],
      [{ talentId: "t-1", projectId: "proj-1", creativeControl: true }]
    );
    expect(hasCreativeControl("proj-1", state)).toBe(true);
  });
});

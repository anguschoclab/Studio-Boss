import {describe, it, expect} from "vitest";
import {
  haveWorkedTogether,
  haveCompeted,
  getRelationship,
} from "@/engine/systems/talent/relationshipFormation";
import {GameState} from "@/engine/types";

function makeState(overrides: {
  projects?: Record<string, { id: string; attachedTalentIds?: string[] }>;
  awards?: Array<{ projectId: string }>;
  relationships?: Record<string, unknown>;
}): GameState {
  return {
    entities: { projects: overrides.projects ?? {} },
    industry: { awards: overrides.awards ?? [] },
    relationships: overrides.relationships
      ? { relationships: overrides.relationships }
      : undefined,
  } as unknown as GameState;
}

describe("haveWorkedTogether", () => {
  const projects = {
    p1: { id: "p1", attachedTalentIds: ["t1", "t2"] },
    p2: { id: "p2", attachedTalentIds: ["t3"] },
    p3: { id: "p3" },
  };

  it("returns true when both talents are attached to the same project", () => {
    expect(haveWorkedTogether("t1", "t2", makeState({ projects }))).toBe(true);
  });

  it("returns false when talents share no project", () => {
    expect(haveWorkedTogether("t1", "t3", makeState({ projects }))).toBe(false);
  });

  it("returns false for a talent pair on a project with no attachedTalentIds", () => {
    expect(haveWorkedTogether("t1", "t3", makeState({ projects: { p3: projects.p3 } }))).toBe(
      false
    );
  });

  it("returns false with an empty project dictionary", () => {
    expect(haveWorkedTogether("t1", "t2", makeState({}))).toBe(false);
  });

  it("prefers the provided projectTalentMap over state.projects", () => {
    const map = new Map<string, Set<string>>([["px", new Set(["t9", "t8"])]]);
    expect(haveWorkedTogether("t8", "t9", makeState({ projects }), map)).toBe(true);
    expect(haveWorkedTogether("t1", "t2", makeState({ projects }), map)).toBe(false);
  });
});

describe("haveCompeted", () => {
  const projects = {
    p1: { id: "p1", attachedTalentIds: ["t1", "t2"] },
    p2: { id: "p2", attachedTalentIds: ["t1", "t3"] },
  };

  it("returns true when both talents are on the same award-listed project", () => {
    const state = makeState({ projects, awards: [{ projectId: "p1" }] });
    expect(haveCompeted("t1", "t2", state)).toBe(true);
  });

  it("returns false when the shared project has no award", () => {
    const state = makeState({ projects, awards: [{ projectId: "p2" }] });
    // t2 is only on p1, which is not awarded
    expect(haveCompeted("t2", "t3", state)).toBe(false);
  });

  it("returns false when no awards exist", () => {
    expect(haveCompeted("t1", "t2", makeState({ projects }))).toBe(false);
  });

  it("prefers provided awardedProjectsTalentSets", () => {
    const sets = [new Set(["t4", "t5"])];
    expect(haveCompeted("t4", "t5", makeState({ projects }), sets)).toBe(true);
    expect(haveCompeted("t1", "t2", makeState({ projects }), sets)).toBe(false);
  });
});

describe("getRelationship", () => {
  it("returns the stored relationship for a pair regardless of id order", () => {
    const rel = { type: "friend", strength: 60 };
    const state = makeState({ relationships: { "t1-t2": rel } });
    const found = getRelationship("t1", "t2", state);
    expect(found).toEqual(rel);
  });

  it("returns null when no relationship exists", () => {
    expect(getRelationship("t1", "t2", makeState({}))).toBeNull();
  });
});

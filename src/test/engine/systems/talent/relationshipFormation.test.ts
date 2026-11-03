import { describe, it, expect } from "vitest";
import {
  haveWorkedTogether,
  haveCompeted,
  getRelationship,
  checkNaturalFormation,
} from "@/engine/systems/talent/relationshipFormation";
import { RandomGenerator } from "@/engine/utils/rng";
import { createMockTalent } from "../../../utils/mockFactories";
import { GameState } from "@/engine/types";

function makeState(overrides: {
  projects?: Record<string, { id: string; attachedTalentIds?: string[] }>;
  awards?: Array<{ projectId: string }>;
  relationships?: Record<string, unknown>;
}): GameState {
  return {
    entities: { projects: overrides.projects ?? {} },
    industry: { awards: overrides.awards ?? [] },
    relationships: overrides.relationships ? { relationships: overrides.relationships } : undefined,
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

describe("checkNaturalFormation", () => {
  const stubRng = (next: number) => ({ next: () => next }) as unknown as RandomGenerator;
  const workedTogether = (a: string, b: string) =>
    new Map<string, Set<string>>([["p1", new Set([a, b])]]);

  // Exact-zero compatibility pair: age 18yr apart (0), different countries (0),
  // difficult x artistic (-5), non-clashing archetypes (0), adjacent tiers (+5).
  const zeroCompatA = () =>
    createMockTalent({
      id: "za",
      demographics: { age: 30, gender: "MALE", ethnicity: "Caucasian", country: "USA" },
      personality: "difficult",
      actorArchetype: "movie_star",
      tier: "C_LIST",
    });
  const zeroCompatB = () =>
    createMockTalent({
      id: "zb",
      demographics: { age: 48, gender: "FEMALE", ethnicity: "Caucasian", country: "UK" },
      personality: "artistic",
      actorArchetype: "character_actor",
      tier: "B_LIST",
    });

  it("never forms a relationship at exactly zero compatibility", () => {
    // With no shared award and mentor preconditions unmet, every probability
    // gate resolves to null regardless of the rng draw.
    const a = zeroCompatA();
    const b = zeroCompatB();
    const map = workedTogether(a.id, b.id);
    for (const draw of [0, 0.3, 0.99]) {
      expect(
        checkNaturalFormation(a, b, makeState({}), stubRng(draw), map, [])
      ).toBeNull();
    }
  });

  it("returns null at compatibility exactly 20 (threshold is strictly > 20)", () => {
    // same-age (+15) + same country (+10) + clashing archetypes (-10)
    // + adjacent tiers (+5) = 20
    const a = createMockTalent({
      id: "ta",
      actorArchetype: "movie_star",
      tier: "C_LIST",
    });
    const b = createMockTalent({
      id: "tb",
      actorArchetype: "prestige_actor",
      tier: "B_LIST",
    });
    const map = workedTogether(a.id, b.id);
    expect(checkNaturalFormation(a, b, makeState({}), stubRng(0), map, [])).toBeNull();
  });

  it("forms a friendship at compatibility 25 when the probability gate passes", () => {
    // same-age (+15) + same country (+10) + clashing archetypes (-10)
    // + same tier (+10) = 25
    const a = createMockTalent({
      id: "ta",
      actorArchetype: "movie_star",
      tier: "C_LIST",
    });
    const b = createMockTalent({
      id: "tb",
      actorArchetype: "prestige_actor",
      tier: "C_LIST",
    });
    const map = workedTogether(a.id, b.id);
    const formation = checkNaturalFormation(a, b, makeState({}), stubRng(0), map, []);
    expect(formation).toMatchObject({ type: "friend", strength: 75 });
  });

  it("still returns null at compatibility 25 when the probability gate fails", () => {
    const a = createMockTalent({
      id: "ta",
      actorArchetype: "movie_star",
      tier: "C_LIST",
    });
    const b = createMockTalent({
      id: "tb",
      actorArchetype: "prestige_actor",
      tier: "C_LIST",
    });
    const map = workedTogether(a.id, b.id);
    // rng.next() = 0.99 fails the < 0.4 friendship gate; no other path applies.
    expect(checkNaturalFormation(a, b, makeState({}), stubRng(0.99), map, [])).toBeNull();
  });

  it("can form a mentor relationship even at zero compatibility", () => {
    // The mentor path ignores compatibility: age diff >15, mentor prestige >70,
    // mentee prestige <60. compat: 20yr gap (0) + diff country (0)
    // + collaborative x charismatic (+15) + A_LIST x C_LIST (-15) = 0.
    const mentor = createMockTalent({
      id: "senior",
      demographics: { age: 50, gender: "MALE", ethnicity: "Caucasian", country: "USA" },
      personality: "collaborative",
      actorArchetype: "movie_star",
      tier: "A_LIST",
      prestige: 75,
    });
    const mentee = createMockTalent({
      id: "junior",
      demographics: { age: 30, gender: "FEMALE", ethnicity: "Caucasian", country: "UK" },
      personality: "charismatic",
      actorArchetype: "character_actor",
      tier: "C_LIST",
      prestige: 50,
    });
    const formation = checkNaturalFormation(
      mentor,
      mentee,
      makeState({}),
      stubRng(0),
      undefined,
      []
    );
    expect(formation).toMatchObject({ type: "mentor", strength: 60 });
  });

  it("returns null when the pair already has a relationship", () => {
    const a = createMockTalent({ id: "aa" });
    const b = createMockTalent({ id: "bb" });
    const state = makeState({
      relationships: { "aa-bb": { type: "friend", strength: 60 } },
    });
    const map = workedTogether(a.id, b.id);
    expect(checkNaturalFormation(a, b, state, stubRng(0), map, [])).toBeNull();
  });
});

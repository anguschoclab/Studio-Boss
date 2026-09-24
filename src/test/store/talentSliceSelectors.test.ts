import { describe, it, expect } from "vitest";
import { useGameStore } from "@/store/gameStore";
import type { Talent } from "@/engine/types";

/**
 * Shape-pinning tests for talentSlice selector-style getters before the
 * `as any` sweep touches their signatures. Runtime semantics are pinned;
 * the refactor may only tighten the declared types.
 */

const talent = (overrides: Partial<Talent> = {}): Talent =>
  ({
    id: "t1",
    name: "Test Talent",
    prestige: 60,
    draw: 50,
    filmography: [
      { title: "Big Hit", year: 2000, role: "actor", gross: 200_000_000 },
      { title: "Flop", year: 2001, role: "actor", gross: 1_000 },
    ],
    careerGross: 200_001_000,
    highestSalaryMovie: { title: "Big Hit", salary: 20_000_000 },
    highestSalaryTv: { title: "Show", salary: 1_000_000 },
    starMeter: 72,
    ...overrides,
  }) as Talent;

function withTalent(t: Talent) {
  useGameStore.setState({
    gameState: {
      entities: { talents: { [t.id]: t }, projects: {}, contracts: {}, rivals: {} },
    },
  } as never);
}

describe("talentSlice selectors (shape pins)", () => {
  it("getTalentFilmography returns the talent's filmography array", () => {
    const t = talent();
    withTalent(t);
    const films = useGameStore.getState().getTalentFilmography("t1");
    expect(films).toHaveLength(2);
    expect(films[0]).toMatchObject({ title: "Big Hit", gross: 200_000_000 });
  });

  it("getTalentFilmography returns [] for unknown talent", () => {
    withTalent(talent());
    expect(useGameStore.getState().getTalentFilmography("nope")).toEqual([]);
  });

  it("getTalentCareerStats returns gross/salary/starMeter shape", () => {
    const t = talent();
    withTalent(t);
    const stats = useGameStore.getState().getTalentCareerStats("t1");
    expect(stats).toMatchObject({
      careerGross: 200_001_000,
      starMeter: 72,
    });
    expect(stats.highestSalaryMovie).toMatchObject({ title: "Big Hit" });
  });

  it("calculateStarMeter derives momentum from recent filmography", () => {
    const t = talent();
    withTalent(t);
    const meter = useGameStore.getState().calculateStarMeter("t1");
    expect(typeof meter).toBe("number");
    expect(meter).toBeGreaterThan(0);
  });

  it("calculateStarMeter defaults to 50 for unknown talent", () => {
    withTalent(talent());
    expect(useGameStore.getState().calculateStarMeter("ghost")).toBe(50);
  });
});

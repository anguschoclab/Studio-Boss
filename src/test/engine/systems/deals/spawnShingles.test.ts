import { describe, it, expect } from "vitest";
import { tickShingleSystem } from "@/engine/systems/deals/ShingleSystem";
import type { RandomGenerator } from "@/engine/utils/rng";
import type { StateImpact } from "@/engine/types";
import { createMockGameState, createMockRival } from "../../generators/mockFactory";

// Forced RNG — deterministic values under every spawn gate, pick() returns the
// first eligible pool member so assertions pin pool membership + ordering.
const forcedRng = {
  next: () => 0.001,
  range: (lo: number) => lo,
  rangeInt: (lo: number) => lo,
  pick: <T>(arr: T[]): T => arr[0],
  uuid: (prefix: string) => `${prefix}-test`,
  getState: () => 0,
} as unknown as RandomGenerator;

function findCreatedShingle(impacts: StateImpact[]) {
  const impact = impacts.find((i) => i.type === "SHINGLE_CREATED");
  return (
    impact?.payload as
      | { shingle?: { ownerTalentId?: string; medium?: string; dealType?: string } }
      | undefined
  )?.shingle;
}

function makeTalent(id: string, roles: string[], prestige: number) {
  return { id, name: id, role: roles[0], roles, prestige } as any;
}

function makeState(talents: Record<string, unknown>, shingles: Record<string, unknown> = {}) {
  return createMockGameState({
    week: 1872, // year 2011 — tvGate = 0.008, well above forced next() = 0.001
    finance: { ...createMockGameState().finance, cash: 500_000_000 },
    entities: {
      ...createMockGameState().entities,
      talents,
      shingles,
      rivals: { "rival-1": createMockRival({ id: "rival-1", cash: 50_000_000 }) },
    } as any,
  });
}

describe("spawnShingles eligibility pools", () => {
  it("picks the first TV-eligible talent for the TV showrunner spawn", () => {
    // talent-owned is listed first and is writer-eligible, but already owns a
    // shingle — if the ownedBy exclusion regresses, pick(arr[0]) returns it.
    const state = makeState(
      {
        "talent-owned": makeTalent("talent-owned", ["writer"], 95),
        "talent-writer": makeTalent("talent-writer", ["writer"], 80),
      },
      {
        "sh-1": {
          id: "sh-1",
          name: "Owned Co",
          ownerTalentId: "talent-owned",
          baseStudioId: "rival-1",
          medium: "FILM",
          termWeeksRemaining: 200,
          overheadPerYear: 0,
        },
      }
    );

    const shingle = findCreatedShingle(tickShingleSystem(state, forcedRng));
    expect(shingle).toBeDefined();
    expect(shingle?.ownerTalentId).toBe("talent-writer");
    expect(shingle?.medium).toBe("TV");
  });

  it("falls through to the film pool when no talent is TV-eligible", () => {
    const state = makeState({
      "talent-director": makeTalent("talent-director", ["director"], 70),
    });

    const shingle = findCreatedShingle(tickShingleSystem(state, forcedRng));
    expect(shingle).toBeDefined();
    expect(shingle?.ownerTalentId).toBe("talent-director");
    expect(shingle?.medium).toBe("FILM");
  });

  it("falls through to the low-prospect housekeeping pool for sub-A-list producers", () => {
    // prestige 35 + producer: too low for TV (>=40) or film (>=45) pools,
    // lands only in the 30-49 lowProspect bucket.
    const state = makeState({
      "talent-lowprod": makeTalent("talent-lowprod", ["producer"], 35),
    });

    const shingle = findCreatedShingle(tickShingleSystem(state, forcedRng));
    expect(shingle).toBeDefined();
    expect(shingle?.ownerTalentId).toBe("talent-lowprod");
    expect(shingle?.dealType).toBe("HOUSEKEEPING");
  });
});

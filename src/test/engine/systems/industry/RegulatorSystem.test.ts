import {describe, it, expect} from "vitest";
import {RegulatorSystem} from "@/engine/systems/industry/RegulatorSystem";
import {GameState} from "@/engine/types";

function makeState(overrides: {
  playerPrestige?: number;
  rivalPrestige?: Record<string, number>;
  buyers?: Array<{ archetype: string; ownerId?: string; subscribers?: number }>;
  studioName?: string;
}): GameState {
  const rivals: Record<string, unknown> = {};
  for (const [id, prestige] of Object.entries(overrides.rivalPrestige ?? {})) {
    rivals[id] = { id, prestige, cash: 5_000_000 };
  }
  return {
    week: 10,
    studio: { id: "PLAYER", name: overrides.studioName ?? "Test Studio", prestige: overrides.playerPrestige ?? 50 },
    entities: { rivals },
    market: { buyers: overrides.buyers ?? [], opportunities: [] },
    industry: {},
  } as unknown as GameState;
}

describe("RegulatorSystem.getMarketShare", () => {
  it("computes prestige-weighted share for the player", () => {
    // player 100 prestige vs one rival at 100 → prestige share 50%,
    // no streamers → sub share 0 → 50 * 0.6 = 30
    const state = makeState({ playerPrestige: 100, rivalPrestige: { R1: 100 } });
    expect(RegulatorSystem.getMarketShare(state, "player")).toBeCloseTo(30, 5);
  });

  it("factors in streamer subscriber share (40% weight)", () => {
    // Equal prestige (50/50) → prestige share 50%. Player owns the only
    // streamer with 1000 subs → sub share 100% → 30 + 40 = 70
    const state = makeState({
      playerPrestige: 50,
      rivalPrestige: { R1: 50 },
      buyers: [{ archetype: "streamer", ownerId: "PLAYER", subscribers: 1000 }],
    });
    expect(RegulatorSystem.getMarketShare(state, "player")).toBeCloseTo(70, 5);
  });

  it("ignores non-streamer buyers in subscriber share", () => {
    const state = makeState({
      playerPrestige: 50,
      rivalPrestige: { R1: 50 },
      buyers: [
        { archetype: "streamer", ownerId: "PLAYER", subscribers: 500 },
        { archetype: "cinema", ownerId: "R1", subscribers: 5000 },
        { archetype: "streamer", ownerId: "R1", subscribers: 500 },
      ],
    });
    // prestige share 50%, sub share 50% → 30 + 20 = 50
    expect(RegulatorSystem.getMarketShare(state, "player")).toBeCloseTo(50, 5);
  });

  it("computes share for a specific rival by id", () => {
    const state = makeState({ playerPrestige: 60, rivalPrestige: { R1: 60 } });
    expect(RegulatorSystem.getMarketShare(state, "R1")).toBeCloseTo(30, 5);
  });

  it("returns 0 prestige share for an unknown studio id", () => {
    const state = makeState({ playerPrestige: 100 });
    expect(RegulatorSystem.getMarketShare(state, "NOPE")).toBeCloseTo(0, 5);
  });
});

describe("RegulatorSystem.tick — regulatory headlines", () => {
  it("emits a HEADLINE_POSTED impact carrying newsEvents when player share > 30", () => {
    const state = makeState({ playerPrestige: 100 });
    const rng = { next: () => 0.0, range: () => 0, uuid: () => "x" };
    const impacts = RegulatorSystem.tick(state, rng as never);

    expect(impacts.length).toBe(1);
    expect(impacts[0].type).toBe("HEADLINE_POSTED");
    // News must flow through the unified model: impact.newsEvents is collected
    // by WeekCoordinator.buildSummary into WeekSummary.newsEvents. Emitting the
    // headline only in the payload means it is silently dropped.
    expect(Array.isArray(impacts[0].newsEvents)).toBe(true);
    expect(impacts[0].newsEvents!.length).toBe(1);
    expect(impacts[0].newsEvents![0].headline).toContain("REGULATORY WATCH");
    expect(impacts[0].newsEvents![0].type).toBe("STUDIO_EVENT");
  });

  it("emits nothing when player share is low", () => {
    const state = makeState({ playerPrestige: 10, rivalPrestige: { R1: 990 } });
    const rng = { next: () => 0.0, range: () => 0, uuid: () => "x" };
    expect(RegulatorSystem.tick(state, rng as never)).toEqual([]);
  });

  it("respects the rng gate even when share > 30", () => {
    const state = makeState({ playerPrestige: 100 });
    const rng = { next: () => 0.99, range: () => 0, uuid: () => "x" };
    expect(RegulatorSystem.tick(state, rng as never)).toEqual([]);
  });
});

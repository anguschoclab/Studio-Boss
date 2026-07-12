import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  tickConsolidation,
  resetConsolidationState,
} from "@/engine/systems/industry/ConsolidationEngine";
import { antitrustBlockList, resetAntitrustState } from "@/engine/systems/industry/Antitrust";
import { GameState } from "@/engine/types";
import { createMockGameState, createMockRival } from "../../generators/mockFactory";

import * as utils from "@/engine/utils";

describe("Consolidation Engine", () => {
  beforeEach(() => {
    resetConsolidationState();
    resetAntitrustState();
    vi.spyOn(utils, "secureRandom").mockReturnValue(0.5);
  });

  function makeStateWithMajors(majors: any[], otherRivals: any[] = []): GameState {
    const rivals: Record<string, any> = {};
    [...majors, ...otherRivals].forEach((r) => {
      rivals[r.id] = r;
    });
    return createMockGameState({
      week: 100,
      entities: { projects: {}, talents: {}, contracts: {}, rivals } as any,
      market: { opportunities: [], trends: [], activeMarketEvents: [], buyers: [] } as any,
    });
  }

  it("returns empty array when no majors with sufficient cash exist", () => {
    const poorMajor = createMockRival({ id: "major-1", archetype: "major", cash: 100_000_000 });
    const state = makeStateWithMajors([poorMajor]);
    const impacts = tickConsolidation(state);
    expect(impacts).toHaveLength(0);
  });

  it("returns empty array on 20% skip roll", () => {
    const richMajor = createMockRival({ id: "major-1", archetype: "major", cash: 500_000_000 });
    const state = makeStateWithMajors([richMajor]);
    vi.spyOn(utils, "secureRandom").mockReturnValue(0.85);
    const impacts = tickConsolidation(state);
    expect(impacts).toHaveLength(0);
  });

  it("identifies majors correctly (archetype=major && cash > 250M)", () => {
    const richMajor = createMockRival({ id: "major-1", archetype: "major", cash: 500_000_000 });
    const target = createMockRival({
      id: "target-1",
      archetype: "mid-tier",
      cash: 50_000_000,
      strength: 30,
    });
    const state = makeStateWithMajors([richMajor], [target]);
    // First call: skip check (≥ 0.20 to proceed), second call: roll (< 0.5 for strategic)
    vi.spyOn(utils, "secureRandom")
      .mockReturnValueOnce(0.5) // skip check
      .mockReturnValueOnce(0.1); // roll → strategic acquisition
    const impacts = tickConsolidation(state);
    expect(impacts.length).toBeGreaterThan(0);
  });

  it("does not include acquirer as a target", () => {
    const richMajor = createMockRival({
      id: "major-1",
      archetype: "major",
      cash: 1_000_000_000,
      strength: 80,
    });
    const target = createMockRival({
      id: "target-1",
      archetype: "mid-tier",
      cash: 50_000_000,
      strength: 30,
    });
    const state = makeStateWithMajors([richMajor], [target]);
    vi.spyOn(utils, "secureRandom")
      .mockReturnValueOnce(0.5) // skip check
      .mockReturnValueOnce(0.1); // roll → strategic

    const impacts = tickConsolidation(state);
    const rivalUpdated = impacts.find((i) => i.type === "RIVAL_UPDATED") as any;
    if (rivalUpdated) {
      expect(rivalUpdated.payload.rivalId).toBe("major-1");
      expect(rivalUpdated.payload.update.rivalId).not.toBe("major-1");
    }
  });

  it("respects antitrust block and produces news about freeze", () => {
    const richMajor = createMockRival({ id: "major-1", archetype: "major", cash: 500_000_000 });
    const state = makeStateWithMajors([richMajor]);
    vi.spyOn(utils, "secureRandom").mockReturnValue(0.5);

    antitrustBlockList.push({ acquirerId: "major-1", untilWeek: 300 });

    const impacts = tickConsolidation(state);
    const hasFreezeNews = impacts.some(
      (i: any) => i.type === "NEWS_ADDED" && i.payload.headline?.includes("ANTITRUST FREEZE")
    );
    expect(hasFreezeNews).toBe(true);
  });
});

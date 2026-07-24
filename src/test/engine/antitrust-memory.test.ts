import { describe, it, expect, vi, beforeEach } from "vitest";
import { tickAntitrust } from "@/engine/systems/industry/Antitrust";
import { defaultSimMemory } from "@/engine/core/simMemory";
import type { GameState } from "@/engine/types";
import * as utils from "@/engine/utils";

function makeState(lastActionWeek: number): GameState {
  return {
    week: 100,
    finance: { cash: 10_000_000 },
    studio: { id: "PLAYER", name: "Player" },
    entities: {
      rivals: {
        r1: {
          id: "r1",
          name: "Mega",
          cash: 100_000_000_000,
          strength: 90,
          prestige: 90,
          archetype: "major",
        },
      },
      projects: {},
      releasedProjectIds: [],
      talents: {},
      contracts: {},
      contractsByProjectId: {},
      contractsByTalentId: {},
    },
    industry: { newsHistory: [] },
    simMemory: { ...defaultSimMemory(), antitrust: { lastActionWeek } },
  } as unknown as GameState;
}

describe("antitrust cooldown lives in simMemory", () => {
  beforeEach(() => {
    vi.spyOn(utils, "secureRandom").mockReturnValue(0.001);
  });

  it("a recent action week carried in state suppresses new interventions", () => {
    const impacts = tickAntitrust(makeState(99));
    expect(impacts).toEqual([]);
  });

  it("when an intervention fires, the new lastActionWeek is written back via impact", () => {
    const impacts = tickAntitrust(makeState(-9999));
    const memWrite = impacts.find(
      (i: any) => i.type === "INDUSTRY_UPDATE" && i.payload?.update?.["simMemory.antitrust"]
    ) as any;
    if (impacts.length > 0) {
      expect(memWrite).toBeTruthy();
      expect(memWrite.payload.update["simMemory.antitrust"].lastActionWeek).toBe(100);
    }
  });
});

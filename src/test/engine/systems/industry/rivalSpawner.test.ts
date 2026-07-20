import { describe, it, expect, vi, beforeEach } from "vitest";
import { tickRivalSpawner, tickHardBankruptcy } from "@/engine/systems/industry/RivalSpawner";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GameState } from "@/engine/types";
import { createMockGameState, createMockRival } from "../../generators/mockFactory";

import * as utils from "@/engine/utils";

function makeRivalDict(
  count: number,
  overrides?: (i: number) => Partial<any>
): Record<string, any> {
  const dict: Record<string, any> = {};
  for (let i = 0; i < count; i++) {
    const r = createMockRival({ id: `rival-${i}`, name: `Rival ${i}`, ...overrides?.(i) });
    dict[r.id] = r;
  }
  return dict;
}

describe("RivalSpawner", () => {
  beforeEach(() => {
    vi.spyOn(utils, "secureRandom").mockReturnValue(0.001);
  });

  describe("tickRivalSpawner", () => {
    it("returns empty impacts when rival count >= TARGET_ACTIVE (10)", () => {
      const state = createMockGameState({
        week: 50,
        entities: { projects: {}, talents: {}, contracts: {}, rivals: makeRivalDict(10) } as any,
      });
      const impacts = tickRivalSpawner(state);
      expect(impacts).toHaveLength(0);
    });

    it("spawns a rival when count < target and spawn roll succeeds", () => {
      const state = createMockGameState({
        week: 50,
        entities: { projects: {}, talents: {}, contracts: {}, rivals: makeRivalDict(5) } as any,
      });
      vi.spyOn(utils, "secureRandom").mockReturnValue(0.001);
      const impacts = tickRivalSpawner(state);
      const hasIndustryUpdate = impacts.some((i) => i.type === "INDUSTRY_UPDATE");
      const hasNews = impacts.some((i) => i.type === "NEWS_ADDED");
      expect(hasIndustryUpdate).toBe(true);
      expect(hasNews).toBe(true);
    });

    it("does not spawn when spawn roll fails", () => {
      const state = createMockGameState({
        week: 50,
        entities: { projects: {}, talents: {}, contracts: {}, rivals: makeRivalDict(5) } as any,
      });
      vi.spyOn(utils, "secureRandom").mockReturnValue(0.999);
      const impacts = tickRivalSpawner(state);
      expect(impacts).toHaveLength(0);
    });

    it("handles empty rivals dict", () => {
      const state = createMockGameState({
        week: 50,
        entities: { projects: {}, talents: {}, contracts: {}, rivals: {} } as any,
      });
      vi.spyOn(utils, "secureRandom").mockReturnValue(0.001);
      expect(() => tickRivalSpawner(state)).not.toThrow();
    });
  });

  describe("tickHardBankruptcy", () => {
    it("returns empty impacts when rival count <= MIN_FLOOR (7)", () => {
      const state = createMockGameState({
        week: 50,
        entities: { projects: {}, talents: {}, contracts: {}, rivals: makeRivalDict(7) } as any,
      });
      const impacts = tickHardBankruptcy(state);
      expect(impacts).toHaveLength(0);
    });

    it("triggers bankruptcy for deeply insolvent rival (cash < -300M, strength < 25)", () => {
      const rivals = makeRivalDict(8, () => ({ cash: 50_000_000, strength: 50 }));
      rivals["rival-0"] = createMockRival({
        id: "rival-0",
        name: "Bankrupt Studio",
        cash: -400_000_000,
        strength: 10,
      });
      const state = createMockGameState({
        week: 50,
        entities: { projects: {}, talents: {}, contracts: {}, rivals } as any,
      });
      vi.spyOn(utils, "secureRandom").mockReturnValue(0.001);
      const impacts = tickHardBankruptcy(state);
      const hasBankruptcy = impacts.some((i) => i.type === "INDUSTRY_UPDATE");
      const hasNews = impacts.some(
        (i: any) => i.type === "NEWS_ADDED" && i.payload.headline?.includes("INSOLVENCY")
      );
      expect(hasBankruptcy).toBe(true);
      expect(hasNews).toBe(true);
    });

    it("does not trigger for rival with cash > -300M", () => {
      const rivals = makeRivalDict(8, () => ({ cash: -200_000_000, strength: 10 }));
      const state = createMockGameState({
        week: 50,
        entities: { projects: {}, talents: {}, contracts: {}, rivals } as any,
      });
      vi.spyOn(utils, "secureRandom").mockReturnValue(0.001);
      const impacts = tickHardBankruptcy(state);
      expect(impacts).toHaveLength(0);
    });

    it("only processes one bankruptcy per tick", () => {
      const rivals = makeRivalDict(8, () => ({ cash: 50_000_000, strength: 50 }));
      rivals["rival-0"] = createMockRival({
        id: "rival-0",
        name: "Bankrupt A",
        cash: -500_000_000,
        strength: 10,
      });
      rivals["rival-1"] = createMockRival({
        id: "rival-1",
        name: "Bankrupt B",
        cash: -500_000_000,
        strength: 10,
      });
      const state = createMockGameState({
        week: 50,
        entities: { projects: {}, talents: {}, contracts: {}, rivals } as any,
      });
      vi.spyOn(utils, "secureRandom").mockReturnValue(0.001);
      const impacts = tickHardBankruptcy(state);
      const bankruptcyImpacts = impacts.filter((i) => i.type === "INDUSTRY_UPDATE");
      expect(bankruptcyImpacts.length).toBe(1);
    });
  });
});

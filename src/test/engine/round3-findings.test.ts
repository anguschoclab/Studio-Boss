import {describe, it, expect, beforeEach} from "vitest";
import {applyImpacts} from "@/engine/core/impactReducer";
import {advanceWeek, resetAdvanceWeekCache} from "@/engine/core/weekAdvance";
import {defaultSimMemory} from "@/engine/core/simMemory";
import {initializeGame} from "@/engine/core/gameInit";
import {createMockGameState} from "../mockFactory";
import {MetricsCollector} from "@/engine/simulation/MetricsCollector";
import {StudioAutomation} from "@/engine/simulation/StudioAutomation";
import {RandomGenerator} from "@/engine/utils/rng";
import {GameState, StateImpact, Talent} from "@/engine/types";
import type {Clique} from "@/engine/types/clique.types";

/**
 * Round-3 consolidation regression tests.
 * Each test pins a bug found during the exhaustive review (see r3-ledger.md).
 * All tests in this file are expected to FAIL until the corresponding fix lands.
 */

const fakeTalent = (id: string): Talent =>
  ({
    id,
    name: `Talent ${id}`,
    role: "actor",
    tier: "NEWCOMER",
    prestige: 10,
    demographics: { age: 25 },
  }) as unknown as Talent;

describe("F-069: talent pool replenishment", () => {
  it("applies TALENT_ADDED impacts carrying a talents array", () => {
    const state = createMockGameState();
    const t1 = fakeTalent("t-new-1");
    const t2 = fakeTalent("t-new-2");
    const next = applyImpacts(state, [
      { type: "TALENT_ADDED", payload: { talents: [t1, t2] } },
    ]);
    expect(next.entities.talents["t-new-1"]).toBeDefined();
    expect(next.entities.talents["t-new-2"]).toBeDefined();
  });
});

describe("F-019: advanceWeek cache is content-insensitive", () => {
  beforeEach(() => resetAdvanceWeekCache());

  it("does not return another game's result for a same-tick state", () => {
    const stateA = initializeGame("Studio A", "indie", 42);
    const resultA = advanceWeek(stateA);
    expect(resultA.newState.studio.name).toBe("Studio A");

    // A different game whose simMemory claims this tick was already processed
    const stateB = initializeGame("Studio B", "indie", 99);
    const craftedB: GameState = {
      ...stateB,
      tickCount: 10,
      simMemory: { ...defaultSimMemory(), lastProcessedTickCount: 10 },
    };
    const resultB = advanceWeek(craftedB);
    // Must have actually advanced B, not replayed A's cached result
    expect(resultB.newState.studio.name).toBe("Studio B");
    expect(resultB.newState).not.toBe(resultA.newState);
  });
});

describe("F-035: CLIQUE_UPDATED must rebuild memberCliqueMap", () => {
  it("removes dropped members from memberCliqueMap", () => {
    const clique: Clique = {
      id: "c1",
      name: "The Pack",
      members: ["t1", "t2"],
      formedWeek: 1,
      status: "active",
      fameBonus: 10,
      reputation: "prestigious",
      exclusivity: 50,
      combinedStarPower: 100,
      reunionPotential: 10,
      internalConflicts: [],
    } as Clique;
    const state = createMockGameState({
      relationships: {
        cliques: {
          cliques: { c1: clique },
          memberCliqueMap: { t1: ["c1"], t2: ["c1"] },
        },
      },
    } as Partial<GameState>);

    const updated = { ...clique, members: ["t2"] };
    const next = applyImpacts(state, [
      {
        type: "CLIQUE_UPDATED",
        payload: { cliqueId: "c1", clique: updated },
      } as StateImpact,
    ]);

    const map = next.relationships?.cliques?.memberCliqueMap || {};
    expect(map["t2"]).toContain("c1");
    expect(map["t1"] ?? []).not.toContain("c1");
  });
});

describe("F-032/F-033/F-034: PLAYER sentinel vs studio.id", () => {
  it("MetricsCollector counts player active projects via studio.id", () => {
    const state = createMockGameState({
      entities: {
        ...createMockGameState().entities,
        projects: {
          p1: {
            id: "p1",
            title: "Active Film",
            state: "production",
            ownerId: "studio-1", // matches createMockGameState studio.id
            budget: 10_000_000,
            revenue: 0,
          } as never,
        },
      },
    } as Partial<GameState>);
    const collector = new MetricsCollector();
    collector.record(state, { week: 10 } as never);
    expect(collector.getHistory()[0].activeProjects).toBe(1);
  });

  it("liquidation assigns acquired IP to the real player studio id", () => {
    const state = createMockGameState({
      week: 8, // week % 4 === 0 → liquidation window
      entities: {
        ...createMockGameState().entities,
        rivals: {
          r1: {
            id: "r1",
            name: "Failing Rival",
            cash: -100_000_000,
            projects: {},
          } as never,
        },
      },
      ip: {
        vault: [
          {
            id: "asset-1",
            title: "Old Franchise",
            ownerStudioId: "r1",
            baseValue: 10_000_000,
          } as never,
        ],
        franchises: {},
      },
    } as Partial<GameState>);

    const rng = new RandomGenerator(7); // first next() < 0.1 → triggers liquidation
    const impacts = StudioAutomation.tick(state, rng);
    const ipUpdate = impacts.find((i) => i.type === "IP_UPDATED");
    expect(ipUpdate).toBeDefined();
    const ownerStudioId = (ipUpdate as { payload: { update: { ownerStudioId: string } } })
      .payload.update.ownerStudioId;
    expect(ownerStudioId).toBe(state.studio.id);
  });

  it("FINANCE_TRANSACTION targeting the real player id applies to player cash", () => {
    const state = createMockGameState();
    const next = applyImpacts(state, [
      {
        type: "FINANCE_TRANSACTION",
        payload: { amount: 1234, description: "test", targetId: state.studio.id },
      } as StateImpact,
    ]);
    expect(next.finance.cash).toBe(state.finance.cash + 1234);
  });

  it("FINANCE_TRANSACTION clamps NaN amounts targeting rivals", () => {
    const state = createMockGameState({
      entities: {
        ...createMockGameState().entities,
        rivals: { r1: { id: "r1", name: "R", cash: 500 } as never },
      },
    } as Partial<GameState>);
    const next = applyImpacts(state, [
      {
        type: "FINANCE_TRANSACTION",
        payload: { amount: NaN, description: "bad", targetId: "r1" },
      } as StateImpact,
    ]);
    expect(Number.isFinite(next.entities.rivals["r1"].cash)).toBe(true);
  });
});

describe("F-041: applySingleImpact must not mutate the impact payload", () => {
  it("leaves the caller's impact object untouched while clamping", () => {
    const state = createMockGameState();
    const impact = {
      type: "FUNDS_CHANGED",
      payload: { amount: NaN },
    } as unknown as StateImpact;
    applyImpacts(state, [impact]);
    expect((impact.payload as { amount: number }).amount).toBeNaN(); // payload object itself unchanged
  });
});

describe("F-059: the top-level finance mirror is removed (single source of truth)", () => {
  it("non-finance-slice cash changes are visible to finance readers", async () => {
    const { useGameStore } = await import("@/store/gameStore");
    const base = createMockGameState({
      entities: {
        ...createMockGameState().entities,
        talents: { t1: fakeTalent("t1") },
      },
    } as Partial<GameState>);
    useGameStore.setState({ gameState: base });

    useGameStore.getState().signBreakoutTalent("t1", 500_000);

    const s = useGameStore.getState();
    expect(s.gameState?.finance.cash).toBe(base.finance.cash - 500_000);
    // The stale-prone mirror field must not exist at all
    expect("finance" in s).toBe(false);
  });
});

describe("F-083: setActiveSubTab must actually track sub-tab state", () => {
  it("updates activeSubTab when called", async () => {
    const { useUIStore } = await import("@/store/uiStore");
    useUIStore.getState().setActiveSubTab("slate");
    const s = useUIStore.getState() as unknown as { activeSubTab?: string };
    expect(s.activeSubTab).toBe("slate");
  });
});

describe("F-047: addContractsToIndex dedupes like the singular variant", () => {
  it("does not duplicate index entries for repeated contract ids", async () => {
    const { addContractsToIndex, addContractToIndex } = await import("@/engine/utils");
    const c = { id: "c1", projectId: "p1", talentId: "t1" } as never;
    const batch = addContractsToIndex({}, [c, c]);
    const singular = addContractToIndex(addContractToIndex({}, "p1", "c1"), "p1", "c1");
    expect(batch["p1"]).toEqual(singular["p1"]);
    expect(batch["p1"].filter((id: string) => id === "c1")).toHaveLength(1);
  });
});

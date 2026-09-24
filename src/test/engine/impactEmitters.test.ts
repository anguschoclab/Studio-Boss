import { describe, it, expect } from "vitest";
import { initializeGame } from "@/engine/core/gameInit";
import { applySingleImpact } from "@/engine/core/impactHandlers";
import { setDeterministicSeed } from "@/engine/utils";
import { tickRivalSpawner, tickHardBankruptcy } from "@/engine/systems/industry/RivalSpawner";
import { getProjectQualityBonus } from "@/engine/systems/talent/ProductionEnhancementSystem";
import type { GameState, RivalStudio } from "@/engine/types";

/**
 * Emitter characterization suite — pins the *semantic effect* of impact
 * literals that the GenericImpact removal will reshape. Tests assert state
 * effects through applySingleImpact, not literal text, so they must stay
 * green across the typing refactor.
 *
 * Three cases are RED at authoring time (documented bugs surfaced by the
 * type audit):
 *  - spawned rivals emitted as `payload.rival` are dropped by the handler
 *    (it reads `payload.rivals`, and only updates existing entries)
 *  - `bankruptRivalId` is emitted but never consumed — rivals are never removed
 *  - getProjectQualityBonus reads `state.productionEnhancements` (root) but
 *    handlers write `state.relationships.productionEnhancements`
 */

function baseState(): GameState {
  return initializeGame("EmitTest", "mid-tier", 777);
}

function insolventRival(id: string): RivalStudio {
  return {
    id,
    name: `Doomed ${id}`,
    motto: "m",
    archetype: "indie",
    strength: 10,
    cash: -400_000_000,
    prestige: 5,
    foundedWeek: 1,
    recentActivity: "",
    projectCount: 0,
    motivationProfile: { greed: 1, prestige: 1, aggression: 1, loyalty: 1, riskTolerance: 1, innovation: 1 },
    currentMotivation: "SURVIVAL",
    projects: {},
    contracts: [],
  } as unknown as RivalStudio;
}

describe("impact emitter semantics", () => {
  it("spawned rival lands in entities.rivals after apply", () => {
    let state = baseState();
    state = { ...state, entities: { ...state.entities, rivals: {} } };
    setDeterministicSeed(1);

    // retry until the probabilistic spawn fires (pSpawn = 0.6 with 0 rivals)
    let emitted: ReturnType<typeof tickRivalSpawner> = [];
    for (let i = 0; i < 50 && emitted.length === 0; i++) {
      emitted = tickRivalSpawner(state);
    }
    const spawnImpact = emitted.find((i) => i.type === "INDUSTRY_UPDATE");
    expect(spawnImpact).toBeTruthy();

    const next = applySingleImpact(state, spawnImpact!);
    expect(Object.keys(next.entities.rivals).length).toBeGreaterThan(0);
  });

  it("hard-bankrupt rival is removed from entities.rivals after apply", () => {
    let state = baseState();
    const rivals: Record<string, RivalStudio> = {};
    for (let i = 0; i < 9; i++) {
      const id = i === 0 ? "doomed" : `healthy-${i}`;
      rivals[id] = insolventRival(id);
      if (i !== 0) rivals[id] = { ...rivals[id], cash: 10_000_000, strength: 60 };
    }
    state = { ...state, entities: { ...state.entities, rivals } };
    setDeterministicSeed(2);

    let emitted: ReturnType<typeof tickHardBankruptcy> = [];
    for (let i = 0; i < 50 && emitted.length === 0; i++) {
      emitted = tickHardBankruptcy(state);
    }
    const bankrupt = emitted.find((i) => i.type === "INDUSTRY_UPDATE");
    expect(bankrupt).toBeTruthy();

    const next = applySingleImpact(state, bankrupt!);
    expect(next.entities.rivals["doomed"]).toBeUndefined();
  });

  it("implemented screenplay notes contribute to project quality bonus", () => {
    let state = baseState();
    const note = {
      id: "n1",
      projectId: "p1",
      authorId: "t1",
      type: "dialogue_rewrite" as const,
      description: "Tighten act two",
      quality: 70,
      implemented: true,
      qualityBonus: 7,
      cost: 0,
    };
    state = {
      ...state,
      relationships: {
        ...(state.relationships ?? {}),
        productionEnhancements: {
          screenplayNotes: { n1: note },
          productionAdditions: {},
          creditScenes: {},
        },
      },
    } as GameState;

    const bonus = getProjectQualityBonus("p1", state);
    expect(bonus.screenplayBonus).toBe(7);
  });

  it("TALENT_ADDED payload.talents lands in entities.talents", () => {
    const state = baseState();
    const next = applySingleImpact(state, {
      type: "TALENT_ADDED",
      payload: { talents: [{ id: "tx1", name: "X" }] },
    } as unknown as Parameters<typeof applySingleImpact>[1]);
    expect(next.entities.talents["tx1"]).toBeTruthy();
  });

  it("INDUSTRY_UPDATE deep-path update merges nested keys", () => {
    const state = baseState();
    const next = applySingleImpact(state, {
      type: "INDUSTRY_UPDATE",
      payload: { update: { "simMemory.headlessCashStreaks": { r1: 3 } } },
    } as unknown as Parameters<typeof applySingleImpact>[1]);
    const mem = (next as GameState & { simMemory?: { headlessCashStreaks?: Record<string, number> } })
      .simMemory;
    expect(mem?.headlessCashStreaks?.r1).toBe(3);
  });
});

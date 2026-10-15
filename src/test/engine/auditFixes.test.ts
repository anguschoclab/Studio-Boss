import { describe, it, expect } from "vitest";
import { GameState, StateImpact } from "@/engine/types";
import { applySingleImpact } from "@/engine/core/impactHandlers";
import { tickLoans, checkBankruptcy } from "@/engine/systems/finance/LoanSystem";
import { evaluateVaultSynergy } from "@/engine/systems/ip/synergyEvaluator";

function makeMockState(overrides: Record<string, unknown> = {}): GameState {
  return {
    week: 5,
    gameSeed: 1,
    tickCount: 0,
    finance: { cash: 0, ledger: [] },
    news: { headlines: [] },
    ip: { vault: [], franchises: {} },
    entities: {
      projects: {},
      talents: {},
      contracts: {},
      contractsByProjectId: {},
      contractsByTalentId: {},
      rivals: {},
    },
    studio: {
      name: "Test",
      id: "PLAYER",
      prestige: 50,
      loans: [],
      internal: { projects: {}, contracts: [], projectHistory: [] },
    },
    market: { opportunities: [], buyers: [] },
    industry: { rivals: [], families: [], agencies: [], agents: [], awards: [] },
    history: [],
    ...overrides,
  } as unknown as GameState;
}

describe("BUYER_UPDATED insert semantics (F-004)", () => {
  it("inserts a new buyer when buyerId is absent (streamer upstart spawn)", () => {
    const state = makeMockState();
    state.market.buyers = [{ id: "b1", name: "Apex" }] as never;
    const next = applySingleImpact(state, {
      type: "BUYER_UPDATED",
      payload: {
        buyerId: "b2",
        update: { id: "b2", name: "Neon Stream", archetype: "streamer" },
      },
    } as StateImpact);
    expect(next.market.buyers).toHaveLength(2);
    expect(next.market.buyers[1].name).toBe("Neon Stream");
  });

  it("still merges updates for existing buyers", () => {
    const state = makeMockState();
    state.market.buyers = [{ id: "b1", name: "Apex" }] as never;
    const next = applySingleImpact(state, {
      type: "BUYER_UPDATED",
      payload: { buyerId: "b1", update: { name: "Apex Prime" } },
    } as StateImpact);
    expect(next.market.buyers).toHaveLength(1);
    expect(next.market.buyers[0].name).toBe("Apex Prime");
  });
});

describe("INDUSTRY_UPDATE awards write (F-006)", () => {
  it("writing industry.awards as an array keeps .filter/.length semantics and survives serialization", () => {
    const state = makeMockState();
    const award = { id: "a1", projectId: "p1", name: "Best Picture", status: "won" };
    const next = applySingleImpact(state, {
      type: "INDUSTRY_UPDATE",
      payload: { update: { "industry.awards": [...(state.industry.awards || []), award] } },
    } as StateImpact);
    expect(Array.isArray(next.industry.awards)).toBe(true);
    expect(next.industry.awards).toHaveLength(1);
    // Named-prop regression: JSON round-trip must preserve the award
    const roundTripped = JSON.parse(JSON.stringify(next.industry.awards));
    expect(roundTripped).toHaveLength(1);
  });
});

describe("LoanSystem bankruptcy (F-007/F-011)", () => {
  it("tickLoans still evaluates bankruptcy with zero outstanding loans", () => {
    const state = makeMockState();
    state.finance.cash = -600_000;
    state.studio.loans = [];
    const impacts = tickLoans(state, {} as never);
    expect(impacts.some((i) => i.type === "MODAL_TRIGGERED")).toBe(true);
  });

  it("checkBankruptcy accounts for this tick's pending payments", () => {
    const state = makeMockState();
    state.finance.cash = -450_000; // above floor until the 100k payment lands
    expect(checkBankruptcy(state, 0)).toBeNull();
    expect(checkBankruptcy(state, 100_000)).not.toBeNull();
  });
});

describe("evaluateVaultSynergy (F-008)", () => {
  it("does not compound baseValue across ticks — stores a recomputed synergyBoost", () => {
    const vault = [
      { id: "a1", franchiseId: "f1", baseValue: 100 },
      { id: "a2", franchiseId: "f2", baseValue: 200 },
    ] as never;
    const once = evaluateVaultSynergy(vault);
    const twice = evaluateVaultSynergy(once);
    // baseValue untouched; boost recomputed identically (no compounding)
    expect(once[0].baseValue).toBe(100);
    expect(twice[0].baseValue).toBe(100);
    expect(once[0].synergyBoost).toBeCloseTo(twice[0].synergyBoost ?? 0);
    expect(once[0].synergyBoost).toBeGreaterThan(1);
  });
});

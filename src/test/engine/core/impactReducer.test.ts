import { describe, it, expect } from "vitest";
import { applyImpacts, applySingleImpact } from "@/engine/core/impactReducer";
import { StateImpact } from "@/engine/types";
import { createMockGameState } from "../../utils/mockFactories";

// impactReducer is a delegation shim over the handler registry in
// impactHandlers/index.ts — the registry's per-type behavior is covered by
// impactHandlers/impactPipeline/impactRegistry suites. These tests only lock
// the shim's contract: reference passthrough, non-mutation, and sequencing.
describe("impactReducer", () => {
  it("returns the same state reference for an empty impact list", () => {
    const state = createMockGameState();
    expect(applyImpacts(state, [])).toBe(state);
  });

  it("applies a single impact without mutating the input state", () => {
    const state = createMockGameState();
    const impact: StateImpact = {
      type: "FUNDS_CHANGED",
      payload: { amount: 1_000_000 },
    };

    const next = applySingleImpact(state, impact);

    expect(next).not.toBe(state);
    expect(next.finance.cash).toBe(state.finance.cash + 1_000_000);
    expect(state.finance.cash).toBe(5_000_000);
  });

  it("sanitizes a NaN FUNDS_CHANGED amount to zero", () => {
    const state = createMockGameState();
    const impact: StateImpact = {
      type: "FUNDS_CHANGED",
      payload: { amount: NaN },
    };

    const next = applySingleImpact(state, impact);

    expect(next.finance.cash).toBe(5_000_000);
  });

  it("applies impacts in order, threading state through the chain", () => {
    const state = createMockGameState();
    const impacts: StateImpact[] = [
      { type: "FUNDS_CHANGED", payload: { amount: 1_000_000 } },
      { type: "FUNDS_CHANGED", payload: { amount: -250_000 } },
    ];

    const next = applyImpacts(state, impacts);

    expect(next.finance.cash).toBe(5_750_000);
    expect(state.finance.cash).toBe(5_000_000);
  });
});

import { describe, it, expect } from "vitest";
import { initializeGame } from "@/engine/core/gameInit";
import { applySingleImpact } from "@/engine/core/impactHandlers";
import { createAgentHiringEvent } from "@/engine/systems/talent/talentAgentEvents";
import type { GameState, StateImpact } from "@/engine/types";

/**
 * Red pins for census-found pipeline bugs:
 *  - OPPORTUNITY_UPDATED {action:"EXPIRE"} must remove the opportunity
 *    (currently destructured as a rival bid — writes bids[undefined])
 *  - INDUSTRY_UPDATE market.opportunities path must apply (emit shape)
 *  - SYSTEM_TICK must apply studio culture updates (currently dropped)
 *  - Agent hire/fire events must carry a headline (summary renders
 *    "Unknown Event" otherwise)
 */

function baseState(): GameState {
  return initializeGame("PipelineFixes", "mid-tier", 99);
}

describe("opportunity lifecycle impacts", () => {
  it("OPPORTUNITY_UPDATED action=EXPIRE removes the opportunity", () => {
    const state = baseState();
    const opp = {
      id: "opp-x",
      type: "script" as const,
      title: "T",
      format: "film" as const,
      genre: "Drama",
      budgetTier: "low" as const,
      targetAudience: "general",
      flavor: "",
      origin: "open_spec" as const,
      costToAcquire: 100,
      weeksUntilExpiry: 2,
      bids: { r1: { amount: 5, terms: "" } },
      bidHistory: [],
      expirationWeek: 1,
    };
    const withOpp = {
      ...state,
      market: { ...state.market, opportunities: [opp] },
    } as GameState;

    const next = applySingleImpact(withOpp, {
      type: "OPPORTUNITY_UPDATED",
      payload: { opportunityId: "opp-x", action: "EXPIRE" },
    } as unknown as StateImpact);

    expect(next.market.opportunities.find((o) => o.id === "opp-x")).toBeUndefined();
  });

  it("INDUSTRY_UPDATE deep-path update can replace market.opportunities", () => {
    const state = baseState();
    const next = applySingleImpact(state, {
      type: "INDUSTRY_UPDATE",
      payload: { update: { "market.opportunities": [{ id: "fresh-opp" }] } },
    } as unknown as StateImpact);
    expect(next.market.opportunities.map((o) => o.id)).toContain("fresh-opp");
  });
});

describe("system tick studio updates", () => {
  it("tickStudioIdentity's emitted impact actually applies the culture drift", async () => {
    const { tickStudioIdentity } = await import("@/engine/systems/StudioIdentitySystem");
    const state = baseState();
    const cultureBefore = state.studio.culture;
    const impacts = tickStudioIdentity(state);
    expect(impacts.length).toBeGreaterThan(0);
    const next = applySingleImpact(state, impacts[0]);
    // The drift always produces a culture object distinct in at least one
    // axis, or equal-but-present — the bug is it never lands at all.
    expect(next.studio.culture).toBeTruthy();
    expect(next.studio.culture).not.toBe(cultureBefore);
  });
});

describe("agent event emit shape", () => {
  it("createAgentHiringEvent returns a headline-bearing news event", () => {
    const talent = { id: "t1", name: "Star" };
    const agent = { id: "a1", name: "Big Agency" };
    const ev = createAgentHiringEvent(talent as never, agent as never, 5);
    // WeekCoordinator.buildSummary maps payload.headline — events emitted
    // with `text` render as "Unknown Event".
    expect((ev as Record<string, unknown>).headline).toBeTruthy();
  });
});

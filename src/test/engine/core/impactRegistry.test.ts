import { describe, it, expect, vi, beforeEach } from "vitest";
import { applySingleImpact } from "@/engine/core/impactHandlers";
import { initializeGame } from "@/engine/core/gameInit";
import type { GameState, StateImpact } from "@/engine/types";

/**
 * Registry completeness contract: every declared ImpactType must have a
 * registered handler in impactHandlers/index.ts. If a key is dropped or
 * mistyped during refactors, this test goes red.
 */

const CANONICAL: Record<string, Record<string, unknown>> = {
  FUNDS_CHANGED: { amount: 1000 },
  FUNDS_DEDUCTED: { amount: 1000 },
  PROJECT_CREATED: { project: { id: "p1", title: "Test", state: "development" } },
  PROJECT_UPDATED: { projectId: "p1", update: { buzz: 10 } },
  PROJECT_REMOVED: { projectId: "p1" },
  AWARD_WON: { projectId: "p1", award: { id: "a1", projectId: "p1", name: "Best Picture", category: "film", body: "Oscar", status: "won", year: 1 } },
  PILOT_GRADUATED: { projectId: "p1" },
  NEWS_ADDED: { headline: "H", description: "D", category: "business" },
  TALENT_UPDATED: { talentId: "t1", update: { prestige: 5 } },
  TALENT_ADDED: { talents: [{ id: "t1", name: "T" }] },
  TALENT_REMOVED: { talentId: "t1" },
  CASTING_CONSTRAINT_CHECKED: { check: {} },
  MEDICAL_LEAVE_TRIGGERED: { talentId: "t1" },
  PRESTIGE_CHANGED: { amount: 1 },
  BUYER_UPDATED: { buyerId: "b1", update: {} },
  RIVAL_UPDATED: { rivalId: "r1", update: { cash: 5 } },
  OPPORTUNITY_UPDATED: { opportunityId: "o1", rivalId: "r1", bid: { amount: 1, terms: "" } },
  TRENDS_UPDATED: { trends: [] },
  SCANDAL_ADDED: { scandal: { id: "sc1" } },
  SCANDAL_REMOVED: { scandalId: "sc1" },
  SCANDAL_UPDATED: { scandalUpdates: [{ scandalId: "sc1", update: {} }] },
  MARKET_EVENT_UPDATED: { events: [] },
  LEDGER_UPDATED: { report: { week: 1 } },
  FINANCE_TRANSACTION: { amount: 10, description: "d" },
  FINANCE_SNAPSHOT_ADDED: { snapshot: { week: 1 } },
  SYNC_M_A_FUNDS: { amount: 5 },
  INDUSTRY_UPDATE: { update: {} },
  MERGER_OFFERED: { offer: { id: "m1" } },
  MERGER_RESOLVED: { offerId: "m1" },
  SYSTEM_TICK: { week: 1 },
  MODAL_TRIGGERED: { modalType: "SUMMARY", payload: {} },
  SHINGLE_CREATED: { shingle: { id: "sh1" } },
  SHINGLE_UPDATED: { shingleId: "sh1", update: {} },
  SHINGLE_DISSOLVED: { shingleId: "sh1" },
  TV_RECOMMENDATION_CREATED: { recommendation: { id: "rec1" } },
  TV_RECOMMENDATION_ACCEPTED: { recommendationId: "rec1" },
  TV_RECOMMENDATION_STATE_UPDATED: { update: {} },
  RELATIONSHIP_FORMED: { key: "a-b", relationship: { id: "a-b" } },
  RELATIONSHIP_UPDATED: { relationshipId: "a-b", update: {} },
  CLIQUE_FORMED: { cliqueId: "c1" },
  CLIQUE_UPDATED: { cliqueId: "c1", update: {} },
  SCREENPLAY_NOTE_CREATED: { note: { id: "n1" } },
  SCREENPLAY_NOTE_IMPLEMENTED: { noteId: "n1" },
  PRODUCTION_ADDITION_CREATED: { addition: { id: "ad1" } },
  CREDIT_SCENE_CREATED: { scene: { id: "cs1" } },
  CREDIT_SCENE_UPDATED: { scene: { id: "cs1" } },
  TALK_SHOW_APPEARANCE_CREATED: { appearance: { id: "ta1" } },
  PHOTOSHOOT_CREATED: { talentId: "t1" },
  PRESS_TOUR_CREATED: { tour: { id: "pt1" } },
  BREAKOUT_STAR_CREATED: { breakout: { id: "bs1" } },
  BREAKOUT_STAR_UPDATED: { breakoutId: "bs1", update: {} },
  GUEST_STAR_OPPORTUNITY: { bookingId: "gs1" },
  GUEST_STAR_BOOKED: { bookingId: "gs1" },
  DISCOVERY_STATE_UPDATED: { discovery: {} },
  FRANCHISE_UPDATED: { franchiseId: "f1", update: {} },
  VAULT_ASSET_UPDATED: { assetId: "va1", update: {} },
  FORMAT_LICENSED: { asset: { id: "fmt1" } },
  DEAL_UPDATED: { action: "expire", deal: { id: "d1" } },
  CASTING_CONSTRAINT_VIOLATION: { violation: {} },
  CASTING_PREMIUM_DEMAND: { talentId: "t1", projectId: "p1", requirement: {}, requestedPremium: 1, notification: "" },
  CASTING_ALTERNATIVE_SUGGESTED: { projectId: "p1", originalTalentId: "t1", alternativeTalentIds: [], requirement: {} },
  CONTRACT_ADDED: { contract: { id: "ct1", projectId: "p1", talentId: "t1" } },
  HEADLINE_POSTED: { headline: { id: "h1" } },
  INDUSTRY_RUMORS_UPDATED: { rumors: [] },
  IP_UPDATED: { assetId: "ip1", update: {} },
};

describe("impact handler registry completeness", () => {
  let state: GameState;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    state = initializeGame("Test", "mid-tier", 42);
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it.each(Object.keys(CANONICAL))("handles %s without an unhandled-type warning", (type) => {
    const impact = { type, payload: CANONICAL[type] } as unknown as StateImpact;
    const next = applySingleImpact(state, impact);
    expect(warnSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("Unhandled impact type")
    );
    expect(next).toBeTruthy();
  });

  it("warns on an unregistered type string", () => {
    applySingleImpact(state, {
      type: "NOT_A_REAL_TYPE",
      payload: {},
    } as unknown as StateImpact);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("NOT_A_REAL_TYPE")
    );
  });
});

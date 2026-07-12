import { describe, it, expect } from "vitest";
import { Opportunity, OpportunityUpdateImpact } from "@/engine/types";
import { tickAuctions } from "@/engine/systems/ai/biddingEngine";
import { RandomGenerator } from "@/engine/utils/rng";
import { createMockGameState, createMockRival } from "../../generators/mockFactory";

describe("AI Bidding Engine (Target C2 Refactor)", () => {
  const rng = new RandomGenerator(777);

  it("generates a OPPORTUNITY_UPDATED impact representing a counter-bid", () => {
    const mockRival = createMockRival({
      id: "rival-1",
      strength: 80,
      cash: 50_000_000,
      motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 100 }, // High aggression
    });

    const mockOpportunity: Opportunity = {
      id: "script-1",
      title: "Action Epic",
      type: "script",
      format: "film",
      genre: "Action",
      budgetTier: "blockbuster",
      targetAudience: "General",
      flavor: "Cool",
      origin: "open_spec",
      costToAcquire: 1_000_000,
      weeksUntilExpiry: 10,
      expirationWeek: 10,
      bids: { "player-1": { amount: 1_100_000, terms: "standard" } },
      bidHistory: [],
    } as Opportunity;

    const state = createMockGameState();
    state.entities.rivals = { [mockRival.id]: mockRival };
    state.market.opportunities = [mockOpportunity];

    const impacts = tickAuctions(state, rng);
    const bidImpact = impacts.find((i) => i.type === "OPPORTUNITY_UPDATED") as
      OpportunityUpdateImpact | undefined;

    expect(bidImpact).toBeDefined();
    expect(bidImpact?.payload.opportunityId).toBe("script-1");
    expect(bidImpact?.payload.rivalId).toBe("rival-1");
    expect(bidImpact?.payload.bid.amount).toBeGreaterThan(1_100_000);
  });

  it("does not bid if the rival is already the highest bidder", () => {
    const mockRival = createMockRival({ id: "rival-1", cash: 50_000_000 });
    const mockOpportunity: Opportunity = {
      id: "script-1",
      bids: { "rival-1": { amount: 2_000_000, terms: "standard" } },
      expirationWeek: 10,
    } as any;

    const state = createMockGameState();
    state.week = 1;
    state.entities.rivals = { [mockRival.id]: mockRival };
    state.market.opportunities = [mockOpportunity];

    const impacts = tickAuctions(state, rng);
    expect(impacts.length).toBe(0);
  });

  it("respects budget limits and aggression profiles", () => {
    const poorRival = createMockRival({ id: "rival-1", cash: 1_000_000 });
    const expensiveOpportunity: Opportunity = {
      id: "blockbuster-1",
      costToAcquire: 2_000_000,
      bids: { "player-1": { amount: 2_500_000, terms: "standard" } },
      expirationWeek: 10,
    } as any;

    const state = createMockGameState();
    state.week = 1;
    state.entities.rivals = { [poorRival.id]: poorRival };
    state.market.opportunities = [expensiveOpportunity];

    const impacts = tickAuctions(state, rng);
    // Should not bid because 2.5M is more than available cash (1M)
    expect(impacts.length).toBe(0);
  });
});

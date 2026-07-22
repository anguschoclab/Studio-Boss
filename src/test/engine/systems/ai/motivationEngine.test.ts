import { describe, it, expect } from "vitest";
import { calculateRivalMotivation, tickAIMinds } from "@/engine/systems/ai/motivationEngine";
import { RandomGenerator } from "@/engine/utils/rng";
import { createMockGameState, createMockRival } from "../../generators/mockFactory";
import type { StateImpact, SeriesProject, Project } from "@/engine/types";

describe("AI Motivation Engine (Target C1)", () => {
  const rng = new RandomGenerator(999);

  it("should switch to CASH_CRUNCH if cash is extremely low", () => {
    const mockRival = createMockRival({
      id: "r1",
      cash: 100_000, // Very low cash
      prestige: 80,
    });
    const state = createMockGameState();
    // In Phase 7, rivals are in entities.rivals
    state.entities.rivals = { [mockRival.id]: mockRival };

    const nextMotivation = calculateRivalMotivation(mockRival, state, rng);
    expect(nextMotivation).toBe("CASH_CRUNCH");
  });

  it("should switch to AWARD_CHASE if prestige is high but cash is fine", () => {
    const mockRival = createMockRival({
      id: "r1",
      cash: 50_000_000,
      prestige: 90,
    });
    const state = createMockGameState();
    state.entities.rivals = { [mockRival.id]: mockRival };

    const nextMotivation = calculateRivalMotivation(mockRival, state, rng);
    expect(nextMotivation).toBe("AWARD_CHASE");
  });
});

describe("tickAIMinds — prestige decay (lastAwardWin)", () => {
  function getMotivationFromImpacts(impacts: StateImpact[], rivalId: string): string | undefined {
    const rivalUpdate = impacts.find(
      (i) =>
        i.type === "RIVAL_UPDATED" &&
        (i.payload as { rivalId?: string }).rivalId === rivalId &&
        (i.payload as { update?: { currentMotivation?: string } }).update?.currentMotivation
    );
    return (rivalUpdate?.payload as { update?: { currentMotivation?: string } }).update
      ?.currentMotivation;
  }

  it("recent award win prevents AWARD_CHASE override (normal prestige)", () => {
    const state = createMockGameState({ week: 200 });
    const rival = createMockRival({
      id: "r1",
      cash: 50_000_000,
      prestige: 50,
      lastAwardWin: 190, // 10 weeks ago — well within 104-week threshold
    });
    state.entities.rivals = { [rival.id]: rival };

    // Run many times to account for the 15% RNG chance
    for (let seed = 1; seed <= 50; seed++) {
      const testRng = new RandomGenerator(seed);
      const impacts = tickAIMinds(state, testRng);
      const motivation = getMotivationFromImpacts(impacts, "r1");
      expect(motivation).not.toBe("AWARD_CHASE");
    }
  });

  it("recent award win prevents AWARD_CHASE override (high prestige)", () => {
    const state = createMockGameState({ week: 200 });
    const rival = createMockRival({
      id: "r1",
      cash: 3_000_000, // Low cash so CASH_CRUNCH (100) beats AWARD_CHASE (85)
      prestige: 80,
      lastAwardWin: 170, // 30 weeks ago — within 52-week threshold for high prestige
    });
    state.entities.rivals = { [rival.id]: rival };

    for (let seed = 1; seed <= 50; seed++) {
      const testRng = new RandomGenerator(seed);
      const impacts = tickAIMinds(state, testRng);
      const motivation = getMotivationFromImpacts(impacts, "r1");
      expect(motivation).not.toBe("AWARD_CHASE");
    }
  });

  it("old award win triggers AWARD_CHASE drift (normal prestige)", () => {
    const state = createMockGameState({ week: 200 });
    const rival = createMockRival({
      id: "r1",
      cash: 50_000_000,
      prestige: 50,
      lastAwardWin: 85, // 115 weeks ago — beyond 104-week threshold
    });
    state.entities.rivals = { [rival.id]: rival };

    let foundAwardChase = false;
    for (let seed = 1; seed <= 50; seed++) {
      const testRng = new RandomGenerator(seed);
      const impacts = tickAIMinds(state, testRng);
      const motivation = getMotivationFromImpacts(impacts, "r1");
      if (motivation === "AWARD_CHASE") {
        foundAwardChase = true;
        break;
      }
    }
    expect(foundAwardChase).toBe(true);
  });

  it("old award win triggers AWARD_CHASE drift (high prestige)", () => {
    const state = createMockGameState({ week: 200 });
    const rival = createMockRival({
      id: "r1",
      cash: 3_000_000, // Low cash so CASH_CRUNCH (100) beats AWARD_CHASE (85) naturally
      prestige: 80,
      lastAwardWin: 140, // 60 weeks ago — beyond 52-week threshold for high prestige
    });
    state.entities.rivals = { [rival.id]: rival };

    let foundAwardChase = false;
    for (let seed = 1; seed <= 50; seed++) {
      const testRng = new RandomGenerator(seed);
      const impacts = tickAIMinds(state, testRng);
      const motivation = getMotivationFromImpacts(impacts, "r1");
      if (motivation === "AWARD_CHASE") {
        foundAwardChase = true;
        break;
      }
    }
    expect(foundAwardChase).toBe(true);
  });

  it("undefined lastAwardWin treated as award-starved", () => {
    const state = createMockGameState({ week: 200 });
    const rival = createMockRival({
      id: "r1",
      cash: 50_000_000,
      prestige: 50,
      // lastAwardWin intentionally omitted
    });
    state.entities.rivals = { [rival.id]: rival };

    let foundAwardChase = false;
    for (let seed = 1; seed <= 50; seed++) {
      const testRng = new RandomGenerator(seed);
      const impacts = tickAIMinds(state, testRng);
      const motivation = getMotivationFromImpacts(impacts, "r1");
      if (motivation === "AWARD_CHASE") {
        foundAwardChase = true;
        break;
      }
    }
    expect(foundAwardChase).toBe(true);
  });

  it("already AWARD_CHASE is not overridden (no-op)", () => {
    const state = createMockGameState({ week: 200 });
    const rival = createMockRival({
      id: "r1",
      cash: 50_000_000,
      prestige: 90,
      lastAwardWin: 190, // recent win, but prestige is high enough to naturally get AWARD_CHASE
    });
    state.entities.rivals = { [rival.id]: rival };

    const testRng = new RandomGenerator(999);
    const impacts = tickAIMinds(state, testRng);
    const motivation = getMotivationFromImpacts(impacts, "r1");
    // With prestige 90 and high cash, calculateRivalMotivation returns AWARD_CHASE naturally.
    // The decay logic should not interfere since newMotivation is already AWARD_CHASE.
    expect(motivation).toBe("AWARD_CHASE");
  });
});

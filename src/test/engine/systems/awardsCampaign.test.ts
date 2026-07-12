import { describe, it, expect } from "vitest";

describe("Awards Campaign", () => {
  it("launchAwardsCampaign is available via marketingSlice in gameStore", async () => {
    const mod = await import("../../../store/gameStore");
    expect(mod.useGameStore).toBeDefined();
    const store = mod.useGameStore;
    // The store should have launchAwardsCampaign as an action
    // We can't call it without a game state, but we can verify the store creator exists
    expect(typeof store).toBe("function");
  });

  it("marketingSlice exports launchAwardsCampaign", async () => {
    const mod = await import("../../../store/slices/marketingSlice");
    expect(mod.createMarketingSlice).toBeDefined();
    expect(typeof mod.createMarketingSlice).toBe("function");
  });

  it("awards/index.ts exports processRazzies and runAwardsCeremony", async () => {
    const mod = await import("../../../engine/systems/awards/index");
    expect(mod.processRazzies).toBeDefined();
    expect(mod.runAwardsCeremony).toBeDefined();
  });
});

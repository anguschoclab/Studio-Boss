import {describe, it, expect, beforeEach} from "vitest";
import {useGameStore} from "@/store/gameStore";
import {createMockGameState, createMockProject} from "../utils/mockFactories";
import {type ProjectId} from "@/engine/types/shared.types";

/**
 * Covers the extended lockMarketingCampaign action used by the project detail
 * modal's marketing tab. Costs/buzz must match the tier cards displayed in the
 * UI (basic = 10% of budget / +15 buzz, blockbuster = 50% / +40).
 */
describe("projectEventsSlice — lockMarketingCampaign", () => {
  const seed = (projectOverrides = {}, cash = 100_000_000) => {
    const project = createMockProject({
      id: "p1",
      state: "marketing",
      budget: 10_000_000,
      buzz: 50,
      ...projectOverrides,
    });
    const gameState = createMockGameState();
    gameState.entities.projects = { p1: project } as never;
    gameState.studio.internal.projects = { p1: project };
    gameState.finance.cash = cash;
    useGameStore.setState({ gameState });
    return project;
  };

  const getProject = () => useGameStore.getState().gameState!.entities.projects["p1" as ProjectId];

  beforeEach(() => {
    seed();
  });

  it("deducts 10% of budget for basic and writes level + campaign", () => {
    useGameStore.getState().lockMarketingCampaign("p1" as ProjectId, "basic");
    const s = useGameStore.getState().gameState!;
    expect(s.finance.cash).toBe(99_000_000);

    const p = getProject();
    expect(p.marketingLevel).toBe("basic");
    expect(p.marketingBudget).toBe(1_000_000);
    expect(p.buzz).toBe(65);
    expect(p.marketingCampaign?.primaryAngle).toBe("SELL_THE_STORY");
    expect(p.marketingCampaign?.secondaryAngle).toBeUndefined();
    expect(p.marketingCampaign?.domesticBudget).toBe(600_000);
    expect(p.marketingCampaign?.foreignBudget).toBe(400_000);
    expect(p.marketingCampaign?.weeksInMarketing).toBe(1);
  });

  it("deducts 50% of budget for blockbuster and adds +40 buzz", () => {
    useGameStore.getState().lockMarketingCampaign("p1" as ProjectId, "blockbuster");
    const s = useGameStore.getState().gameState!;
    expect(s.finance.cash).toBe(95_000_000);
    expect(getProject().marketingLevel).toBe("blockbuster");
    expect(getProject().buzz).toBe(90);
  });

  it("records chosen primary and secondary angles on the campaign", () => {
    useGameStore
      .getState()
      .lockMarketingCampaign("p1" as ProjectId, "basic", "AWARDS_PUSH", "SELL_THE_STARS");
    const campaign = getProject().marketingCampaign;
    expect(campaign?.primaryAngle).toBe("AWARDS_PUSH");
    expect(campaign?.secondaryAngle).toBe("SELL_THE_STARS");
  });

  it("does not transition the project out of the marketing state", () => {
    // Release must continue to flow through the RELEASE_STRATEGY flow —
    // locking a campaign is not a release.
    useGameStore.getState().lockMarketingCampaign("p1" as ProjectId, "blockbuster");
    expect(getProject().state).toBe("marketing");
  });

  it("caps buzz at 100", () => {
    seed({ buzz: 95 });
    useGameStore.getState().lockMarketingCampaign("p1" as ProjectId, "blockbuster");
    expect(getProject().buzz).toBe(100);
  });

  it("is a no-op when cash is below the campaign cost", () => {
    seed({}, 500_000);
    useGameStore.getState().lockMarketingCampaign("p1" as ProjectId, "blockbuster");
    const s = useGameStore.getState().gameState!;
    expect(s.finance.cash).toBe(500_000);
    expect(getProject().marketingLevel).toBeUndefined();
    expect(getProject().marketingCampaign).toBeUndefined();
  });

  it("is a no-op for an unknown project id", () => {
    const before = useGameStore.getState().gameState;
    useGameStore.getState().lockMarketingCampaign("missing" as ProjectId, "basic");
    expect(useGameStore.getState().gameState).toBe(before);
  });
});

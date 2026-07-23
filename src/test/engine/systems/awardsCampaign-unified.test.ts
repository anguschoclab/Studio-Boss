import { describe, it, expect, vi } from "vitest";
import { launchAwardsCampaign, AwardsCampaignResult } from "@/engine/systems/awards/AwardsCampaign";
import { RandomGenerator } from "@/engine/utils/rng";
import { GameState, Project, AwardsProfile } from "@/engine/types";
import { createMockGameState, createMockProject } from "@/test/utils/mockFactories";

const mockAwardsProfile: AwardsProfile = {
  criticScore: 85,
  audienceScore: 80,
  prestigeScore: 75,
  craftScore: 90,
  culturalHeat: 70,
  campaignStrength: 65,
  controversyRisk: 20,
  festivalBuzz: 75,
  academyAppeal: 85,
  guildAppeal: 80,
  populistAppeal: 70,
  indieCredibility: 40,
  industryNarrativeScore: 75,
};

const makeState = (overrides: Partial<GameState> = {}): GameState => {
  const project = createMockProject({
    id: "proj-1",
    title: "Test Project",
    state: "released",
    releaseWeek: 5,
    awardsProfile: mockAwardsProfile,
    reviewScore: 75,
  });
  return createMockGameState({
    finance: { cash: 10_000_000 } as any,
    entities: {
      projects: { "proj-1": project },
      releasedProjectIds: ["proj-1"],
      contracts: {},
      talents: {},
      rivals: {},
      contractsByProjectId: {},
      contractsByTalentId: {},
    },
    ...overrides,
  });
};

describe("launchAwardsCampaign (engine)", () => {
  it("returns null when project doesn't exist", () => {
    const state = makeState();
    const rng = new RandomGenerator(42);
    const result = launchAwardsCampaign(state, "nonexistent", "Grassroots", rng);
    expect(result).toBeNull();
  });

  it("returns null when insufficient cash", () => {
    const state = makeState({
      finance: { cash: 100_000 } as any,
    });
    const rng = new RandomGenerator(42);
    const result = launchAwardsCampaign(state, "proj-1", "Blitz", rng);
    expect(result).toBeNull();
  });

  it("returns AwardsCampaignResult with correct CampaignData", () => {
    const state = makeState();
    const rng = new RandomGenerator(42);
    const result = launchAwardsCampaign(state, "proj-1", "Trade", rng);
    expect(result).not.toBeNull();
    expect(result!.campaign).toBeDefined();
    expect(result!.campaign.projectId).toBe("proj-1");
    expect(result!.campaign.budget).toBe(1_000_000);
    expect(result!.campaign.buzzBonus).toBe(15);
    expect(result!.campaign.scandalRisk).toBe(2);
    expect(result!.campaign.targetCategories).toEqual(["Best Picture"]);
  });

  it("deducts correct cost based on tier", () => {
    const state = makeState();
    const rng1 = new RandomGenerator(42);
    const r1 = launchAwardsCampaign(state, "proj-1", "Grassroots", rng1);
    expect(r1!.cost).toBe(250_000);

    const rng2 = new RandomGenerator(42);
    const r2 = launchAwardsCampaign(state, "proj-1", "Trade", rng2);
    expect(r2!.cost).toBe(1_000_000);

    const rng3 = new RandomGenerator(42);
    const r3 = launchAwardsCampaign(state, "proj-1", "Blitz", rng3);
    expect(r3!.cost).toBe(5_000_000);
  });

  it("sets targetCategories from parameter", () => {
    const state = makeState();
    const rng = new RandomGenerator(42);
    const result = launchAwardsCampaign(state, "proj-1", "Trade", rng, ["Best Director", "Best Actor"]);
    expect(result!.campaign.targetCategories).toEqual(["Best Director", "Best Actor"]);
  });

  it("defaults targetCategories to ['Best Picture'] when parameter omitted", () => {
    const state = makeState();
    const rng = new RandomGenerator(42);
    const result = launchAwardsCampaign(state, "proj-1", "Trade", rng);
    expect(result!.campaign.targetCategories).toEqual(["Best Picture"]);
  });

  it("backlash flag is set when checkCampaignBacklash returns true", () => {
    const state = makeState();
    const project = state.entities.projects["proj-1"] as any;
    project.reception = { metaScore: 50 };

    const mockRng = { next: vi.fn(() => 0.15), uuid: vi.fn(() => "mock-id"), getState: vi.fn(() => 999) } as unknown as RandomGenerator;
    const result = launchAwardsCampaign(state, "proj-1", "Blitz", mockRng);
    expect(result!.backlash).toBe(true);
  });

  it("backlash flag is false when score is high", () => {
    const state = makeState();
    const project = state.entities.projects["proj-1"] as any;
    project.reception = { metaScore: 90 };

    const rng = new RandomGenerator(42);
    const result = launchAwardsCampaign(state, "proj-1", "Blitz", rng);
    expect(result!.backlash).toBe(false);
  });

  it("impacts include backlash news headline when backlash occurs", () => {
    const state = makeState();
    const project = state.entities.projects["proj-1"] as any;
    project.reception = { metaScore: 50 };

    const mockRng = { next: vi.fn(() => 0.15), uuid: vi.fn(() => "mock-id"), getState: vi.fn(() => 999) } as unknown as RandomGenerator;
    const result = launchAwardsCampaign(state, "proj-1", "Blitz", mockRng);
    expect(result!.impacts.length).toBeGreaterThan(0);
    const headlineImpact = result!.impacts.find((i) => i.newHeadlines && i.newHeadlines.length > 0);
    expect(headlineImpact).toBeDefined();
    expect(headlineImpact!.newHeadlines![0].text).toContain("BACKLASH");
  });

  it("rngState is updated in result", () => {
    const state = makeState();
    const rng = new RandomGenerator(42);
    const result = launchAwardsCampaign(state, "proj-1", "Trade", rng);
    expect(result!.rngState).toBeDefined();
    expect(typeof result!.rngState).toBe("number");
  });

  it("campaign.buzzBonus matches tier buzz (Grassroots=5, Trade=15, Blitz=40)", () => {
    const state = makeState();
    const rng1 = new RandomGenerator(42);
    expect(launchAwardsCampaign(state, "proj-1", "Grassroots", rng1)!.campaign.buzzBonus).toBe(5);
    const rng2 = new RandomGenerator(42);
    expect(launchAwardsCampaign(state, "proj-1", "Trade", rng2)!.campaign.buzzBonus).toBe(15);
    const rng3 = new RandomGenerator(42);
    expect(launchAwardsCampaign(state, "proj-1", "Blitz", rng3)!.campaign.buzzBonus).toBe(40);
  });

  it("campaign.scandalRisk matches tier risk (Grassroots=0, Trade=2, Blitz=12)", () => {
    const state = makeState();
    const rng1 = new RandomGenerator(42);
    expect(launchAwardsCampaign(state, "proj-1", "Grassroots", rng1)!.campaign.scandalRisk).toBe(0);
    const rng2 = new RandomGenerator(42);
    expect(launchAwardsCampaign(state, "proj-1", "Trade", rng2)!.campaign.scandalRisk).toBe(2);
    const rng3 = new RandomGenerator(42);
    expect(launchAwardsCampaign(state, "proj-1", "Blitz", rng3)!.campaign.scandalRisk).toBe(12);
  });
});

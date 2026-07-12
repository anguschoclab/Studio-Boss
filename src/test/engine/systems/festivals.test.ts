import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  FESTIVALS,
  FESTIVAL_BY_BODY,
  submitToFestival,
  resolveFestivals,
} from "../../../engine/systems/festivals";
import { Project, GameState, FestivalSubmission, AwardBody } from "../../../engine/types";
import * as utils from "../../../engine/utils";

const mockProject: Project = {
  id: "proj-1",
  title: "Arthouse Darling",
  type: "FILM",
  format: "film",
  genre: "Drama",
  budgetTier: "low",
  budget: 5_000_000,
  weeklyCost: 100_000,
  targetAudience: "Niche",
  flavor: "Deep",
  state: "post_release",
  buzz: 10,
  weeksInPhase: 0,
  developmentWeeks: 10,
  productionWeeks: 10,
  revenue: 0,
  weeklyRevenue: 0,
  releaseWeek: 20,
  accumulatedCost: 0,
  momentum: 50,
  progress: 0,
  activeCrisis: null,
  reviewScore: 100,
  awardsProfile: {
    criticScore: 90,
    audienceScore: 80,
    prestigeScore: 85,
    craftScore: 80,
    culturalHeat: 40,
    campaignStrength: 20,
    controversyRisk: 5,
    festivalBuzz: 0,
    academyAppeal: 80,
    guildAppeal: 75,
    populistAppeal: 30,
    indieCredibility: 95,
    industryNarrativeScore: 60,
  },
} as Project;

describe("Festivals System", () => {
  let mockState: GameState;

  beforeEach(() => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "test-uuid-1234" as `${string}-${string}-${string}-${string}-${string}`
    );

    mockState = {
      week: 1,
      gameSeed: 1,
      tickCount: 0,
      projects: { active: [] },
      game: { currentWeek: 1 },
      finance: { cash: 1_000_000, ledger: [] },
      news: { headlines: [] },
      ip: { vault: [], franchises: {} },
      entities: {
        projects: { [mockProject.id]: { ...mockProject } },
        talents: {},
        contracts: {},
        rivals: {},
      },
      studio: {
        id: "PLR-1",
        name: "Test",
        archetype: "major",
        prestige: 50,
        internal: {
          projectHistory: [],
        },
      },
      market: { opportunities: [], buyers: [] },
      industry: {
        rivals: [],
        families: [],
        agencies: [],
        agents: [],
        talentPool: {},
        newsHistory: [],
        festivalSubmissions: [],
        rumors: [],
      },
      culture: { genrePopularity: {} },
      history: [],
      eventHistory: [],
    } as unknown as GameState;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- FESTIVAL_BY_BODY Map tests ---

  describe("FESTIVAL_BY_BODY", () => {
    it("has exactly 4 entries matching FESTIVALS", () => {
      expect(FESTIVAL_BY_BODY.size).toBe(FESTIVALS.length);
      expect(FESTIVAL_BY_BODY.size).toBe(4);
    });

    it("each key matches an AwardBody from FESTIVALS", () => {
      for (const fest of FESTIVALS) {
        expect(FESTIVAL_BY_BODY.has(fest.body)).toBe(true);
      }
    });

    it("lookup by body returns correct festival data", () => {
      const sundance = FESTIVAL_BY_BODY.get("Sundance Film Festival");
      expect(sundance).toBeDefined();
      expect(sundance!.name).toBe("Sundance");
      expect(sundance!.cost).toBe(25000);
      expect(sundance!.buzzReward).toBe(30);

      const cannes = FESTIVAL_BY_BODY.get("Cannes Film Festival");
      expect(cannes).toBeDefined();
      expect(cannes!.name).toBe("Cannes");
      expect(cannes!.buzzReward).toBe(50);
    });

    it("returns undefined for unknown body", () => {
      expect(
        FESTIVAL_BY_BODY.get("Toronto International Film Festival" as AwardBody)
      ).toBeUndefined();
    });
  });

  // --- submitToFestival tests ---

  it("submits a project to a festival if cash is sufficient", () => {
    const festival = FESTIVALS[0]; // Sundance
    const impact = submitToFestival(mockState, mockProject.id, festival.body);

    expect(impact).not.toBeNull();
    expect(impact!.cashChange).toBe(-festival.cost);
    expect(impact!.newFestivalSubmissions?.length).toBe(1);
    expect(impact!.newFestivalSubmissions![0].projectId).toBe(mockProject.id);
    expect(impact!.newFestivalSubmissions![0].status).toBe("submitted");
  });

  it("declines submission if cash is too low", () => {
    const festival = FESTIVALS[0];
    mockState.finance.cash = 0;
    const impact = submitToFestival(mockState, mockProject.id, festival.body);

    expect(impact).toBeNull();
  });

  it("declines submission when project not found", () => {
    const festival = FESTIVALS[0];
    const impact = submitToFestival(mockState, "nonexistent-project", festival.body);
    expect(impact).toBeNull();
  });

  it("declines submission when project is in development state", () => {
    const festival = FESTIVALS[0];
    (mockState.entities.projects[mockProject.id] as Project).state = "development";
    const impact = submitToFestival(mockState, mockProject.id, festival.body);
    expect(impact).toBeNull();
  });

  it("declines submission when project is in pitching state", () => {
    const festival = FESTIVALS[0];
    (mockState.entities.projects[mockProject.id] as Project).state = "pitching";
    const impact = submitToFestival(mockState, mockProject.id, festival.body);
    expect(impact).toBeNull();
  });

  it("declines submission when festival body is not in FESTIVALS", () => {
    const impact = submitToFestival(
      mockState,
      mockProject.id,
      "Toronto International Film Festival" as AwardBody
    );
    expect(impact).toBeNull();
  });

  it("appends to existing submissions preserving prior entries", () => {
    const festival = FESTIVALS[0];
    const existing: FestivalSubmission = {
      id: "prior-sub",
      projectId: "other-proj",
      festivalBody: "Cannes Film Festival" as AwardBody,
      status: "selected",
      buzzGain: 50,
      week: 1,
    };
    mockState.industry.festivalSubmissions = [existing];
    const impact = submitToFestival(mockState, mockProject.id, festival.body);
    expect(impact).not.toBeNull();
    expect(impact!.newFestivalSubmissions?.length).toBe(2);
    expect(impact!.newFestivalSubmissions![0]).toEqual(existing);
    expect(impact!.newFestivalSubmissions![1].projectId).toBe(mockProject.id);
  });

  it("headline text contains the festival name", () => {
    const festival = FESTIVALS[0];
    const impact = submitToFestival(mockState, mockProject.id, festival.body);
    expect(impact).not.toBeNull();
    expect(impact!.newHeadlines?.[0].text).toContain(festival.name);
    expect(impact!.newHeadlines?.[0].text).toContain(mockProject.title);
  });

  // --- resolveFestivals tests ---

  it("resolves festival results and awards rewards", () => {
    const festival = FESTIVALS.find((f) => f.body === "Sundance Film Festival")!;
    const submission: FestivalSubmission = {
      id: "sub-1",
      projectId: mockProject.id,
      festivalBody: festival.body,
      status: "submitted",
      buzzGain: 0,
      week: 1,
    };

    mockState.industry.festivalSubmissions = [submission];
    mockState.week = 3; // Sundance week

    // Force acceptance
    vi.spyOn(utils, "randRange").mockReturnValue(0);

    const impact = resolveFestivals(mockState);

    expect(impact.newFestivalSubmissions?.some((s) => s.status === "selected")).toBe(true);
    expect(impact.prestigeChange).toBeGreaterThan(0);
    expect(impact.projectUpdates?.some((u) => u.projectId === mockProject.id)).toBe(true);
  });

  it("returns empty object when festivalSubmissions is empty", () => {
    mockState.industry.festivalSubmissions = [];
    const impact = resolveFestivals(mockState);
    expect(impact).toEqual({});
  });

  it("returns empty object when festivalSubmissions is undefined", () => {
    mockState.industry.festivalSubmissions = undefined as unknown as FestivalSubmission[];
    const impact = resolveFestivals(mockState);
    expect(impact).toEqual({});
  });

  it("passes through non-submitted status submissions unchanged", () => {
    const selectedSub: FestivalSubmission = {
      id: "sub-sel",
      projectId: mockProject.id,
      festivalBody: "Sundance Film Festival",
      status: "selected",
      buzzGain: 30,
      week: 1,
    };
    const rejectedSub: FestivalSubmission = {
      id: "sub-rej",
      projectId: mockProject.id,
      festivalBody: "Sundance Film Festival",
      status: "rejected",
      buzzGain: 0,
      week: 1,
    };
    mockState.industry.festivalSubmissions = [selectedSub, rejectedSub];
    mockState.week = 3;
    const impact = resolveFestivals(mockState);
    const results = impact.newFestivalSubmissions ?? [];
    expect(results.some((s) => s.id === "sub-sel" && s.status === "selected")).toBe(true);
  });

  it("skips submission when festival body is not found in Map", () => {
    const submission: FestivalSubmission = {
      id: "sub-unknown",
      projectId: mockProject.id,
      festivalBody: "Toronto International Film Festival" as AwardBody,
      status: "submitted",
      buzzGain: 0,
      week: 1,
    };
    mockState.industry.festivalSubmissions = [submission];
    mockState.week = 36;
    const impact = resolveFestivals(mockState);
    const results = impact.newFestivalSubmissions ?? [];
    expect(results.some((s) => s.id === "sub-unknown" && s.status === "submitted")).toBe(true);
    expect(impact.prestigeChange).toBe(0);
  });

  it("skips submission when project not found in state", () => {
    const submission: FestivalSubmission = {
      id: "sub-noproj",
      projectId: "missing-project",
      festivalBody: "Sundance Film Festival",
      status: "submitted",
      buzzGain: 0,
      week: 1,
    };
    mockState.industry.festivalSubmissions = [submission];
    mockState.week = 3;
    const impact = resolveFestivals(mockState);
    const results = impact.newFestivalSubmissions ?? [];
    expect(results.some((s) => s.id === "sub-noproj" && s.status === "submitted")).toBe(true);
    expect(impact.prestigeChange).toBe(0);
  });

  it("does not resolve when current week is not a festival week", () => {
    const submission: FestivalSubmission = {
      id: "sub-wait",
      projectId: mockProject.id,
      festivalBody: "Sundance Film Festival",
      status: "submitted",
      buzzGain: 0,
      week: 1,
    };
    mockState.industry.festivalSubmissions = [submission];
    mockState.week = 10; // Not a Sundance week (3 or 4)
    const impact = resolveFestivals(mockState);
    const results = impact.newFestivalSubmissions ?? [];
    expect(results.some((s) => s.id === "sub-wait" && s.status === "submitted")).toBe(true);
    expect(impact.prestigeChange).toBe(0);
    expect(impact.projectUpdates?.length ?? 0).toBe(0);
  });

  it("rejects submission when baseChance is not high enough", () => {
    const submission: FestivalSubmission = {
      id: "sub-reject",
      projectId: mockProject.id,
      festivalBody: "Venice Film Festival",
      status: "submitted",
      buzzGain: 0,
      week: 34,
    };
    mockState.industry.festivalSubmissions = [submission];
    mockState.week = 35; // Venice week
    // Venice prestigeNeeded=70, baseChance=100+25=125, force randRange to return 60 → 70+60=130 > 125
    vi.spyOn(utils, "randRange").mockReturnValue(60);
    const impact = resolveFestivals(mockState);
    const results = impact.newFestivalSubmissions ?? [];
    expect(results.some((s) => s.id === "sub-reject" && s.status === "rejected")).toBe(true);
    expect(impact.prestigeChange).toBe(0);
  });

  it("filters out rejected submissions older than 12 weeks", () => {
    const submission: FestivalSubmission = {
      id: "sub-old-rej",
      projectId: mockProject.id,
      festivalBody: "Sundance Film Festival",
      status: "submitted",
      buzzGain: 0,
      week: 1,
    };
    mockState.industry.festivalSubmissions = [submission];
    mockState.week = 3; // Sundance week
    // Sundance prestigeNeeded=40, baseChance=100+25=125, force randRange=90 → 40+90=130 > 125 → rejected
    vi.spyOn(utils, "randRange").mockReturnValue(90);
    const impact = resolveFestivals(mockState);
    // week=3, sub.week=1, 3-1=2 < 12 → rejected sub should be retained
    expect(
      impact.newFestivalSubmissions?.some((s) => s.id === "sub-old-rej" && s.status === "rejected")
    ).toBe(true);
  });

  it("removes rejected submissions after 12 weeks", () => {
    const rejectedSub: FestivalSubmission = {
      id: "sub-stale",
      projectId: mockProject.id,
      festivalBody: "Sundance Film Festival",
      status: "rejected",
      buzzGain: 0,
      week: 1,
    };
    mockState.industry.festivalSubmissions = [rejectedSub];
    mockState.week = 14; // 14 - 1 = 13 >= 12
    const impact = resolveFestivals(mockState);
    // rejectedSub has status 'rejected' so it passes through unchanged, then filtered out
    expect(impact.newFestivalSubmissions?.some((s) => s.id === "sub-stale")).toBe(false);
  });

  it("caps buzz at 100 on acceptance", () => {
    const submission: FestivalSubmission = {
      id: "sub-cap",
      projectId: mockProject.id,
      festivalBody: "Sundance Film Festival",
      status: "submitted",
      buzzGain: 0,
      week: 1,
    };
    // Set project buzz high so buzz + reward > 100
    (mockState.entities.projects[mockProject.id] as Project).buzz = 90;
    mockState.industry.festivalSubmissions = [submission];
    mockState.week = 3;
    vi.spyOn(utils, "randRange").mockReturnValue(0);
    const impact = resolveFestivals(mockState);
    const update = impact.projectUpdates?.find((u) => u.projectId === mockProject.id);
    expect(update).toBeDefined();
    expect(update!.update.buzz).toBe(100);
  });

  it("resolves multiple submissions in the same loop", () => {
    const sub1: FestivalSubmission = {
      id: "sub-multi-1",
      projectId: mockProject.id,
      festivalBody: "Sundance Film Festival",
      status: "submitted",
      buzzGain: 0,
      week: 1,
    };
    const sub2: FestivalSubmission = {
      id: "sub-multi-2",
      projectId: mockProject.id,
      festivalBody: "Sundance Film Festival",
      status: "submitted",
      buzzGain: 0,
      week: 1,
    };
    mockState.industry.festivalSubmissions = [sub1, sub2];
    mockState.week = 3;
    vi.spyOn(utils, "randRange").mockReturnValue(0);
    const impact = resolveFestivals(mockState);
    const selected = impact.newFestivalSubmissions?.filter((s) => s.status === "selected") ?? [];
    expect(selected.length).toBe(2);
    expect(impact.prestigeChange).toBe(4); // 2 per acceptance
  });
});

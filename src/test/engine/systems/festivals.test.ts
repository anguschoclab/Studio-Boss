import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FESTIVALS, submitToFestival, resolveFestivals } from '../../../engine/systems/festivals';
import { Project, GameState, FestivalSubmission, ContentFlag } from '../../../engine/types';
import { RandomGenerator } from '../../../engine/utils/rng';
import * as utils from '../../../engine/utils';

const mockProject: Project = {
  id: "proj-1",
  title: "Arthouse Darling",
  type: 'FILM',
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
    industryNarrativeScore: 60
  }
} as Project;

describe('Festivals System', () => {
  let mockState: GameState;

  beforeEach(() => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-uuid-1234' as `${string}-${string}-${string}-${string}-${string}`);

    mockState = {
      week: 1,
      gameSeed: 1,
      tickCount: 0,
      projects: { active: [] },
      game: { currentWeek: 1 },
      finance: { cash: 1_000_000, ledger: [] },
      news: { headlines: [] },
      ip: { vault: [], franchises: {} },
      studio: {
        name: "Test",
        archetype: 'major',
        prestige: 50,
        internal: {
          projects: { [mockProject.id]: { ...mockProject } },
          contracts: []
        }
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
        rumors: []
      },
      culture: { genrePopularity: {} },
      history: [],
      eventHistory: []
    } as unknown as GameState;
  });

  it('submits a project to a festival if cash is sufficient', () => {
    const rng = new RandomGenerator(1);
    const festival = FESTIVALS[0]; // Sundance
    const impact = submitToFestival(mockState, mockProject.id, festival.body, rng);
    
    expect(impact).not.toBeNull();
    expect(impact!.cashChange).toBe(-festival.cost);
    expect(impact!.newFestivalSubmissions?.length).toBe(1);
    expect(impact!.newFestivalSubmissions![0].projectId).toBe(mockProject.id);
    expect(impact!.newFestivalSubmissions![0].status).toBe('submitted');
  });

  it('declines submission if cash is too low', () => {
    const rng = new RandomGenerator(1);
    const festival = FESTIVALS[0]; 
    mockState.finance.cash = 0;
    const impact = submitToFestival(mockState, mockProject.id, festival.body, rng);
    
    expect(impact).toBeNull();
  });

  it('resolves festival results and awards rewards', () => {
    const festival = FESTIVALS.find(f => f.body === "Sundance Film Festival")!;
    const submission: FestivalSubmission = {
      id: 'sub-1',
      projectId: mockProject.id,
      festivalBody: festival.body,
      status: 'submitted',
      buzzGain: 0,
      week: 1
    };
    
    mockState.industry.festivalSubmissions = [submission];
    mockState.week = 3; // Sundance week

    // Force high acceptance chance with high review score in mockProject (100)
    // and fixed seed 1 for predictable RNG.
    const rng = new RandomGenerator(1); 
    
    const impact = resolveFestivals(mockState, rng);
    
    expect(impact.newFestivalSubmissions?.some(s => s.status === 'selected')).toBe(true);
    expect(impact.prestigeChange).toBeGreaterThan(0);
    expect(impact.projectUpdates?.some(u => u.projectId === mockProject.id)).toBe(true);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FESTIVALS, submitToFestival, resolveFestivals } from '../../../engine/systems/festivals';
import { Project, GameState, FestivalSubmission } from '../../../engine/types';
import * as utils from '../../../engine/utils';

describe('Festivals System', () => {
  let mockProject: Project;
  let mockState: GameState;

  beforeEach(() => {
    mockProject = {
      id: "proj-1",
      title: "Arthouse Darling",
      format: "film",
      genre: "Drama",
      budgetTier: "low",
      budget: 5_000_000,
      weeklyCost: 100_000,
      targetAudience: "Niche",
      flavor: "Deep",
      status: "post_release",
      buzz: 10,
      weeksInPhase: 0,
      developmentWeeks: 10,
      productionWeeks: 10,
      revenue: 0,
      weeklyRevenue: 0,
      releaseWeek: 20,
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
    };

    mockState = {
      week: 1,
      cash: 1_000_000,
      studio: { 
        name: "Test", 
        prestige: 50,
        internal: {
          projects: { [mockProject.id]: mockProject }, // Record
          contracts: [],
          financeHistory: [],
        }
      },
      market: {
        opportunities: [],
        buyers: [],
      },
      industry: {
        rivals: [],
        headlines: [],
        talentPool: {},
        agencies: [],
        festivalSubmissions: [],
      },
      finance: { bankBalance: 1000000, yearToDateRevenue: 0, yearToDateExpenses: 0 }
    } as any;
  });

  it('submits a project to a festival if cash is sufficient and status is valid', () => {
    const festival = FESTIVALS[0]; // Sundance
    const impact = submitToFestival(mockState, mockProject.id, festival.body);
    
    expect(impact).not.toBeNull();
    if (impact) {
        expect(impact.cashChange).toBe(-festival.cost);
        expect(impact.newFestivalSubmissions?.length).toBe(1);
        expect(impact.newFestivalSubmissions![0].projectId).toBe(mockProject.id);
        expect(impact.newFestivalSubmissions![0].status).toBe('submitted');
    }
  });

  it('declines submission if project cannot be found or cash is too low', () => {
    const festival = FESTIVALS[0]; 
    const brokeState = { ...mockState, cash: 0 };
    const impact = submitToFestival(brokeState, mockProject.id, festival.body);
    
    expect(impact).toBeNull();
  });

  it('resolves festival results and correctly awards buzz and prestige', () => {
    // Sundance is week 3
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
    mockState.week = 3;

    // Force a high random value so it gets selected
    vi.spyOn(utils, 'randRange').mockReturnValue(0); // Mid-range for the chance calculation
    
    const impact = resolveFestivals(mockState);
    
    expect(impact.newFestivalSubmissions?.length).toBe(1);
    expect(impact.newFestivalSubmissions![0].status).toBe('selected');
    expect(impact.projectUpdates).toContainEqual(expect.objectContaining({
        projectId: mockProject.id,
        update: expect.objectContaining({ buzz: expect.any(Number) })
    }));
    expect(impact.prestigeChange).toBeGreaterThan(0);
  });
});

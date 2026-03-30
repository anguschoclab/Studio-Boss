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
          projects: [mockProject],
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
        talentPool: [],
        agencies: [],
        festivalSubmissions: [],
      }
    } as any;
  });

  it('submits a project to a festival if cash is sufficient and status is valid', () => {
    const festival = FESTIVALS[0]; // Cannes
    const newState = submitToFestival(mockState, mockProject.id, festival.body);
    
    expect(newState).not.toBeNull();
    if (newState) {
        expect((newState as any).cash).toBe(1_000_000 - festival.cost);
        expect((newState as any).industry.festivalSubmissions.length).toBe(1);
        expect((newState as any).industry.festivalSubmissions[0].projectId).toBe(mockProject.id);
        expect((newState as any).industry.festivalSubmissions[0].status).toBe('submitted');
    }
  });

  it('declines submission if project cannot be found or cash is too low', () => {
    const festival = FESTIVALS[0]; 
    const brokeState = { ...mockState, cash: 0 };
    const newState = submitToFestival(brokeState, mockProject.id, festival.body);
    
    expect(newState).toBeNull();
  });

  it('resolves festival results and correctly selects/rejects based on indie credibility and prestige', () => {
    // Cannes happens in week 21
    const festival = FESTIVALS.find(f => f.body === "Cannes Film Festival")!;
    
    const submission: FestivalSubmission = {
      id: 'sub-1',
      projectId: mockProject.id,
      festivalBody: festival.body,
      status: 'submitted',
      buzzGain: 0,
      week: 1
    };
    
    mockState.industry.festivalSubmissions = [submission];

    // First ensure it does nothing if it's the wrong week
    let resultState = resolveFestivals(mockState);
    expect((Object.values((resultState as any).studio.internal.projects)[0] as any).buzz).toBe(10); // Unchanged

    // Now trigger it on week 21
    // Force a high random value so it gets selected
    const correctWeekState = { 
      ...mockState, 
      week: 21, 
      industry: { 
        ...mockState.industry,
        festivalSubmissions: [submission] 
      } 
    } as any;
    vi.spyOn(utils, 'secureRandom').mockReturnValue(0.99);
    
    resultState = resolveFestivals(correctWeekState);
    expect((resultState as any).industry.festivalSubmissions.length).toBe(1);
    
    // Cannes requires high prestige/indieCredibility. With our random mock, it should win or be selected.
    expect((resultState as any).industry.festivalSubmissions[0].status).toBe('selected');
    expect((Object.values((resultState as any).studio.internal.projects)[0] as any).buzz).toBeGreaterThan(10); // Buzz was awarded
  });
});

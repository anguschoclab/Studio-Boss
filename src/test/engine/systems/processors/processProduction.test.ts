import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processProduction } from '../../../../engine/systems/processors/processProduction';
import { GameState, Project, TalentProfile } from '../../../../engine/types';

vi.mock('../../../../engine/systems/projects', () => ({
  advanceProject: vi.fn()
}));
vi.mock('../../../../engine/systems/crises', () => ({
  checkAndTriggerCrisis: vi.fn()
}));
vi.mock('../../../../engine/systems/awards', () => ({
  generateAwardsProfile: vi.fn()
}));
vi.mock('../../../../engine/systems/releaseSimulation', () => ({
  calculateBoxOfficeRanks: vi.fn()
}));
vi.mock('../../../../engine/systems/directors', () => ({
  processDirectorDisputes: vi.fn()
}));
vi.mock('../../../../engine/systems/trends', () => ({
  getTrendMultiplier: vi.fn()
}));

import { advanceProject } from '../../../../engine/systems/projects';
import { checkAndTriggerCrisis } from '../../../../engine/systems/crises';
import { generateAwardsProfile } from '../../../../engine/systems/awards';
import { calculateBoxOfficeRanks } from '../../../../engine/systems/releaseSimulation';
import { processDirectorDisputes } from '../../../../engine/systems/directors';
import { getTrendMultiplier } from '../../../../engine/systems/trends';

describe('processProduction', () => {
  const getInitialState = (): GameState => ({
    week: 1,
    cash: 1000000,
    studio: {
      name: 'Test Studio',
      archetype: 'major',
      prestige: 50,
      internal: {
        projects: {}, 
        contracts: [],
        financeHistory: []
      }
    },
    market: {
      opportunities: [],
      buyers: []
    },
    industry: {
      rivals: [],
      headlines: [],
      families: [],
      agencies: [],
      agents: [],
      talentPool: {},
      newsHistory: []
    },
    culture: { genrePopularity: {} },
    finance: { bankBalance: 1000000, yearToDateRevenue: 0, yearToDateExpenses: 0 },
    history: []
  });

  const createBaseProject = (id: string, status: Project['status']): Project => ({
    id, title: `Project ${id}`, format: 'film', genre: 'Action', budgetTier: 'mid',
    budget: 50000000, weeklyCost: 1000000, targetAudience: 'General Audience', flavor: 'Boom',
    status, buzz: 50, weeksInPhase: 0, developmentWeeks: 4, productionWeeks: 4,
    revenue: 0, weeklyRevenue: 0, releaseWeek: null
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('halts production if an active unresolved crisis exists', () => {
    const state = getInitialState();
    const crisisProject = createBaseProject('p1', 'production');
    crisisProject.activeCrisis = {
      description: 'A massive scandal!', options: [], resolved: false, severity: 'high'
    };
    state.studio.internal.projects = { [crisisProject.id]: crisisProject };

    const impact = processProduction(state);

    expect(advanceProject).not.toHaveBeenCalled();
    expect(impact.uiNotifications).toContain('"Project p1" production is halted until the active crisis is resolved.');
  });

  it('advances a project correctly and triggers wrap event', () => {
    const state = getInitialState();
    const project = createBaseProject('p1', 'production');
    state.studio.internal.projects = { [project.id]: project };

    vi.mocked(getTrendMultiplier).mockReturnValue(1.0);
    vi.mocked(advanceProject).mockReturnValue({
      project: { ...project, status: 'marketing' },
      update: 'Project advanced to marketing',
      talentUpdates: []
    });
    vi.mocked(checkAndTriggerCrisis).mockReturnValue({});
    vi.mocked(processDirectorDisputes).mockReturnValue({ newCrises: [], updates: [] });
    vi.mocked(calculateBoxOfficeRanks).mockReturnValue(new Map());

    const impact = processProduction(state);

    expect(impact.projectUpdates).toContainEqual(expect.objectContaining({
        projectId: 'p1',
        update: expect.objectContaining({ status: 'marketing' })
    }));
    expect(impact.uiNotifications).toContain('Project advanced to marketing');
    expect(impact.newsEvents?.some(ne => ne.type === 'STUDIO_EVENT' && ne.headline === 'Project p1 Wraps Production')).toBeTruthy();
  });

  it('triggers a release event and generates awards profile when project transitions to released', () => {
    const state = getInitialState();
    const project = createBaseProject('p1', 'marketing');
    state.studio.internal.projects = { [project.id]: project };

    vi.mocked(getTrendMultiplier).mockReturnValue(1.5);
    vi.mocked(advanceProject).mockReturnValue({
      project: { ...project, status: 'released' },
      update: 'Project released!',
      talentUpdates: []
    });
    vi.mocked(generateAwardsProfile).mockReturnValue({
      criticScore: 80, audienceScore: 90, prestigeScore: 70, craftScore: 60,
      culturalHeat: 50, campaignStrength: 40, controversyRisk: 10,
      festivalBuzz: 20, academyAppeal: 30, guildAppeal: 40, populistAppeal: 80,
      indieCredibility: 10, industryNarrativeScore: 50
    });
    vi.mocked(calculateBoxOfficeRanks).mockReturnValue(new Map([['p1', 1]]));

    const impact = processProduction(state);

    expect(impact.projectUpdates).toContainEqual(expect.objectContaining({
        projectId: 'p1',
        update: expect.objectContaining({ 
            status: 'released',
            awardsProfile: expect.any(Object),
            boxOfficeRank: 1
        })
    }));
    expect(impact.newsEvents?.some(ne => ne.type === 'RELEASE')).toBeTruthy();
  });

  it('triggers a new crisis during production', () => {
    const state = getInitialState();
    const project = createBaseProject('p1', 'production');
    state.studio.internal.projects = { [project.id]: project };

    vi.mocked(getTrendMultiplier).mockReturnValue(1.0);
    vi.mocked(advanceProject).mockReturnValue({
      project: { ...project },
      update: '',
      talentUpdates: []
    });
    vi.mocked(checkAndTriggerCrisis).mockReturnValue({
      projectUpdates: [{ 
          projectId: 'p1', 
          update: { activeCrisis: { description: 'Star got a haircut!', options: [], resolved: false, severity: 'medium' } } 
      }],
      uiNotifications: ['CRISIS: "Project p1" - Star got a haircut!']
    });
    vi.mocked(processDirectorDisputes).mockReturnValue({ newCrises: [], updates: [] });
    vi.mocked(calculateBoxOfficeRanks).mockReturnValue(new Map());

    const impact = processProduction(state);

    expect(impact.projectUpdates).toContainEqual(expect.objectContaining({
        projectId: 'p1',
        update: expect.objectContaining({ 
            activeCrisis: expect.objectContaining({ description: 'Star got a haircut!' })
        })
    }));
    expect(impact.uiNotifications).toContain('CRISIS: "Project p1" - Star got a haircut!');
  });

  it('updates talent correctly through advanceProject return', () => {
     const state = getInitialState();
     const talent: TalentProfile = { 
         id: 't1', name: 'Actor', roles: ['actor'], prestige: 50, fee: 1000, draw: 50, temperament: 'Normal', accessLevel: 'outsider',
         age: 30, gender: 'male', ethnicity: 'white', nationality: 'USA', traits: [], stats: { acting: 50, directing: 0, writing: 0, production: 0 }, workHistory: [] 
     };
     state.industry.talentPool = { [talent.id]: talent };
     const project = createBaseProject('p1', 'development');
     state.studio.internal.projects = { [project.id]: project };

     const updatedTalent = { ...talent, prestige: 60 };
     vi.mocked(getTrendMultiplier).mockReturnValue(1.0);
     vi.mocked(advanceProject).mockReturnValue({
       project: { ...project },
       update: '',
       talentUpdates: [updatedTalent]
     });
     vi.mocked(calculateBoxOfficeRanks).mockReturnValue(new Map());

     const impact = processProduction(state);

     expect(impact.talentUpdates).toContainEqual({
         talentId: 't1',
         update: expect.objectContaining({ prestige: 60 })
     });
  });

  it('computes average rival strength correctly', () => {
    const state = getInitialState();
    const project = createBaseProject('p1', 'production');
    state.studio.internal.projects = { [project.id]: project };
    state.industry.rivals = [
      { id: 'r1', name: 'Rival 1', strength: 60, cash: 1000, archetype: 'major', marketShare: 0, prestige: 50, strategies: [], activity: '', projects: [], recentActivity: '', isAcquirable: false, projectCount: 5, activeFranchises: [] },
      { id: 'r2', name: 'Rival 2', strength: 40, cash: 1000, archetype: 'major', marketShare: 0, prestige: 50, strategies: [], activity: '', projects: [], recentActivity: '', isAcquirable: false, projectCount: 5, activeFranchises: [] }
    ];

    vi.mocked(getTrendMultiplier).mockReturnValue(1.0);
    vi.mocked(advanceProject).mockReturnValue({
      project: { ...project, status: 'production' },
      update: '',
      talentUpdates: []
    });
    vi.mocked(checkAndTriggerCrisis).mockReturnValue({});
    vi.mocked(processDirectorDisputes).mockReturnValue({ newCrises: [], updates: [] });
    vi.mocked(calculateBoxOfficeRanks).mockReturnValue(new Map());

    processProduction(state);

    expect(advanceProject).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      50, // Expected average rival strength: (60 + 40) / 2 = 50
      expect.anything(),
      expect.anything()
    );
  });

  it('triggers a new crisis from a director dispute during production', () => {
    const state = getInitialState();
    const project = createBaseProject('p1', 'production');
    state.studio.internal.projects = { [project.id]: project };

    vi.mocked(getTrendMultiplier).mockReturnValue(1.0);
    vi.mocked(advanceProject).mockReturnValue({
      project: { ...project, status: 'production' },
      update: '',
      talentUpdates: []
    });
    vi.mocked(checkAndTriggerCrisis).mockReturnValue({});
    vi.mocked(processDirectorDisputes).mockReturnValue({
      newCrises: [{ 
          projectId: 'p1', 
          crisis: { description: 'Director dispute!', options: [], resolved: false, severity: 'high' } 
      }],
      updates: ['Director is unhappy!']
    });
    vi.mocked(calculateBoxOfficeRanks).mockReturnValue(new Map());

    const impact = processProduction(state);

    expect(impact.projectUpdates).toContainEqual(expect.objectContaining({
        projectId: 'p1',
        update: expect.objectContaining({ 
            activeCrisis: expect.objectContaining({ description: 'Director dispute!' })
        })
    }));
    expect(impact.uiNotifications).toContain('Director is unhappy!');
  });
});

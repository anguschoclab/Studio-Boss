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
        projects: [],
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
      talentPool: [],
      newsHistory: []
    },
    culture: { genrePopularity: {} },
    finance: { bankBalance: 1000000, yearToDateRevenue: 0, yearToDateExpenses: 0 },
    history: []
  });

  const getInitialWeeklyChanges = () => ({
    projectUpdates: [],
    events: [],
    newHeadlines: [],
    costs: 0,
    revenue: 0,
    newsEvents: []
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
    state.studio.internal.projects = [crisisProject];

    const changes = getInitialWeeklyChanges();
    const result = processProduction(state, changes);

    expect(Object.values(result.studio.internal.projects)[0].id).toBe('p1');
    expect(advanceProject).not.toHaveBeenCalled();
    expect(changes.projectUpdates).toContain('"Project p1" production is halted until the active crisis is resolved.');
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
    vi.mocked(checkAndTriggerCrisis).mockReturnValue(null);
    vi.mocked(processDirectorDisputes).mockReturnValue({ newCrises: [], updates: [] });
    vi.mocked(calculateBoxOfficeRanks).mockReturnValue(new Map());

    const changes = getInitialWeeklyChanges();
    const result = processProduction(state, changes);

    expect(Object.values(result.studio.internal.projects)[0].status).toBe('marketing');
    expect(changes.projectUpdates).toContain('Project advanced to marketing');
    expect(changes.newsEvents.some(ne => ne.type === 'STUDIO_EVENT' && ne.headline === 'Project p1 Wraps Production')).toBeTruthy();
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

    const changes = getInitialWeeklyChanges();
    const result = processProduction(state, changes);

    const releasedProject = Object.values(result.studio.internal.projects)[0];
    expect(releasedProject.status).toBe('released');
    expect(releasedProject.awardsProfile).toBeDefined();
    expect(releasedProject.boxOfficeRank).toBe(1);
    expect(changes.newsEvents.some(ne => ne.type === 'RELEASE')).toBeTruthy();
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
      description: 'Star got a haircut!', options: [], resolved: false, severity: 'medium'
    });
    vi.mocked(processDirectorDisputes).mockReturnValue({ newCrises: [], updates: [] });
    vi.mocked(calculateBoxOfficeRanks).mockReturnValue(new Map());

    const changes = getInitialWeeklyChanges();
    const result = processProduction(state, changes);

    expect(Object.values(result.studio.internal.projects)[0].activeCrisis).toBeDefined();
    expect(changes.events).toContain('CRISIS: "Project p1" - Star got a haircut!');
  });

  it('updates talent correctly through advanceProject return', () => {
     const state = getInitialState();
     const talent: TalentProfile = { id: 't1', name: 'Actor', roles: ['actor'], prestige: 50, fee: 1000, draw: 50, temperament: 'Normal', accessLevel: 'outsider' };
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

     const changes = getInitialWeeklyChanges();
     const result = processProduction(state, changes);

     expect(Object.values(result.industry.talentPool)[0].prestige).toBe(60);
  });


  it('computes average rival strength correctly', () => {
    const state = getInitialState();
    const project = createBaseProject('p1', 'production');
    state.studio.internal.projects = { [project.id]: project };
    state.industry.rivals = [
      { id: 'r1', name: 'Rival 1', strength: 60, marketShare: 10, cash: 1000, prestige: 50, recentReleases: [], strategies: [], activeFranchises: [] },
      { id: 'r2', name: 'Rival 2', strength: 40, marketShare: 10, cash: 1000, prestige: 50, recentReleases: [], strategies: [], activeFranchises: [] }
    ];

    vi.mocked(getTrendMultiplier).mockReturnValue(1.0);
    vi.mocked(advanceProject).mockReturnValue({
      project: { ...project, status: 'production' },
      update: '',
      talentUpdates: []
    });
    vi.mocked(checkAndTriggerCrisis).mockReturnValue(null);
    vi.mocked(processDirectorDisputes).mockReturnValue({ newCrises: [], updates: [] });
    vi.mocked(calculateBoxOfficeRanks).mockReturnValue(new Map());

    const changes = getInitialWeeklyChanges();
    const result = processProduction(state, changes);

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
    vi.mocked(checkAndTriggerCrisis).mockReturnValue(null);
    vi.mocked(processDirectorDisputes).mockReturnValue({
      newCrises: [{ crisis: { description: 'Director dispute!', options: [], resolved: false, severity: 'high' }, penalty: 0 }],
      updates: ['Director is unhappy!']
    });
    vi.mocked(calculateBoxOfficeRanks).mockReturnValue(new Map());

    const changes = getInitialWeeklyChanges();
    const result = processProduction(state, changes);

    expect(Object.values(result.studio.internal.projects)[0].activeCrisis).toBeDefined();
    expect(Object.values(result.studio.internal.projects)[0].activeCrisis?.description).toBe('Director dispute!');
    expect(changes.projectUpdates).toContain('Director is unhappy!');
  });

  it('triggers a new crisis when project has a resolved crisis', () => {
    const state = getInitialState();
    const project = createBaseProject('p1', 'production');
    project.activeCrisis = {
      description: 'Old crisis', options: [], resolved: true, severity: 'low'
    };
    state.studio.internal.projects = [project];

    vi.mocked(getTrendMultiplier).mockReturnValue(1.0);
    vi.mocked(advanceProject).mockReturnValue({
      project: { ...project },
      update: '',
      talentUpdates: []
    });
    vi.mocked(checkAndTriggerCrisis).mockReturnValue({
      description: 'New crisis!', options: [], resolved: false, severity: 'high'
    });
    vi.mocked(processDirectorDisputes).mockReturnValue({ newCrises: [], updates: [] });
    vi.mocked(calculateBoxOfficeRanks).mockReturnValue(new Map());

    const changes = getInitialWeeklyChanges();
    const result = processProduction(state, changes);

    expect(result.studio.internal.projects[0].activeCrisis).toBeDefined();
    expect(result.studio.internal.projects[0].activeCrisis?.description).toBe('New crisis!');
    expect(changes.events).toContain('CRISIS: "Project p1" - New crisis!');
  });

  it('does not trigger a new crisis when checkAndTriggerCrisis returns undefined', () => {
    const state = getInitialState();
    const project = createBaseProject('p1', 'production');
    state.studio.internal.projects = [project];

    vi.mocked(getTrendMultiplier).mockReturnValue(1.0);
    vi.mocked(advanceProject).mockReturnValue({
      project: { ...project },
      update: '',
      talentUpdates: []
    });
    vi.mocked(checkAndTriggerCrisis).mockReturnValue(undefined);
    vi.mocked(processDirectorDisputes).mockReturnValue({ newCrises: [], updates: [] });
    vi.mocked(calculateBoxOfficeRanks).mockReturnValue(new Map());

    const changes = getInitialWeeklyChanges();
    const result = processProduction(state, changes);

    expect(result.studio.internal.projects[0].activeCrisis).toBeUndefined();
    expect(changes.events.length).toBe(0);
  });

  it('processes industry awards without throwing errors', () => {
    const state = getInitialState();
    const project = createBaseProject('p1', 'production');
    state.studio.internal.projects = [project];
    state.industry.awards = [
      { id: 'a1', projectId: 'p1', year: 2024, category: 'Best Picture', recipientName: 'p1', awardName: 'Oscar' } as any
    ];

    vi.mocked(getTrendMultiplier).mockReturnValue(1.0);
    vi.mocked(advanceProject).mockReturnValue({
      project: { ...project },
      update: '',
      talentUpdates: []
    });
    vi.mocked(checkAndTriggerCrisis).mockReturnValue(undefined);
    vi.mocked(processDirectorDisputes).mockReturnValue({ newCrises: [], updates: [] });
    vi.mocked(calculateBoxOfficeRanks).mockReturnValue(new Map());

    const changes = getInitialWeeklyChanges();
    const result = processProduction(state, changes);

    expect(result.studio.internal.projects[0].id).toBe('p1');
  });
});

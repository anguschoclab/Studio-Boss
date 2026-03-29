import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processWorldEvents } from '../../../../engine/systems/processors/processWorldEvents';
import { GameState, RivalStudio } from '../../../../engine/types';

vi.mock('../../../../engine/systems/rivals', () => ({
  advanceRivals: vi.fn()
}));
vi.mock('../../../../engine/systems/buyers', () => ({
  updateBuyers: vi.fn()
}));
vi.mock('../../../../engine/systems/TalentSystem', () => ({
  TalentSystem: {
    advance: vi.fn()
  }
}));
vi.mock('../../../../engine/generators/headlines', () => ({
  generateHeadlines: vi.fn()
}));
vi.mock('../../../../engine/systems/awards', () => ({
  runAwardsCeremony: vi.fn(),
  processRazzies: vi.fn()
}));
vi.mock('../../../../engine/systems/trends', () => ({
  advanceTrends: vi.fn()
}));
vi.mock('../../../../engine/systems/marketEvents', () => ({
  advanceMarketEvents: vi.fn()
}));
vi.mock('../../../../engine/systems/rumors', () => ({
  advanceRumors: vi.fn()
}));
vi.mock('../../../../engine/systems/festivals', () => ({
  resolveFestivals: vi.fn()
}));
vi.mock('../../../../engine/systems/scandals', () => ({
  advanceScandals: vi.fn(),
  generateScandals: vi.fn()
}));

import { advanceRivals } from '../../../../engine/systems/rivals';
import { updateBuyers } from '../../../../engine/systems/buyers';
import { TalentSystem } from '../../../../engine/systems/TalentSystem';
import { generateHeadlines } from '../../../../engine/generators/headlines';
import { runAwardsCeremony, processRazzies } from '../../../../engine/systems/awards';
import { advanceTrends } from '../../../../engine/systems/trends';
import { advanceMarketEvents } from '../../../../engine/systems/marketEvents';
import { advanceRumors } from '../../../../engine/systems/rumors';
import { resolveFestivals } from '../../../../engine/systems/festivals';
import { advanceScandals, generateScandals } from '../../../../engine/systems/scandals';
import * as utils from '../../../../engine/utils';

describe('processWorldEvents', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    vi.mocked(advanceRivals).mockReturnValue({ updatedRivals: [], newsEvents: [] });
    vi.mocked(updateBuyers).mockReturnValue({ updatedBuyers: [], newHeadlines: [] });
    vi.mocked(TalentSystem.advance).mockReturnValue({ updatedOpportunities: [], events: [] });
    vi.mocked(generateHeadlines).mockReturnValue([]);
    vi.mocked(runAwardsCeremony).mockReturnValue({ projectUpdates: [], newsEvents: [], newAwards: [], prestigeChange: 0 });
    vi.mocked(advanceTrends).mockReturnValue([]);
    vi.mocked(advanceMarketEvents).mockImplementation((s) => s);
    vi.mocked(advanceRumors).mockImplementation((s) => s);
    vi.mocked(resolveFestivals).mockImplementation((s) => s);
    vi.mocked(advanceScandals).mockImplementation((s) => s);
    vi.mocked(generateScandals).mockReturnValue({ newScandals: [], projectUpdates: [], headlines: [] });
  });

  it('orchestrates subsystem advancements and collects updates correctly', () => {
    const state = getInitialState();
    const changes = getInitialWeeklyChanges();

    vi.mocked(advanceRivals).mockReturnValue({
      updatedRivals: [{ id: 'r1', name: 'Rival' } as RivalStudio],
      newsEvents: [{ type: 'RIVAL', headline: 'Rival Action', description: 'Desc' }]
    });
    vi.mocked(updateBuyers).mockReturnValue({
      updatedBuyers: [{ id: 'b1', name: 'Buyer', archetype: 'network' }],
      newHeadlines: ['Buyer changed mandate']
    });
    vi.mocked(generateHeadlines).mockReturnValue([{ id: 'h1', text: 'Gen headline', week: 2, category: 'general' }]);

    const result = processWorldEvents(state, changes);

    expect(result.industry.rivals).toHaveLength(1);
    expect(result.market.buyers).toHaveLength(1);
    expect(changes.newsEvents.some(ne => ne.headline === 'Rival Action')).toBeTruthy();
    expect(changes.newHeadlines.some(h => h.text === 'Buyer changed mandate')).toBeTruthy();
    expect(result.industry.headlines.some(h => h.text === 'Gen headline')).toBeTruthy();
  });

  it('runs awards ceremony and correctly accumulates new awards and prestige', () => {
    const state = getInitialState();
    const changes = getInitialWeeklyChanges();

    vi.mocked(runAwardsCeremony).mockReturnValue({
      projectUpdates: ['Won Best Picture!'],
      newsEvents: [{ type: 'AWARD', headline: 'Big Win!', description: 'Awesome.' }],
      newAwards: [{ id: 'a1', projectId: 'p1', name: 'Best Picture', category: 'Best Picture', body: 'Academy Awards', status: 'won', year: 2025 }],
      prestigeChange: 15
    });

    const result = processWorldEvents(state, changes);

    expect(result.studio.prestige).toBe(65);
    expect(result.industry.awards).toHaveLength(1);
    expect(changes.projectUpdates).toContain('Won Best Picture!');
    expect(changes.events.some(e => e.includes('Academy Awards'))).toBeTruthy();
    expect(changes.newsEvents.some(ne => ne.type === 'AWARD')).toBeTruthy();
  });

  it('triggers Razzie logic accurately on week 4', () => {
    const state = getInitialState();
    state.week = 3; // nextWeek will be 4
    state.studio.internal.projects = [{ id: 'p1', title: 'Terrible Film', format: 'film', genre: 'Action', budgetTier: 'low', budget: 100, weeklyCost: 10, targetAudience: 'Everyone', flavor: '', status: 'released', buzz: 0, weeksInPhase: 0, developmentWeeks: 0, productionWeeks: 0, revenue: 0, weeklyRevenue: 0, releaseWeek: null }];
    state.industry.talentPool = [{ id: 't1', name: 'Bad Actor', roles: ['actor'], prestige: 10, fee: 100, draw: 10, temperament: 'Normal', accessLevel: 'outsider' }];

    const changes = getInitialWeeklyChanges();

    vi.mocked(processRazzies).mockReturnValue({
      projectUpdates: ['A terrible film won.'],
      newHeadlines: [{ id: 'h1', text: 'Razzie!', week: 4, category: 'awards' }],
      newsEvents: [],
      studioPrestigePenalty: 10,
      cultClassicProjectIds: ['p1'],
      razzieWinnerTalentIds: ['t1']
    });

    const result = processWorldEvents(state, changes);

    expect(result.studio.prestige).toBe(40); // 50 - 10
    expect(result.studio.internal.projects[0].isCultClassic).toBe(true);
    expect(result.industry.talentPool[0].hasRazzie).toBe(true);
    // Project P1 gets a crisis because they won a razzie
    expect(result.studio.internal.projects[0].activeCrisis).toBeDefined();
    expect(changes.events.some(e => e.includes('CRISIS: "Terrible Film" - The Razzies have destroyed Bad Actor\'s ego'))).toBeTruthy();
  });

  it('handles random world events generation appropriately', () => {
      const state = getInitialState();
      const changes = getInitialWeeklyChanges();

      // Force Math.random to always hit < 0.2
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.1);

      processWorldEvents(state, changes);

      expect(changes.events.length).toBeGreaterThanOrEqual(2); // Two potential random events
      vi.restoreAllMocks();
  });

  it('generates and attaches scandals properly', () => {
     const state = getInitialState();
     const changes = getInitialWeeklyChanges();

     state.studio.internal.projects = [{ id: 'p1', title: 'Scandal Film', format: 'film', genre: 'Action', budgetTier: 'low', budget: 100, weeklyCost: 10, targetAudience: 'Everyone', flavor: '', status: 'production', buzz: 0, weeksInPhase: 0, developmentWeeks: 0, productionWeeks: 0, revenue: 0, weeklyRevenue: 0, releaseWeek: null }];

     vi.mocked(generateScandals).mockReturnValue({
         newScandals: [{ id: 's1', talentId: 't1', severity: 50, type: 'personal', weeksRemaining: 4 }],
         projectUpdates: [{ projectId: 'p1', crisis: { description: 'A bad scandal.', options: [], resolved: false, severity: 'medium' } }],
         headlines: [{ id: 'h1', text: 'SCANDAL!', week: 2, category: 'talent' }]
     });

     const result = processWorldEvents(state, changes);

     expect(result.industry.scandals).toHaveLength(1);
     expect(result.studio.internal.projects[0].activeCrisis?.description).toBe('A bad scandal.');
     expect(changes.newHeadlines.some(h => h.text === 'SCANDAL!')).toBeTruthy();
  });
});

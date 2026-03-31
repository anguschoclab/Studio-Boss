import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processWorldEvents } from '../../../../engine/systems/processors/processWorldEvents';
import { GameState, RivalStudio, MarketplaceTrend } from '../../../../engine/types';
import { StateImpact } from '../../../../engine/types/state.types';

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
        projects: {},
        contracts: [],
        financeHistory: []
      }
    },
    market: {
      opportunities: [],
      buyers: [],
      trends: []
    },
    industry: {
      rivals: [],
      headlines: [],
      families: [],
      agencies: [],
      agents: [],
      talentPool: {},
      newsHistory: [],
      scandals: []
    },
    culture: { genrePopularity: {} },
    finance: { bankBalance: 1000000, yearToDateRevenue: 0, yearToDateExpenses: 0 },
    history: []
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks returning StateImpact
    vi.mocked(advanceRivals).mockReturnValue({ rivalUpdates: [], newsEvents: [] });
    vi.mocked(updateBuyers).mockReturnValue({ buyerUpdates: [], newHeadlines: [] });
    vi.mocked(TalentSystem.advance).mockReturnValue({ newOpportunities: [], uiNotifications: [] });
    vi.mocked(generateHeadlines).mockReturnValue([]);
    vi.mocked(runAwardsCeremony).mockReturnValue({ projectUpdates: [], newsEvents: [], newAwards: [], prestigeChange: 0 });
    vi.mocked(processRazzies).mockReturnValue({});
    vi.mocked(advanceTrends).mockReturnValue({ newTrends: [] });
    vi.mocked(advanceMarketEvents).mockReturnValue({ newMarketEvents: [] });
    vi.mocked(advanceRumors).mockReturnValue({ newRumors: [] });
    vi.mocked(resolveFestivals).mockReturnValue({ projectUpdates: [] });
    vi.mocked(advanceScandals).mockReturnValue({ scandalUpdates: [] });
    vi.mocked(generateScandals).mockReturnValue({ newScandals: [], projectUpdates: [], newHeadlines: [] });
  });

  it('orchestrates subsystem advancements and aggregates impacts correctly', () => {
    const state = getInitialState();

    vi.mocked(advanceRivals).mockReturnValue({
      rivalUpdates: [{ rivalId: 'r1', update: { strength: 60 } }],
      newsEvents: [{ type: 'RIVAL', headline: 'Rival Action', description: 'Desc' }]
    });
    vi.mocked(updateBuyers).mockReturnValue({
      buyerUpdates: [{ buyerId: 'b1', update: { currentMandate: { type: 'sci-fi', activeUntilWeek: 10 } } }],
      newHeadlines: [{ category: 'market', text: 'Buyer changed mandate', week: 2 }]
    });
    vi.mocked(generateHeadlines).mockReturnValue([{ id: 'h1', text: 'Gen headline', week: 2, category: 'general' }]);

    const impact = processWorldEvents(state);

    expect(impact.rivalUpdates).toHaveLength(1);
    expect(impact.buyerUpdates).toHaveLength(1);
    expect(impact.newsEvents?.some(ne => ne.headline === 'Rival Action')).toBeTruthy();
    expect(impact.newHeadlines?.some(h => h.text === 'Buyer changed mandate')).toBeTruthy();
    expect(impact.newHeadlines?.some(h => h.text === 'Gen headline')).toBeTruthy();
  });

  it('collects awards ceremony and prestige results', () => {
    const state = getInitialState();

    vi.mocked(runAwardsCeremony).mockReturnValue({
      projectUpdates: [{ projectId: 'p1', update: { buzz: 100 } }],
      newsEvents: [{ type: 'AWARD', headline: 'Big Win!', description: 'Awesome.' }],
      newAwards: [{ id: 'a1', projectId: 'p1', name: 'Best Picture', category: 'Best Picture', body: 'Academy Awards', status: 'won', year: 2025 }],
      prestigeChange: 15
    });

    const impact = processWorldEvents(state);

    expect(impact.prestigeChange).toBe(15);
    expect(impact.newAwards).toHaveLength(1);
    expect(impact.projectUpdates).toContainEqual(expect.objectContaining({ projectId: 'p1' }));
    expect(impact.newsEvents?.some(ne => ne.type === 'AWARD')).toBeTruthy();
  });

  it('triggers Razzie logic on week 4', () => {
    const state = getInitialState();
    state.week = 3; // nextWeek will be 4

    vi.mocked(processRazzies).mockReturnValue({
      projectUpdates: [{ projectId: 'p1', update: { activeCrisis: { description: 'Razzie Crisis', resolved: false, severity: 'high', options: [] } } }],
      newHeadlines: [{ category: 'awards', text: 'Razzie!', week: 4 }],
      prestigeChange: -10,
      cultClassicProjectIds: ['p1'],
      razzieWinnerTalents: ['t1']
    });

    const impact = processWorldEvents(state);

    expect(impact.prestigeChange).toBe(-10);
    expect(impact.cultClassicProjectIds).toContain('p1');
    expect(impact.razzieWinnerTalents).toContain('t1');
    expect(impact.projectUpdates).toContainEqual(expect.objectContaining({ 
        projectId: 'p1',
        update: expect.objectContaining({ 
            activeCrisis: expect.objectContaining({ description: 'Razzie Crisis' }) 
        })
    }));
  });

  it('handles random world events generation', () => {
      const state = getInitialState();

      // Force Math.random to always hit < 0.2 twice
      vi.spyOn(utils, 'secureRandom').mockReturnValue(0.1);

      const impact = processWorldEvents(state);

      expect(impact.uiNotifications?.length).toBeGreaterThanOrEqual(2);
      vi.restoreAllMocks();
  });

  it('aggregates new scandals and their resulting crises', () => {
     const state = getInitialState();

     vi.mocked(generateScandals).mockReturnValue({
         newScandals: [{ id: 's1', talentId: 't1', severity: 50, type: 'personal', weeksRemaining: 4 }],
         projectUpdates: [{ projectId: 'p1', update: { activeCrisis: { description: 'A bad scandal.', options: [], resolved: false, severity: 'medium' } } }],
         newHeadlines: [{ text: 'SCANDAL!', week: 2, category: 'talent' }]
     });

     const impact = processWorldEvents(state);

     expect(impact.newScandals).toHaveLength(1);
     expect(impact.projectUpdates).toContainEqual(expect.objectContaining({ 
         projectId: 'p1',
         update: expect.objectContaining({ 
             activeCrisis: expect.objectContaining({ description: 'A bad scandal.' }) 
         })
     }));
     expect(impact.newHeadlines?.some(h => h.text === 'SCANDAL!')).toBeTruthy();
  });
});

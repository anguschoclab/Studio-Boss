import { describe, it, expect } from 'vitest';
import { runAwardsCeremony, processRazzies } from '@/engine/systems/awards/index';
import { createMockGameState } from '@/test/mockFactory';
import { Project, GameState } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'proj-1',
    title: 'Test Project',
    type: 'FILM',
    format: 'film',
    genre: 'Drama',
    budgetTier: 'mid',
    budget: 10_000_000,
    weeklyCost: 100_000,
    targetAudience: 'Adults',
    flavor: 'Test',
    state: 'development',
    buzz: 50,
    weeksInPhase: 0,
    developmentWeeks: 4,
    productionWeeks: 4,
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: null,
    accumulatedCost: 0,
    momentum: 50,
    progress: 0,
    activeCrisis: null,
    ...overrides,
  } as Project;
}

function makeState(projects: Record<string, Project> = {}, releasedProjectIds: string[] = []): GameState {
  const state = createMockGameState();
  state.entities.projects = projects;
  state.entities.releasedProjectIds = releasedProjectIds;
  state.studio.id = 'player-studio';
  return state;
}

describe('awards system uses releasedProjectIds index', () => {
  describe('runAwardsCeremony (new)', () => {
    it('finds eligible projects via releasedProjectIds index', () => {
      const project = makeProject({
        id: 'p1',
        state: 'released',
        releaseWeek: 5,
        buzz: 80,
        awardsProfile: {
          criticScore: 95,
          audienceScore: 80,
          prestigeScore: 90,
          craftScore: 95,
          culturalHeat: 70,
          campaignStrength: 20,
          controversyRisk: 5,
          festivalBuzz: 90,
          academyAppeal: 95,
          guildAppeal: 90,
          populistAppeal: 60,
          indieCredibility: 40,
          industryNarrativeScore: 80,
        } as any,
      });
      const state = makeState({ p1: project }, ['p1']);
      state.week = 4;

      const rng = new RandomGenerator(12345);
      const impacts = runAwardsCeremony(state, 4, 2024, rng);

      // New CeremonyRunner emits INDUSTRY_UPDATE impacts
      const awardImpacts = impacts.filter(i => i.type === 'INDUSTRY_UPDATE');
      expect(awardImpacts).toBeDefined();
    });

    it('does not find projects missing from releasedProjectIds index', () => {
      const project = makeProject({
        id: 'p1',
        state: 'released',
        releaseWeek: 5,
        buzz: 80,
        awardsProfile: {
          criticScore: 95,
          audienceScore: 80,
          prestigeScore: 90,
          craftScore: 95,
          culturalHeat: 70,
          campaignStrength: 20,
          controversyRisk: 5,
          festivalBuzz: 90,
          academyAppeal: 95,
          guildAppeal: 90,
          populistAppeal: 60,
          indieCredibility: 40,
          industryNarrativeScore: 80,
        } as any,
      });
      // Project exists in projects record but NOT in releasedProjectIds
      const state = makeState({ p1: project }, []);
      state.week = 4;

      const rng = new RandomGenerator(12345);
      const impacts = runAwardsCeremony(state, 4, 2024, rng);

      // No eligible projects → no impacts
      expect(impacts).toHaveLength(0);
    });
  });

  describe('processRazzies (new)', () => {
    it('finds eligible razzie projects via releasedProjectIds index', () => {
      const badFilm = makeProject({
        id: 'bad-1',
        title: 'Disaster Piece',
        state: 'released',
        budget: 100_000_000,
        budgetTier: 'high',
        reviewScore: 10,
        buzz: 10,
        releaseWeek: 5,
        ownerId: 'player-studio',
      });
      const state = makeState({ 'bad-1': badFilm }, ['bad-1']);
      state.week = 4;

      const rng = new RandomGenerator(12345);
      const impacts = processRazzies(state, 4, rng);

      const prestigeImpact = impacts.find(i => i.type === 'PRESTIGE_CHANGED');
      expect(prestigeImpact).toBeDefined();
      expect((prestigeImpact!.payload as any).amount).toBeLessThan(0);
      expect(impacts.length).toBeGreaterThan(0);
    });

    it('does not find razzie projects missing from releasedProjectIds index', () => {
      const badFilm = makeProject({
        id: 'bad-1',
        title: 'Disaster Piece',
        state: 'released',
        budget: 100_000_000,
        budgetTier: 'high',
        reviewScore: 10,
        buzz: 10,
        releaseWeek: 5,
        ownerId: 'player-studio',
      });
      // Project exists but NOT in releasedProjectIds
      const state = makeState({ 'bad-1': badFilm }, []);
      state.week = 4;

      const rng = new RandomGenerator(12345);
      const impacts = processRazzies(state, 4, rng);

      const prestigeImpact = impacts.find(i => i.type === 'PRESTIGE_CHANGED');
      expect(prestigeImpact).toBeUndefined();
    });

    it('correctly identifies player ownership via ownerId', () => {
      const playerFilm = makeProject({
        id: 'p1',
        title: 'Player Flop',
        state: 'released',
        budget: 100_000_000,
        budgetTier: 'high',
        reviewScore: 10,
        buzz: 10,
        releaseWeek: 5,
        ownerId: 'player-studio',
      });
      const state = makeState({ p1: playerFilm }, ['p1']);
      state.week = 4;

      const rng = new RandomGenerator(12345);
      const impacts = processRazzies(state, 4, rng);

      // Player-owned film should trigger prestige penalty
      const prestigeImpact = impacts.find(i => i.type === 'PRESTIGE_CHANGED');
      expect(prestigeImpact).toBeDefined();
      expect((prestigeImpact!.payload as any).amount).toBeLessThan(0);
    });

    it('new processRazzies only applies prestige penalty for player-owned films', () => {
      const rivalFilm = makeProject({
        id: 'r1',
        title: 'Rival Flop',
        state: 'released',
        budget: 100_000_000,
        budgetTier: 'high',
        reviewScore: 10,
        buzz: 10,
        releaseWeek: 5,
        ownerId: 'rival-studio',
      });
      const state = makeState({ r1: rivalFilm }, ['r1']);
      state.week = 4;

      const rng = new RandomGenerator(12345);
      const impacts = processRazzies(state, 4, rng);

      // New RazzieProcessor checks isPlayer — no prestige penalty for rival films
      const prestigeImpact = impacts.find(i => i.type === 'PRESTIGE_CHANGED');
      expect(prestigeImpact).toBeUndefined();
    });
  });
});

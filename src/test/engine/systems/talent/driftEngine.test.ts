import { describe, it, expect } from 'vitest';
import { TalentDriftEngine, DEFAULT_DRIFT_CONFIG, ARCHETYPE_TRANSITIONS, PERSONALITY_TRANSITIONS, CAREER_TRAJECTORY_TRANSITIONS } from '@/engine/systems/talent/driftEngine';
import { Talent } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';

describe('TalentDriftEngine', () => {
  describe('ARCHETYPE_TRANSITIONS', () => {
    it('should have valid transitions for all actor archetypes', () => {
      expect(ARCHETYPE_TRANSITIONS.actor).toBeDefined();
      expect(Object.keys(ARCHETYPE_TRANSITIONS.actor).length).toBeGreaterThan(0);
    });

    it('should have valid transitions for all writer archetypes', () => {
      expect(ARCHETYPE_TRANSITIONS.writer).toBeDefined();
      expect(Object.keys(ARCHETYPE_TRANSITIONS.writer).length).toBeGreaterThan(0);
    });

    it('should have valid transitions for all producer archetypes', () => {
      expect(ARCHETYPE_TRANSITIONS.producer).toBeDefined();
      expect(Object.keys(ARCHETYPE_TRANSITIONS.producer).length).toBeGreaterThan(0);
    });

    it('should have valid transitions for all personality archetypes', () => {
      expect(ARCHETYPE_TRANSITIONS.personality).toBeDefined();
      expect(Object.keys(ARCHETYPE_TRANSITIONS.personality).length).toBeGreaterThan(0);
    });

    it('should have valid transitions for all director archetypes', () => {
      expect(ARCHETYPE_TRANSITIONS.director).toBeDefined();
      expect(Object.keys(ARCHETYPE_TRANSITIONS.director).length).toBeGreaterThan(0);
    });
  });

  describe('PERSONALITY_TRANSITIONS', () => {
    it('should have transitions for all personality traits', () => {
      expect(PERSONALITY_TRANSITIONS).toBeDefined();
      expect(Object.keys(PERSONALITY_TRANSITIONS).length).toBeGreaterThan(0);
    });

    it('should have at least one transition for each personality', () => {
      for (const [personality, transitions] of Object.entries(PERSONALITY_TRANSITIONS)) {
        expect(transitions).toBeDefined();
        expect(transitions.length).toBeGreaterThan(0);
      }
    });
  });

  describe('CAREER_TRAJECTORY_TRANSITIONS', () => {
    it('should have transitions for all career trajectories', () => {
      expect(CAREER_TRAJECTORY_TRANSITIONS).toBeDefined();
      expect(Object.keys(CAREER_TRAJECTORY_TRANSITIONS).length).toBeGreaterThan(0);
    });
  });

  describe('processDrift', () => {
    it('should return a drift result with all fields', () => {
      const talent: Talent = {
        id: 'test-talent-1',
        name: 'Test Talent',
        role: 'actor',
        roles: ['actor'],
        tier: 2,
        demographics: { gender: 'MALE', country: 'US', ethnicity: 'white', age: 35 },
        psychology: { ego: 50, mood: 50, scandalRisk: 50, synergyAffinities: [], synergyConflicts: [] },
        skills: { acting: 70, directing: 50, writing: 50, stardom: 60 },
        prestige: 60,
        draw: 65,
        fee: 1000000,
        momentum: 50,
        starMeter: 60,
        bio: 'Test talent',
        motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
        currentMotivation: 'NONE',
        motivationImpulse: 'NONE',
        commitments: [],
        fatigue: 0,
        preferredGenres: ['Drama'],
        actorArchetype: 'movie_star',
        personality: 'collaborative',
        careerTrajectory: 'peak',
        accessLevel: 'outsider' as any
      };

      const mockRng = new RandomGenerator(12345);

      const result = TalentDriftEngine.processDrift(talent, DEFAULT_DRIFT_CONFIG, mockRng);

      expect(result).toBeDefined();
      expect(result.archetypeChanged).toBeDefined();
      expect(result.personalityChanged).toBeDefined();
      expect(result.careerTrajectoryChanged).toBeDefined();
      expect(result.changes).toBeDefined();
    });

    it('should not change archetype when probability check fails', () => {
      const talent: Talent = {
        id: 'test-talent-2',
        name: 'Test Talent',
        role: 'actor',
        roles: ['actor'],
        tier: 2,
        demographics: { gender: 'MALE', country: 'US', ethnicity: 'white', age: 35 },
        psychology: { ego: 50, mood: 50, scandalRisk: 50, synergyAffinities: [], synergyConflicts: [] },
        skills: { acting: 70, directing: 50, writing: 50, stardom: 60 },
        prestige: 60,
        draw: 65,
        fee: 1000000,
        momentum: 50,
        starMeter: 60,
        bio: 'Test talent',
        motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
        currentMotivation: 'NONE',
        motivationImpulse: 'NONE',
        commitments: [],
        fatigue: 0,
        preferredGenres: ['Drama'],
        actorArchetype: 'movie_star',
        accessLevel: 'outsider' as any
      };

      const mockRng = new RandomGenerator(99999);

      const result = TalentDriftEngine.processDrift(talent, DEFAULT_DRIFT_CONFIG, mockRng);

      expect(result.archetypeChanged).toBe(false);
    });
  });

  describe('applyDriftChanges', () => {
    it('should apply archetype changes to actor', () => {
      const talent: Talent = {
        id: 'test-talent-3',
        name: 'Test Talent',
        role: 'actor',
        roles: ['actor'],
        tier: 2,
        demographics: { gender: 'MALE', country: 'US', ethnicity: 'white', age: 35 },
        psychology: { ego: 50, mood: 50, scandalRisk: 50, synergyAffinities: [], synergyConflicts: [] },
        skills: { acting: 70, directing: 50, writing: 50, stardom: 60 },
        prestige: 60,
        draw: 65,
        fee: 1000000,
        momentum: 50,
        starMeter: 60,
        bio: 'Test talent',
        motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
        currentMotivation: 'NONE',
        motivationImpulse: 'NONE',
        commitments: [],
        fatigue: 0,
        preferredGenres: ['Drama'],
        actorArchetype: 'movie_star',
        accessLevel: 'outsider' as any
      };

      const driftResult = {
        archetypeChanged: true,
        personalityChanged: false,
        careerTrajectoryChanged: false,
        changes: {
          oldArchetype: 'movie_star',
          newArchetype: 'tv_star'
        }
      };

      const updated = TalentDriftEngine.applyDriftChanges(talent, driftResult);

      expect(updated.actorArchetype).toBe('tv_star');
    });

    it('should apply personality changes', () => {
      const talent: Talent = {
        id: 'test-talent-4',
        name: 'Test Talent',
        role: 'actor',
        roles: ['actor'],
        tier: 2,
        demographics: { gender: 'MALE', country: 'US', ethnicity: 'white', age: 35 },
        psychology: { ego: 50, mood: 50, scandalRisk: 50, synergyAffinities: [], synergyConflicts: [] },
        skills: { acting: 70, directing: 50, writing: 50, stardom: 60 },
        prestige: 60,
        draw: 65,
        fee: 1000000,
        momentum: 50,
        starMeter: 60,
        bio: 'Test talent',
        motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
        currentMotivation: 'NONE',
        motivationImpulse: 'NONE',
        commitments: [],
        fatigue: 0,
        preferredGenres: ['Drama'],
        personality: 'collaborative',
        accessLevel: 'outsider' as any
      };

      const driftResult = {
        archetypeChanged: false,
        personalityChanged: true,
        careerTrajectoryChanged: false,
        changes: {
          oldPersonality: 'collaborative',
          newPersonality: 'pragmatic'
        }
      };

      const updated = TalentDriftEngine.applyDriftChanges(talent, driftResult);

      expect(updated.personality).toBe('pragmatic');
    });

    it('should apply career trajectory changes', () => {
      const talent: Talent = {
        id: 'test-talent-5',
        name: 'Test Talent',
        role: 'actor',
        roles: ['actor'],
        tier: 2,
        demographics: { gender: 'MALE', country: 'US', ethnicity: 'white', age: 35 },
        psychology: { ego: 50, mood: 50, scandalRisk: 50, synergyAffinities: [], synergyConflicts: [] },
        skills: { acting: 70, directing: 50, writing: 50, stardom: 60 },
        prestige: 60,
        draw: 65,
        fee: 1000000,
        momentum: 50,
        starMeter: 60,
        bio: 'Test talent',
        motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
        currentMotivation: 'NONE',
        motivationImpulse: 'NONE',
        commitments: [],
        fatigue: 0,
        preferredGenres: ['Drama'],
        careerTrajectory: 'peak',
        accessLevel: 'outsider' as any
      };

      const driftResult = {
        archetypeChanged: false,
        personalityChanged: false,
        careerTrajectoryChanged: true,
        changes: {
          oldCareerTrajectory: 'peak',
          newCareerTrajectory: 'declining'
        }
      };

      const updated = TalentDriftEngine.applyDriftChanges(talent, driftResult);

      expect(updated.careerTrajectory).toBe('declining');
    });
  });

  describe('processAllDrift', () => {
    it('should process drift for all talents', () => {
      const talents: Record<string, Talent> = {
        'talent-1': {
          id: 'talent-1',
          name: 'Talent 1',
          role: 'actor',
          roles: ['actor'],
          tier: 2,
          demographics: { gender: 'MALE', country: 'US', ethnicity: 'white', age: 35 },
          psychology: { ego: 50, mood: 50, scandalRisk: 50, synergyAffinities: [], synergyConflicts: [] },
          skills: { acting: 70, directing: 50, writing: 50, stardom: 60 },
          prestige: 60,
          draw: 65,
          fee: 1000000,
          momentum: 50,
          starMeter: 60,
          bio: 'Test talent',
          motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
          currentMotivation: 'NONE',
          motivationImpulse: 'NONE',
          commitments: [],
          fatigue: 0,
          preferredGenres: ['Drama'],
          actorArchetype: 'movie_star',
          accessLevel: 'outsider' as any
        },
        'talent-2': {
          id: 'talent-2',
          name: 'Talent 2',
          role: 'writer',
          roles: ['writer'],
          tier: 2,
          demographics: { gender: 'FEMALE', country: 'US', ethnicity: 'white', age: 40 },
          psychology: { ego: 50, mood: 50, scandalRisk: 50, synergyAffinities: [], synergyConflicts: [] },
          skills: { acting: 50, directing: 50, writing: 70, stardom: 60 },
          prestige: 60,
          draw: 65,
          fee: 1000000,
          momentum: 50,
          starMeter: 60,
          bio: 'Test talent',
          motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
          currentMotivation: 'NONE',
          motivationImpulse: 'NONE',
          commitments: [],
          fatigue: 0,
          preferredGenres: ['Drama'],
          writerArchetype: 'showrunner',
          accessLevel: 'outsider' as any
        }
      };

      const mockRng = new RandomGenerator(54321);

      const result = TalentDriftEngine.processAllDrift(talents, DEFAULT_DRIFT_CONFIG, mockRng);

      expect(result.updatedTalents).toBeDefined();
      expect(result.driftResults).toBeDefined();
      expect(Object.keys(result.updatedTalents).length).toBe(2);
    });
  });

  describe('Age-Based Archetype Transitions', () => {
    it('should transition kid_actor to young_adult when age > 22', () => {
      const talent: Talent = {
        id: 'kid-actor-1',
        name: 'Child Star',
        role: 'actor',
        roles: ['actor'],
        tier: 3,
        demographics: { gender: 'MALE', country: 'US', ethnicity: 'white', age: 23 },
        psychology: { ego: 50, mood: 50, scandalRisk: 50, synergyAffinities: [], synergyConflicts: [] },
        skills: { acting: 70, directing: 50, writing: 50, stardom: 60 },
        prestige: 60,
        draw: 65,
        fee: 1000000,
        momentum: 50,
        starMeter: 60,
        bio: 'Test talent',
        motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
        currentMotivation: 'NONE',
        motivationImpulse: 'NONE',
        commitments: [],
        fatigue: 0,
        preferredGenres: ['Drama'],
        actorArchetype: 'kid_actor',
        accessLevel: 'outsider' as any
      };

      const mockRng = new RandomGenerator(99999);

      const result = TalentDriftEngine.processDrift(talent, DEFAULT_DRIFT_CONFIG, mockRng);

      // Age-based transition should trigger
      expect(result.archetypeChanged).toBe(true);
      expect(result.changes.oldArchetype).toBe('kid_actor');
      expect(['young_adult', 'tv_star', 'character_actor']).toContain(result.changes.newArchetype);
    });

    it('should not transition kid_actor when age < 16', () => {
      const talent: Talent = {
        id: 'kid-actor-2',
        name: 'Child Star',
        role: 'actor',
        roles: ['actor'],
        tier: 3,
        demographics: { gender: 'MALE', country: 'US', ethnicity: 'white', age: 15 },
        psychology: { ego: 50, mood: 50, scandalRisk: 50, synergyAffinities: [], synergyConflicts: [] },
        skills: { acting: 70, directing: 50, writing: 50, stardom: 60 },
        prestige: 60,
        draw: 65,
        fee: 1000000,
        momentum: 50,
        starMeter: 60,
        bio: 'Test talent',
        motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
        currentMotivation: 'NONE',
        motivationImpulse: 'NONE',
        commitments: [],
        fatigue: 0,
        preferredGenres: ['Drama'],
        actorArchetype: 'kid_actor',
        accessLevel: 'outsider' as any
      };

      const mockRng = new RandomGenerator(99999);

      const result = TalentDriftEngine.processDrift(talent, DEFAULT_DRIFT_CONFIG, mockRng);

      // Too young for age-based transition
      expect(result.archetypeChanged).toBe(false);
    });

    it('should transition adult actor to veteran when age >= 50', () => {
      const talent: Talent = {
        id: 'veteran-actor-1',
        name: 'Veteran Actor',
        role: 'actor',
        roles: ['actor'],
        tier: 2,
        demographics: { gender: 'MALE', country: 'US', ethnicity: 'white', age: 55 },
        psychology: { ego: 50, mood: 50, scandalRisk: 50, synergyAffinities: [], synergyConflicts: [] },
        skills: { acting: 70, directing: 50, writing: 50, stardom: 60 },
        prestige: 60,
        draw: 65,
        fee: 1000000,
        momentum: 50,
        starMeter: 60,
        bio: 'Test talent',
        motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
        currentMotivation: 'NONE',
        motivationImpulse: 'NONE',
        commitments: [],
        fatigue: 0,
        preferredGenres: ['Drama'],
        actorArchetype: 'prestige_actor',
        accessLevel: 'outsider' as any
      };

      const mockRng = new RandomGenerator(99999);

      const result = TalentDriftEngine.processDrift(talent, DEFAULT_DRIFT_CONFIG, mockRng);

      // Age-based transition to veteran should trigger
      expect(result.archetypeChanged).toBe(true);
      expect(result.changes.newArchetype).toBe('veteran');
    });

    it('should only apply age-based transitions to actors', () => {
      const writer: Talent = {
        id: 'writer-1',
        name: 'Writer',
        role: 'writer',
        roles: ['writer'],
        tier: 2,
        demographics: { gender: 'MALE', country: 'US', ethnicity: 'white', age: 23 },
        psychology: { ego: 50, mood: 50, scandalRisk: 50, synergyAffinities: [], synergyConflicts: [] },
        skills: { acting: 50, directing: 50, writing: 70, stardom: 60 },
        prestige: 60,
        draw: 65,
        fee: 1000000,
        momentum: 50,
        starMeter: 60,
        bio: 'Test talent',
        motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
        currentMotivation: 'NONE',
        motivationImpulse: 'NONE',
        commitments: [],
        fatigue: 0,
        preferredGenres: ['Drama'],
        writerArchetype: 'showrunner',
        accessLevel: 'outsider' as any
      };

      const mockRng = new RandomGenerator(99999);

      const result = TalentDriftEngine.processDrift(writer, DEFAULT_DRIFT_CONFIG, mockRng);

      // Writers don't have age-based archetype transitions
      expect(result.archetypeChanged).toBe(false);
    });

    it('should respect enableAgeBasedTransitions config', () => {
      const talent: Talent = {
        id: 'kid-actor-3',
        name: 'Child Star',
        role: 'actor',
        roles: ['actor'],
        tier: 3,
        demographics: { gender: 'MALE', country: 'US', ethnicity: 'white', age: 23 },
        psychology: { ego: 50, mood: 50, scandalRisk: 50, synergyAffinities: [], synergyConflicts: [] },
        skills: { acting: 70, directing: 50, writing: 50, stardom: 60 },
        prestige: 60,
        draw: 65,
        fee: 1000000,
        momentum: 50,
        starMeter: 60,
        bio: 'Test talent',
        motivationProfile: { financial: 50, prestige: 50, legacy: 50, aggression: 50 },
        currentMotivation: 'NONE',
        motivationImpulse: 'NONE',
        commitments: [],
        fatigue: 0,
        preferredGenres: ['Drama'],
        actorArchetype: 'kid_actor',
        accessLevel: 'outsider' as any
      };

      const mockRng = new RandomGenerator(99999);
      const configDisabled = { ...DEFAULT_DRIFT_CONFIG, enableAgeBasedTransitions: false };

      const result = TalentDriftEngine.processDrift(talent, configDisabled, mockRng);

      // Age-based transitions should be disabled
      expect(result.archetypeChanged).toBe(false);
    });
  });
});

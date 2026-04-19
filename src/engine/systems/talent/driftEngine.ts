import { Talent, ActorArchetype, WriterArchetype, ProducerArchetype, PersonalityArchetype, DirectorArchetype, TalentPersonality, CareerTrajectory } from '../../types/talent.types';
import { ACTOR_ARCHETYPES, WRITER_ARCHETYPES, PRODUCER_ARCHETYPES, PERSONALITY_ARCHETYPES, PERSONALITY_TRAITS, generateCareerTrajectory } from '../../data/talentArchetypes';
import { RandomGenerator } from '../../utils/rng';

/**
 * Drift configuration for how archetypes and personalities can change over time
 */
export interface DriftConfig {
  archetypeDriftProbability: number; // 0-1: probability of archetype drift per week
  personalityDriftProbability: number; // 0-1: probability of personality trait drift per week
  careerTrajectoryDriftProbability: number; // 0-1: probability of career trajectory change per week
  driftIntensity: number; // 0-1: how dramatic the drift can be
  enableAgeBasedTransitions: boolean; // Whether to enable age-based archetype transitions
}

/**
 * Default drift configuration
 */
export const DEFAULT_DRIFT_CONFIG: DriftConfig = {
  archetypeDriftProbability: 0.02, // 2% chance per week
  personalityDriftProbability: 0.05, // 5% chance per week
  careerTrajectoryDriftProbability: 0.03, // 3% chance per week
  driftIntensity: 0.3, // Moderate drift intensity
  enableAgeBasedTransitions: true // Enable age-based archetype transitions
};

/**
 * Archetype transition matrix - defines which archetypes can transition to which
 * This represents realistic career evolution paths
 */
export const ARCHETYPE_TRANSITIONS: {
  actor: Record<ActorArchetype, ActorArchetype[]>;
  writer: Record<WriterArchetype, WriterArchetype[]>;
  producer: Record<ProducerArchetype, ProducerArchetype[]>;
  personality: Record<PersonalityArchetype, PersonalityArchetype[]>;
  director: Record<DirectorArchetype, DirectorArchetype[]>;
} = {
  actor: {
    movie_star: ['tv_star', 'prestige_actor', 'veteran'],
    tv_star: ['movie_star', 'character_actor', 'prestige_actor', 'veteran'],
    character_actor: ['prestige_actor', 'indie_darling', 'veteran'],
    action_hero: ['movie_star', 'prestige_actor', 'veteran'],
    comedy_star: ['tv_star', 'prestige_actor', 'veteran'],
    prestige_actor: ['movie_star', 'indie_darling', 'veteran'],
    indie_darling: ['prestige_actor', 'movie_star', 'veteran'],
    viral_sensation: ['tv_star', 'comedy_star', 'young_adult'],
    kid_actor: ['young_adult', 'tv_star', 'character_actor'],
    young_adult: ['movie_star', 'tv_star', 'character_actor', 'action_hero', 'comedy_star'],
    veteran: ['prestige_actor', 'character_actor']
  },
  writer: {
    showrunner: ['screenwriter', 'prestige_writer'],
    screenwriter: ['showrunner', 'script_doctor', 'prestige_writer'],
    script_doctor: ['screenwriter', 'prestige_writer'],
    novelist: ['prestige_writer', 'screenwriter'],
    comedy_writer: ['screenwriter', 'prestige_writer'],
    genre_specialist: ['prestige_writer', 'screenwriter'],
    prestige_writer: ['showrunner', 'screenwriter']
  },
  producer: {
    blockbuster_producer: ['studio_exec', 'creative_producer'],
    indie_producer: ['creative_producer', 'line_producer'],
    studio_exec: ['blockbuster_producer'],
    packager: ['studio_exec', 'creative_producer'],
    line_producer: ['indie_producer', 'creative_producer'],
    creative_producer: ['indie_producer', 'blockbuster_producer']
  },
  personality: {
    influencer: ['talk_show_host', 'legacy_personality'],
    reality_star: ['talk_show_host', 'influencer'],
    talk_show_host: ['legacy_personality', 'influencer'],
    news_anchor: ['legacy_personality'],
    viral_creator: ['influencer', 'talk_show_host'],
    legacy_personality: []
  },
  director: {
    auteur: ['visionary', 'journeyman'],
    journeyman: ['visionary', 'commercial_hack'],
    visionary: ['auteur', 'journeyman'],
    commercial_hack: ['journeyman']
  }
};

/**
 * Personality trait transition matrix
 */
export const PERSONALITY_TRANSITIONS: Record<TalentPersonality, TalentPersonality[]> = {
  perfectionist: ['collaborative', 'difficult'],
  collaborative: ['pragmatic', 'loyal'],
  difficult: ['charismatic', 'pragmatic'],
  charismatic: ['collaborative', 'ambitious'],
  method: ['artistic', 'difficult'],
  pragmatic: ['collaborative', 'commercial'],
  artistic: ['perfectionist', 'pragmatic'],
  commercial: ['ambitious', 'pragmatic'],
  loyal: ['collaborative', 'pragmatic'],
  ambitious: ['commercial', 'difficult']
};

/**
 * Career trajectory transitions
 */
export const CAREER_TRAJECTORY_TRANSITIONS: Record<CareerTrajectory, CareerTrajectory[]> = {
  rising: ['peak', 'peak'],
  peak: ['declining', 'resurgent'],
  declining: ['resurgent', 'declining'],
  resurgent: ['peak', 'peak']
};

/**
 * Drift result
 */
export interface DriftResult {
  archetypeChanged: boolean;
  personalityChanged: boolean;
  careerTrajectoryChanged: boolean;
  changes: {
    oldArchetype?: string;
    newArchetype?: string;
    oldPersonality?: string;
    newPersonality?: string;
    oldCareerTrajectory?: string;
    newCareerTrajectory?: string;
  };
}

/**
 * Talent Drift Engine
 * Handles the gradual evolution of talent personalities, archetypes, and career trajectories
 */
export class TalentDriftEngine {
  /**
   * Process drift for a single talent
   */
  static processDrift(
    talent: Talent,
    config: DriftConfig = DEFAULT_DRIFT_CONFIG,
    rng: RandomGenerator
  ): DriftResult {
    const result: DriftResult = {
      archetypeChanged: false,
      personalityChanged: false,
      careerTrajectoryChanged: false,
      changes: {}
    };

    // 0. Age-based archetype transitions (if enabled)
    if (config.enableAgeBasedTransitions && talent.role === 'actor') {
      const ageBasedChange = this.processAgeBasedArchetypeTransition(talent, rng);
      if (ageBasedChange) {
        result.archetypeChanged = true;
        result.changes.oldArchetype = ageBasedChange.old;
        result.changes.newArchetype = ageBasedChange.new;
        // Age-based transitions take priority, skip regular archetype drift
        return result;
      }
    }

    // 1. Archetype Drift
    if (rng.next() < config.archetypeDriftProbability) {
      const archetypeChange = this.driftArchetype(talent, config.driftIntensity, rng);
      if (archetypeChange) {
        result.archetypeChanged = true;
        result.changes.oldArchetype = archetypeChange.old;
        result.changes.newArchetype = archetypeChange.new;
      }
    }

    // 2. Personality Trait Drift
    if (rng.next() < config.personalityDriftProbability && talent.personality) {
      const personalityChange = this.driftPersonality(talent.personality, config.driftIntensity, rng);
      if (personalityChange) {
        result.personalityChanged = true;
        result.changes.oldPersonality = personalityChange.old;
        result.changes.newPersonality = personalityChange.new;
      }
    }

    // 3. Career Trajectory Drift
    if (rng.next() < config.careerTrajectoryDriftProbability) {
      const trajectoryChange = this.driftCareerTrajectory(talent, config.driftIntensity, rng);
      if (trajectoryChange) {
        result.careerTrajectoryChanged = true;
        result.changes.oldCareerTrajectory = trajectoryChange.old;
        result.changes.newCareerTrajectory = trajectoryChange.new;
      }
    }

    return result;
  }

  /**
   * Process age-based archetype transitions for actors
   * This handles transitions like kid_actor -> young_adult -> veteran
   */
  private static processAgeBasedArchetypeTransition(
    talent: Talent,
    rng: RandomGenerator
  ): { old: string; new: string } | null {
    if (!talent.actorArchetype || !talent.demographics.age) {
      return null;
    }

    const age = talent.demographics.age;
    const currentArchetype = talent.actorArchetype;

    // Age-based transition rules
    const ageTransitions: Record<string, { minAge: number; maxAge: number; newArchetypes: ActorArchetype[] }> = {
      kid_actor: {
        minAge: 16,
        maxAge: 22,
        newArchetypes: ['young_adult', 'tv_star', 'character_actor']
      },
      young_adult: {
        minAge: 23,
        maxAge: 30,
        newArchetypes: ['movie_star', 'tv_star', 'character_actor', 'action_hero', 'comedy_star']
      }
    };

    // Check if current archetype has age-based transitions
    const transitionRule = ageTransitions[currentArchetype];
    if (!transitionRule) {
      // Check if talent is old enough to become a veteran
      if (age >= 50 && currentArchetype !== 'veteran') {
        const veteranTransitions: string[] = ARCHETYPE_TRANSITIONS.actor.veteran;
        if (veteranTransitions.includes(currentArchetype)) {
          return { old: currentArchetype, new: 'veteran' };
        }
      }
      return null;
    }

    // Check if talent is in the age transition window
    if (age < transitionRule.minAge) {
      return null; // Too young for transition
    }

    if (age > transitionRule.maxAge) {
      // Force transition if past max age
      const newArchetype = rng.pick(transitionRule.newArchetypes);
      return { old: currentArchetype, new: newArchetype };
    }

    // In transition window - probabilistic transition
    // Higher probability as age increases within the window
    const ageProgress = (age - transitionRule.minAge) / (transitionRule.maxAge - transitionRule.minAge);
    const transitionProbability = 0.3 + (ageProgress * 0.4); // 30% to 70% based on age progress

    if (rng.next() < transitionProbability) {
      const newArchetype = rng.pick(transitionRule.newArchetypes);
      return { old: currentArchetype, new: newArchetype };
    }

    return null;
  }

  /**
   * Drift archetype based on role and current archetype
   */
  private static driftArchetype(
    talent: Talent,
    intensity: number,
    rng: RandomGenerator
  ): { old: string; new: string } | null {
    let currentArchetype: string | undefined;
    let transitions: string[] | undefined;

    if (talent.actorArchetype) {
      currentArchetype = talent.actorArchetype;
      transitions = ARCHETYPE_TRANSITIONS.actor[talent.actorArchetype as ActorArchetype];
    } else if (talent.writerArchetype) {
      currentArchetype = talent.writerArchetype;
      transitions = ARCHETYPE_TRANSITIONS.writer[talent.writerArchetype as WriterArchetype];
    } else if (talent.producerArchetype) {
      currentArchetype = talent.producerArchetype;
      transitions = ARCHETYPE_TRANSITIONS.producer[talent.producerArchetype as ProducerArchetype];
    } else if (talent.personalityArchetype) {
      currentArchetype = talent.personalityArchetype;
      transitions = ARCHETYPE_TRANSITIONS.personality[talent.personalityArchetype as PersonalityArchetype];
    } else if (talent.directorArchetype) {
      currentArchetype = talent.directorArchetype;
      transitions = ARCHETYPE_TRANSITIONS.director[talent.directorArchetype];
    }

    if (!currentArchetype || !transitions || transitions.length === 0) {
      return null;
    }

    // Filter out invalid transitions
    const validTransitions = transitions;
    if (validTransitions.length === 0) return null;

    // Select new archetype based on intensity
    // Higher intensity = more likely to change
    if (rng.next() > intensity) {
      return null;
    }

    const newArchetype = rng.pick(validTransitions);
    return { old: currentArchetype, new: newArchetype };
  }

  /**
   * Drift personality trait
   */
  private static driftPersonality(
    currentPersonality: TalentPersonality,
    intensity: number,
    rng: RandomGenerator
  ): { old: string; new: string } | null {
    const transitions = PERSONALITY_TRANSITIONS[currentPersonality];
    if (!transitions || transitions.length === 0) {
      return null;
    }

    // Higher intensity = more likely to change
    if (rng.next() > intensity) {
      return null;
    }

    const newPersonality = rng.pick(transitions);
    return { old: currentPersonality, new: newPersonality };
  }

  /**
   * Drift career trajectory
   */
  private static driftCareerTrajectory(
    talent: Talent,
    intensity: number,
    rng: RandomGenerator
  ): { old: string; new: string } | null {
    const currentTrajectory = talent.careerTrajectory || 'rising';
    const transitions = CAREER_TRAJECTORY_TRANSITIONS[currentTrajectory];
    if (!transitions || transitions.length === 0) {
      return null;
    }

    // Career trajectory drift is influenced by talent tier and recent performance
    const performanceFactor = this.calculatePerformanceFactor(talent);
    const effectiveIntensity = intensity * performanceFactor;

    if (rng.next() > effectiveIntensity) {
      return null;
    }

    const newTrajectory = rng.pick(transitions);
    return { old: currentTrajectory, new: newTrajectory };
  }

  /**
   * Calculate performance factor based on recent talent performance
   * Used to influence career trajectory drift
   */
  private static calculatePerformanceFactor(talent: Talent): number {
    let factor = 1.0;

    // Momentum affects trajectory
    if (talent.momentum > 70) {
      factor *= 1.2; // More likely to move to 'peak'
    } else if (talent.momentum < 30) {
      factor *= 0.8; // More likely to move to 'declining'
    }

    // Tier affects trajectory
    if (talent.tier === 1) {
      factor *= 0.9; // Tier 1 talents are more stable
    } else if (talent.tier === 4) {
      factor *= 1.1; // Tier 4 talents are more volatile
    }

    // Prestige affects trajectory
    if (talent.prestige > 80) {
      factor *= 1.1;
    } else if (talent.prestige < 30) {
      factor *= 0.9;
    }

    return Math.min(2.0, Math.max(0.5, factor));
  }

  /**
   * Apply drift changes to a talent
   */
  static applyDriftChanges(talent: Talent, driftResult: DriftResult): Talent {
    const updated = { ...talent };

    if (driftResult.changes.newArchetype) {
      const newVal = driftResult.changes.newArchetype;
      if (talent.role === 'actor') {
        updated.actorArchetype = newVal as ActorArchetype;
      } else if (talent.role === 'writer' || talent.role === 'showrunner') {
        updated.writerArchetype = newVal as WriterArchetype;
      } else if (talent.role === 'producer') {
        updated.producerArchetype = newVal as ProducerArchetype;
      } else if (talent.role === 'personality') {
        updated.personalityArchetype = newVal as PersonalityArchetype;
      } else if (talent.role === 'director') {
        updated.directorArchetype = newVal as DirectorArchetype;
      }
    }

    if (driftResult.changes.newPersonality) {
      updated.personality = driftResult.changes.newPersonality as TalentPersonality;
    }

    if (driftResult.changes.newCareerTrajectory) {
      updated.careerTrajectory = driftResult.changes.newCareerTrajectory as CareerTrajectory;
    }

    return updated;
  }

  /**
   * Process drift for all talents in a game state
   */
  static processAllDrift(
    talents: Record<string, Talent>,
    config: DriftConfig = DEFAULT_DRIFT_CONFIG,
    rng: RandomGenerator
  ): { updatedTalents: Record<string, Talent>; driftResults: Record<string, DriftResult> } {
    const updatedTalents: Record<string, Talent> = { ...talents };
    const driftResults: Record<string, DriftResult> = {};

    for (const [id, talent] of Object.entries(talents)) {
      const driftResult = this.processDrift(talent, config, rng);
      if (driftResult.archetypeChanged || driftResult.personalityChanged || driftResult.careerTrajectoryChanged) {
        updatedTalents[id] = this.applyDriftChanges(talent, driftResult);
        driftResults[id] = driftResult;
      }
    }

    return { updatedTalents, driftResults };
  }
}

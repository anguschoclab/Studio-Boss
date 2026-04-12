import { Talent, TalentRole, TalentTier, DirectorArchetype } from '../types/talent.types';
import { generateArchetypeForRole, generatePersonalityTrait, generateCareerTrajectory } from '../data/talentArchetypes';

/**
 * Simple random number generator interface for migration
 */
interface RNG {
  next: () => number;
}

/**
 * Seeded random number generator for deterministic migration
 */
class SeededRNG implements RNG {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

/**
 * Migrate a single talent to have archetypes and personality traits
 * This ensures backward compatibility for existing save files
 */
export function migrateTalent(talent: Talent, seed?: number): Talent {
  const rng = seed ? new SeededRNG(seed) : { next: () => Math.random() };
  
  // Generate archetypes if not already set
  const migrated = { ...talent };
  
  // Only set archetypes if they don't already exist
  if (!migrated.actorArchetype && (migrated.role === 'actor' || migrated.roles.includes('actor'))) {
    migrated.actorArchetype = generateArchetypeForRole('actor', migrated.tier, rng) as any;
  }
  
  if (!migrated.writerArchetype && (migrated.role === 'writer' || migrated.role === 'showrunner' || migrated.roles.includes('writer') || migrated.roles.includes('showrunner'))) {
    migrated.writerArchetype = generateArchetypeForRole('writer', migrated.tier, rng) as any;
  }
  
  if (!migrated.producerArchetype && (migrated.role === 'producer' || migrated.roles.includes('producer'))) {
    migrated.producerArchetype = generateArchetypeForRole('producer', migrated.tier, rng) as any;
  }
  
  if (!migrated.personalityArchetype && (migrated.role === 'personality' || migrated.roles.includes('personality'))) {
    migrated.personalityArchetype = generateArchetypeForRole('personality', migrated.tier, rng) as any;
  }
  
  // Set directorArchetype if not already set (using existing system)
  if (!migrated.directorArchetype && (migrated.role === 'director' || migrated.roles.includes('director'))) {
    const directorArchetypes: DirectorArchetype[] = ['auteur', 'journeyman', 'visionary', 'commercial_hack'];
    const tierBias = migrated.tier === 1 ? ['auteur', 'visionary'] : migrated.tier === 2 ? ['auteur', 'visionary', 'journeyman'] : ['journeyman', 'commercial_hack'];
    const availableArchetypes = directorArchetypes.filter(a => tierBias.includes(a));
    migrated.directorArchetype = availableArchetypes[Math.floor(rng.next() * availableArchetypes.length)] || 'journeyman';
  }
  
  // Set universal personality trait if not already set
  if (!migrated.personality) {
    migrated.personality = generatePersonalityTrait(rng);
  }
  
  // Set career trajectory if not already set
  if (!migrated.careerTrajectory) {
    migrated.careerTrajectory = generateCareerTrajectory(migrated.tier);
  }
  
  return migrated;
}

/**
 * Migrate all talents in a talent pool
 */
export function migrateTalentPool(talents: Talent[], seedBase?: number): Talent[] {
  return talents.map((talent, index) => {
    const seed = seedBase ? seedBase + index : undefined;
    return migrateTalent(talent, seed);
  });
}

/**
 * Migrate talents in a game state
 * This function is designed to be called during game initialization
 */
export function migrateGameTalents(talents: Record<string, Talent>, seedBase?: number): Record<string, Talent> {
  const migrated: Record<string, Talent> = {};
  
  for (const [id, talent] of Object.entries(talents)) {
    const seed = seedBase ? seedBase + id.length : undefined;
    migrated[id] = migrateTalent(talent, seed);
  }
  
  return migrated;
}

/**
 * Check if a talent needs migration
 */
export function talentNeedsMigration(talent: Talent): boolean {
  // Talent needs migration if it's missing any of the new fields
  return !talent.actorArchetype && 
         !talent.writerArchetype && 
         !talent.producerArchetype && 
         !talent.personalityArchetype && 
         !talent.personality && 
         !talent.careerTrajectory;
}

/**
 * Check if a talent pool needs migration
 */
export function talentPoolNeedsMigration(talents: Talent[]): boolean {
  return talents.some(talentNeedsMigration);
}

/**
 * Get migration statistics
 */
export function getMigrationStats(talents: Talent[]): {
  total: number;
  needsMigration: number;
  alreadyMigrated: number;
  byRole: Record<string, { total: number; needsMigration: number }>;
} {
  const stats = {
    total: talents.length,
    needsMigration: 0,
    alreadyMigrated: 0,
    byRole: {} as Record<string, { total: number; needsMigration: number }>
  };
  
  for (const talent of talents) {
    const needs = talentNeedsMigration(talent);
    
    if (needs) {
      stats.needsMigration++;
    } else {
      stats.alreadyMigrated++;
    }
    
    // Track by role
    const primaryRole = talent.role;
    if (!stats.byRole[primaryRole]) {
      stats.byRole[primaryRole] = { total: 0, needsMigration: 0 };
    }
    stats.byRole[primaryRole].total++;
    if (needs) {
      stats.byRole[primaryRole].needsMigration++;
    }
  }
  
  return stats;
}

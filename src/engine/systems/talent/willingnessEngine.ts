import { Talent, Project, GameState, CharacterArchetype, Contract } from '@/engine/types/index';
import { ACTOR_ARCHETYPES, WRITER_ARCHETYPES, PRODUCER_ARCHETYPES, PERSONALITY_ARCHETYPES, PERSONALITY_TRAITS } from '../../data/talentArchetypes';

/**
 * Studio Boss - Willingness Engine
 * Calculates the likelihood of a talent signing a contract.
 * Factors: Genre, Prestige, Finance, Directorial Influence, and Studio History.
 */

export interface WillingnessReport {
  score: number; // 0-100
  reasons: string[];
  finalVerdict: 'willing' | 'hesitant' | 'unwilling';
}

export function calculateWillingness(
  talent: Talent,
  project: Project,
  gameState: GameState,
  proposedRole?: CharacterArchetype
): WillingnessReport {
  let score = 60; // Baseline
  const reasons: string[] = [];

  // 1. Genre Affinity
  const isActionStar = talent.roles.includes('actor') && talent.draw > 70;
  const isPrestigeActor = talent.prestige > 80;

  if (project.genre === 'Action' && isActionStar) {
    score += 15;
    reasons.push(`${talent.name} is a proven action draw and loves the genre.`);
  } else if (project.genre === 'Drama' && isPrestigeActor) {
    score += 15;
    reasons.push(`${talent.name} is looking for prestige-driven material.`);
  } else if (project.genre === 'Horror' && isPrestigeActor && project.budgetTier === 'low') {
    score -= 25;
    reasons.push(`${talent.name} feels this "low-budget horror" is beneath their current prestige level.`);
  }

  // 🎭 The Method Actor Tuning: Auteur directors prioritize prestige over upfront cash, taking a pay cut for high-buzz projects but demanding a premium for low-buzz ones.
  const isAuteurDirector = talent.directorArchetype === 'auteur' || (talent.roles.includes('director') && talent.prestige > 80);

  // 2. Prestige Gap
  const prestigeDiff = project.buzz - talent.prestige;
  if (prestigeDiff > 20) {
    score += 10;
    reasons.push(`The high buzz around "${project.title}" is a major draw.`);
    if (isAuteurDirector) {
      score += 20;
      reasons.push(`${talent.name} considers this a guaranteed masterpiece.`);
    }
  } else if (prestigeDiff < -30) {
    score -= 20;
    reasons.push(`${talent.name} is hesitant about a project with such low industry heat.`);
    if (isAuteurDirector) {
      score -= 30;
      reasons.push(`${talent.name} refuses to tarnish their legacy with a low-buzz project.`);
    }
  }

  // 3. Financial Incentive (Fee vs Star Meter)
  const starMeter = talent.starMeter || 50;
  if (talent.fee > project.budget * 0.4) {
    // 🎭 The Method Actor Tuning: Auteur directors prioritize prestige over upfront cash, taking a pay cut for high-buzz projects but demanding a premium for low-buzz ones.
    if (isAuteurDirector && prestigeDiff > 10) {
      score += 10;
      reasons.push(`The fee is high, but ${talent.name} is willing to take a pay cut for a guaranteed masterpiece.`);
    } else if (isAuteurDirector && prestigeDiff < -10) {
      score -= 30;
      reasons.push(`${talent.name} demands a massive premium to work on such a low-buzz project.`);
    } else if (isAuteurDirector && prestigeDiff > 0) {
      score -= 5;
      reasons.push(`The fee is high, but ${talent.name} is willing to negotiate for the sake of the art.`);
    } else {
      score -= 15;
      reasons.push(`The talent's quote consumes ${Math.round((talent.fee / project.budget) * 100)}% of the production budget, causing friction.`);
    }
  }

  // 4. Script Heat
  const scriptHeat = 'scriptHeat' in project ? project.scriptHeat : 50;
  if (scriptHeat > 80) {
    score += 15;
    reasons.push(`The script is considered a "Must-Read" in town.`);
  } else if (scriptHeat < 30) {
    score -= 10;
    reasons.push(`Word of mouth on the current draft is lukewarm.`);
  }

  // 5. Studio Reputation
  const studioPrestige = gameState.studio.prestige;
  if (studioPrestige > 80) {
    score += 10;
    reasons.push(`Working with a prestigious studio like ${gameState.studio.name} is a career goal.`);
  } else if (studioPrestige < 30) {
    score -= 15;
    reasons.push(`${talent.name}'s team is wary of the studio's current market standing.`);
  }

  // 5b. Studio Infamy (Razzies & Bombs)
  const studioProjects = Object.values(gameState.entities.projects);
  const recentRazzie = studioProjects.some(p => 
    p.awards?.some(a => a.body === 'The Razzies' && a.status === 'won')
  );
  
  if (recentRazzie && talent.prestige > 70) {
    score -= 20;
    reasons.push(`${talent.name} is hesitant to work with a studio that recently took home a Razzie.`);
  }

  // 6. Directorial Influence (Check if a director is already attached)
  const contractsList = Object.values(gameState.entities.contracts || {});
  const directorContract = contractsList.find(
    (c: Contract) => c.projectId === project.id && gameState.entities.talents[c.talentId]?.roles.includes('director')
  );
  if (directorContract) {
    const director = gameState.entities.talents[directorContract.talentId];
    if (director && director.prestige > 80) {
      score += 20;
      reasons.push(`The chance to work with ${director.name} is a significant motivator.`);
    }
  }

  // 7. Psychology & Ego
  if (talent.psychology?.ego && talent.psychology.ego > 80) {
    score -= 10;
    reasons.push(`${talent.name} is being notoriously difficult during negotiations.`);
  }

  // 8. Personality Trait Influence
  if (talent.personality) {
    const personalityTrait = PERSONALITY_TRAITS[talent.personality];
    if (personalityTrait) {
      // Adjust based on personality negotiation modifier
      score += personalityTrait.negotiationModifier;
      if (personalityTrait.negotiationModifier > 0) {
        reasons.push(`${talent.name}'s ${talent.personality} nature makes them more open to this deal.`);
      } else if (personalityTrait.negotiationModifier < 0) {
        reasons.push(`${talent.name}'s ${talent.personality} nature makes them more cautious.`);
      }
    }
  }

  // 9. Archetype-Specific Preferences
  let archetypeConfig: any;
  if (talent.actorArchetype) {
    archetypeConfig = ACTOR_ARCHETYPES[talent.actorArchetype];
  } else if (talent.writerArchetype) {
    archetypeConfig = WRITER_ARCHETYPES[talent.writerArchetype];
  } else if (talent.producerArchetype) {
    archetypeConfig = PRODUCER_ARCHETYPES[talent.producerArchetype];
  } else if (talent.personalityArchetype) {
    archetypeConfig = PERSONALITY_ARCHETYPES[talent.personalityArchetype];
  }

  if (archetypeConfig) {
    // Check genre preferences
    if (archetypeConfig.genrePreferences && archetypeConfig.genrePreferences.includes(project.genre)) {
      score += 10;
      reasons.push(`${talent.name}'s archetype favors this genre.`);
    } else if (archetypeConfig.genreDislikes && archetypeConfig.genreDislikes.includes(project.genre)) {
      score -= 15;
      reasons.push(`${talent.name}'s archetype typically avoids this genre.`);
    }

    // Check budget tier preferences
    if (archetypeConfig.budgetPreferences) {
      const budgetMatch = archetypeConfig.budgetPreferences.includes(project.budgetTier);
      if (budgetMatch) {
        score += 5;
        reasons.push(`This budget tier aligns with ${talent.name}'s archetype preferences.`);
      }
    }
  }

  // Final Bound and Verdict
  const finalScore = Math.max(0, Math.min(100, score));
  let verdict: 'willing' | 'hesitant' | 'unwilling';

  if (finalScore >= 70) verdict = 'willing';
  else if (finalScore >= 40) verdict = 'hesitant';
  else verdict = 'unwilling';

  return {
    score: finalScore,
    reasons,
    finalVerdict: verdict
  };
}

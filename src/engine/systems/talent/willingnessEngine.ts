import { Talent, Project, GameState, CharacterArchetype } from '@/engine/types/index';

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

  // 2. Prestige Gap
  const prestigeDiff = project.buzz - talent.prestige;
  if (prestigeDiff > 20) {
    score += 10;
    reasons.push(`The high buzz around "${project.title}" is a major draw.`);
  } else if (prestigeDiff < -30) {
    score -= 20;
    reasons.push(`${talent.name} is hesitant about a project with such low industry heat.`);
  }

  // 3. Financial Incentive (Fee vs Star Meter)
  const starMeter = talent.starMeter || 50;
  if (talent.fee > project.budget * 0.4) {
    score -= 15;
    reasons.push(`The talent's quote consumes ${Math.round((talent.fee / project.budget) * 100)}% of the production budget, causing friction.`);
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
  const studioProjects = Object.values(gameState.studio.internal.projects);
  const recentRazzie = studioProjects.some(p => 
    p.awards?.some(a => a.body === 'The Razzies' && a.status === 'won')
  );
  
  if (recentRazzie && talent.prestige > 70) {
    score -= 20;
    reasons.push(`${talent.name} is hesitant to work with a studio that recently took home a Razzie.`);
  }

  // 6. Directorial Influence (Check if a director is already attached)
  // ⚡ Bolt: Consolidated O(N) array .some() and .find() into a single O(N) array .find() scan
  const directorContract = gameState.studio.internal.contracts.find(
    c => c.projectId === project.id && gameState.industry.talentPool[c.talentId]?.roles.includes('director')
  );
  if (directorContract) {
    const director = gameState.industry.talentPool[directorContract.talentId];
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

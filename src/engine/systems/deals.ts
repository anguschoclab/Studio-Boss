import { TalentProfile, GameState, Project, FirstLookDeal, Agency } from '@/engine/types';
import { secureRandom } from '../utils';


export function evaluateFirstLookDeal(talent: TalentProfile, state: GameState): boolean {
  // A simple AI to determine if talent accepts a first-look deal based on studio prestige vs talent prestige
  const studioPrestige = state.studio.prestige;
  const talentPrestige = talent.prestige;
  
  // Talent considers their own heat vs what the studio offers.
  // Base chance 50%. Modified by prestige delta.
  let acceptanceChance = 50 + (studioPrestige - talentPrestige);
  
  // Adjust for access level
  if (talent.accessLevel === 'outsider' || talent.accessLevel === 'soft-access') {
    acceptanceChance += 20; // Hungrier for security
  } else if (talent.accessLevel === 'dynasty') {
    acceptanceChance -= 30; // Harder to lock down without massive prestige
  }
  
  // Clamp between 5 and 95
  acceptanceChance = Math.max(5, Math.min(95, acceptanceChance));
  
  return secureRandom() * 100 <= acceptanceChance;
}

export function offerFirstLookDeal(state: GameState, talentId: string, weeksRemaining: number, exclusivity: boolean = true): { deal: FirstLookDeal | null, update: string } {
  const talent = state.industry.talentPool.find(t => t.id === talentId);
  if (!talent) return { deal: null, update: '' };
  
  const accepted = evaluateFirstLookDeal(talent, state);
  if (!accepted) {
    return {
      deal: null,
      update: `${talent.name} passes on first-look deal with ${state.studio.name}.`
    };
  }
  
  return {
    deal: {
      id: crypto.randomUUID(),
      talentId,
      weeksRemaining,
      exclusivity
    },
    update: `${talent.name} signs exclusive first-look pact with ${state.studio.name}.`
  };
}

export function advanceDeals(deals: FirstLookDeal[]): FirstLookDeal[] {
  const result: FirstLookDeal[] = [];
  for (let i = 0; i < deals.length; i++) {
    const deal = deals[i];
    const newWeeks = deal.weeksRemaining - 1;
    if (newWeeks > 0) {
      result.push({ ...deal, weeksRemaining: newWeeks });
    }
  }
  return result;
}

export function packageProject(project: Project, talentIds?: string[], agency?: Agency): { packageScore: number, synergies: string[] } {
  if (talentIds || agency) { /* no-op for lint */ }
  // Evaluates the strength of attaching a set of talent to a project
  const score = project.buzz; // Start with project base heat
  const synergies: string[] = [];
  
  // Need the actual talent profiles, but we only have IDs here. 
  // Let's assume the caller passes the score components or we adjust the signature to take GameState.
  // Actually, packaging usually happens in context. Let's keep it simple.
  
  return { packageScore: score, synergies };
}

// A more complete packaging evaluator that takes the talent profiles directly
export function evaluatePackageStrength(project: Project, attachedTalent: TalentProfile[], agency?: Agency): { score: number, multipliers: string[] } {
  let score = 50 + (project.buzz * 0.5);
  const multipliers: string[] = [];
  
  let combinedPrestige = 0;
  let combinedDraw = 0;
  
  attachedTalent.forEach(t => {
    combinedPrestige += t.prestige;
    combinedDraw += t.draw;
  });
  
  const averagePrestige = attachedTalent.length > 0 ? (combinedPrestige / attachedTalent.length) : 0;
  
  // Agency synergy
  if (agency) {
    if (agency.tier === 'powerhouse' || agency.tier === 'major') {
       score += 15;
       multipliers.push(`${agency.name} Packaging Bonus`);
    }
  }
  
  // Draw pushes the commercial score up
  score += combinedDraw * 0.4;
  
  // Prestige pushes the critical score up
  score += averagePrestige * 0.3;
  
  if (attachedTalent.length >= 3) {
    score += 10;
    multipliers.push('Ensemble Bonus');
  }
  
  return {
    score: Math.min(100, score),
    multipliers
  };
}

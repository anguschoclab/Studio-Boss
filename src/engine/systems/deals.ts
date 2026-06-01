import { Talent, GameState, Project, FirstLookDeal, Agency, StateImpact } from '@/engine/types';
import { rand } from '../utils';

const ACCESS_LEVEL_BONUSES: Record<string, number> = {
  'outsider': 20,
  'soft-access': 20,
  'dynasty': -30,
};

export function evaluateFirstLookDeal(talent: Talent, state: GameState): boolean {
  const studioPrestige = state.studio.prestige;
  const talentPrestige = talent.prestige;
  
  let acceptanceChance = 50 + (studioPrestige - talentPrestige);
  
  // Adjust for access level using Record map
  const bonus = ACCESS_LEVEL_BONUSES[talent.accessLevel || ''] || 0;
  acceptanceChance += bonus;
  
  acceptanceChance = Math.max(5, Math.min(95, acceptanceChance));
  return rand() * 100 <= acceptanceChance;
}

export function offerFirstLookDeal(state: GameState, talentId: string, weeksRemaining: number, exclusivity: boolean = true): StateImpact[] {
  const talent = state.entities?.talents?.[talentId];
  if (!talent) return [];
  
  const accepted = evaluateFirstLookDeal(talent, state);
  if (!accepted) {
    return [
      {
        type: 'NEWS_ADDED',
        payload: {
          headline: `${talent.name} passes on first-look deal`,
          description: `${talent.name} has declined a First-Look pact with ${state.studio.name}.`
        }
      }
    ];
  }
  
  return [
    {
      type: 'NEWS_ADDED',
      payload: {
        headline: `${talent.name} signs first-look pact`,
        description: `${talent.name} signs exclusive first-look pact with ${state.studio.name}.`
      }
    }
  ];
}

export function advanceDeals(deals: FirstLookDeal[]): StateImpact[] {
  let expiredCount = 0;
  for (let i = 0; i < deals.length; i++) {
    const deal = deals[i];
    if (deal.weeksRemaining - 1 <= 0) expiredCount++;
  }

  if (expiredCount > 0) {
    return [
      {
        type: 'NEWS_ADDED',
        payload: {
          headline: 'Deals Expired',
          description: `${expiredCount} first-look talent deal(s) expired this week.`
        }
      }
    ];
  }
  return [];
}

export function packageProject(project: Project, talentIds?: string[], agency?: Agency): { packageScore: number, synergies: string[] } {
  const score = project.buzz; 
  const synergies: string[] = [];
  return { packageScore: score, synergies };
}

export function evaluatePackageStrength(project: Project, attachedTalent: Talent[], agency?: Agency): { score: number, multipliers: string[] } {
  let score = 50 + (project.buzz * 0.5);
  const multipliers: string[] = [];
  
  let combinedPrestige = 0;
  let combinedDraw = 0;
  attachedTalent.forEach(t => {
    combinedPrestige += t.prestige;
    combinedDraw += t.draw;
  });
  
  const averagePrestige = attachedTalent.length > 0 ? (combinedPrestige / attachedTalent.length) : 0;
  
  if (agency && (agency.tier === 'powerhouse' || agency.tier === 'major')) {
    score += 15;
    multipliers.push(`${agency.name} Packaging Bonus`);
  }
  
  score += combinedDraw * 0.4;
  score += averagePrestige * 0.3;
  if (attachedTalent.length >= 3) {
    score += 10;
    multipliers.push('Ensemble Bonus');
  }
  
  return { score: Math.min(100, score), multipliers };
}

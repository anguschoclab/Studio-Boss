import { Talent, GameState, Project, FirstLookDeal, Agency, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';

export function evaluateFirstLookDeal(talent: Talent, state: GameState, rng: RandomGenerator): boolean {
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
  
  return rng.next() * 100 <= acceptanceChance;
}

export function offerFirstLookDeal(state: GameState, talentId: string, rng: RandomGenerator): StateImpact[] {
  const talent = state.industry.talentPool[talentId];
  if (!talent) return [];
  
  const accepted = evaluateFirstLookDeal(talent, state, rng);
  if (!accepted) {
    return [
      {
        newsEvents: [{
          id: rng.uuid('news'),
          week: state.week,
          type: 'RIVAL',
          headline: `${talent.name} passes on first-look deal`,
          description: `${talent.name} has declined a First-Look pact with ${state.studio.name}.`
        }]
      }
    ];
  }
  
  return [
    {
      newsEvents: [{
        id: rng.uuid('news'),
        week: state.week,
        type: 'RIVAL',
        headline: `${talent.name} signs first-look pact`,
        description: `${talent.name} signs exclusive first-look pact with ${state.studio.name}.`
      }]
    }
  ];
}

export function advanceDeals(deals: FirstLookDeal[], rng: RandomGenerator): StateImpact[] {
  let expiredCount = 0;
  
  for (let i = 0; i < deals.length; i++) {
    const deal = deals[i];
    const newWeeks = deal.weeksRemaining - 1;
    if (newWeeks <= 0) {
        expiredCount++;
    }
  }

  if (expiredCount > 0) {
      return [
        {
          newsEvents: [{
            id: rng.uuid('news'),
            week: -1, // Coordinator will fill this
            type: 'STUDIO_EVENT',
            headline: 'Deals Expired',
            description: `${expiredCount} first-look talent deal(s) expired this week.`
          }]
        }
      ];
  }

  return [];
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
  
  if (agency) {
    if (agency.tier === 'powerhouse' || agency.tier === 'major') {
       score += 15;
       multipliers.push(`${agency.name} Packaging Bonus`);
    }
  }
  
  score += combinedDraw * 0.4;
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


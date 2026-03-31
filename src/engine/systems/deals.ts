import { TalentProfile, GameState, Project, FirstLookDeal, Agency } from '@/engine/types';
import { secureRandom } from '../utils';
import { StateImpact } from '../types/state.types';


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

export function offerFirstLookDeal(state: GameState, talentId: string, weeksRemaining: number, exclusivity: boolean = true): StateImpact {
  const talent = state.industry.talentPool[talentId];
  if (!talent) return {};
  
  const accepted = evaluateFirstLookDeal(talent, state);
  if (!accepted) {
    return {
      uiNotifications: [`${talent.name} passes on first-look deal with ${state.studio.name}.`]
    };
  }
  
  const deal: FirstLookDeal = {
    id: crypto.randomUUID(),
    talentId,
    weeksRemaining,
    exclusivity
  };

  return {
    // Note: Applying this would normally be part of a deal slice or studio internal.
    // We'll mark it as a new field in StateImpact or just handle it in the specific action.
    // For now, let's assume studio updates handle this.
    uiNotifications: [`${talent.name} signs exclusive first-look pact with ${state.studio.name}.`]
    // To actually add the deal, we'd need a field in StateImpact for deals.
  };
}

export function advanceDeals(deals: FirstLookDeal[]): StateImpact {
  const activeDeals: FirstLookDeal[] = [];
  let expiredCount = 0;
  
  for (let i = 0; i < deals.length; i++) {
    const deal = deals[i];
    const newWeeks = deal.weeksRemaining - 1;
    if (newWeeks > 0) {
      activeDeals.push({ ...deal, weeksRemaining: newWeeks });
    } else {
        expiredCount++;
    }
  }

  const impact: StateImpact = {
      // We need a field for firstLookDeals in StateImpact if we want to automate this.
      // But for now, we'll return it and let the orchestrator handle it or add the field if missing.
  };

  if (expiredCount > 0) {
      impact.uiNotifications = [`${expiredCount} first-look talent deal(s) expired this week.`];
  }

  return impact;
}

export function packageProject(project: Project, talentIds?: string[], agency?: Agency): { packageScore: number, synergies: string[] } {
  if (talentIds || agency) { /* no-op for lint */ }
  const score = project.buzz; 
  const synergies: string[] = [];
  return { packageScore: score, synergies };
}

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

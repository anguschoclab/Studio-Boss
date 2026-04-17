import { Talent, Project, Contract, Award } from '@/engine/types';
import { clamp } from '../../utils';
import { applyAwardBoostsToTalent } from '../talentStats';

export function applyProjectResults(
  project: Project,
  contracts: Contract[],
  talentPool: Record<string, Talent> | Talent[],
  projectAwards: Award[] = []
): Talent[] {
  if (contracts.length === 0) return [];

  const isArray = Array.isArray(talentPool);
  const talentPoolMap = isArray ? new Map<string, Talent>() : null;
  if (isArray) {
    for (const t of (talentPool as Talent[])) {
      talentPoolMap!.set(t.id, t);
    }
  }

  const totalCost = project.budget + (project.marketingBudget || 0);
  const ROI = totalCost > 0 ? project.revenue / totalCost : 0;

  let drawChange = 0;
  let prestigeChange = 0;
  let feeMultiplier = 1.0;

  if (ROI > 4.0) { drawChange = 12; prestigeChange = 6; feeMultiplier = 1.6; }
  else if (ROI > 2.0) { drawChange = 6; prestigeChange = 3; feeMultiplier = 1.3; }
  else if (ROI > 1.0) { drawChange = 2; prestigeChange = 1; feeMultiplier = 1.1; }
  else if (ROI < 0.4) { drawChange = -12; prestigeChange = -6; feeMultiplier = 0.75; }
  else if (ROI < 0.8) { drawChange = -6; prestigeChange = -3; feeMultiplier = 0.85; }

  const updatedTalent: Talent[] = [];

  for (const contract of contracts) {
    const talent = talentPoolMap ? talentPoolMap.get(contract.talentId) : (talentPool as Record<string, Talent>)[contract.talentId];
    if (!talent) continue;

    let talentAwardsDrawBonus = 0;
    let talentAwardsPrestigeBonus = 0;
    let talentAwardsFeeMultiplier = 1.0;
    let talentAwardsEgoBoost = 0;

    for (const award of projectAwards) {
      const isDirector = talent.roles.includes('director');
      const isActor = talent.roles.includes('actor');
      const isWriter = talent.roles.includes('writer');

      let qualifiesForBonus;
      if (award.category.includes('Director')) { qualifiesForBonus = isDirector; }
      else if (award.category.includes('Actor') || award.category.includes('Actress') || award.category.includes('Ensemble')) { qualifiesForBonus = isActor; }
      else if (award.category.includes('Screenplay')) { qualifiesForBonus = isWriter; }
      else { qualifiesForBonus = true; }

      if (qualifiesForBonus) {
        const multiplier = (award.category.includes('Director') || award.category.includes('Actor') || award.category.includes('Actress') || award.category.includes('Screenplay')) ? 1.0 : 0.5;
        const isPrestige = ['Academy Awards', 'Primetime Emmys', 'Cannes Film Festival', 'Venice Film Festival'].includes(award.body);
        
        const boosts = applyAwardBoostsToTalent(talent, award, multiplier, isPrestige);

        talentAwardsPrestigeBonus += boosts.prestigeBoost;
        talentAwardsDrawBonus += boosts.drawBoost;

        talentAwardsFeeMultiplier += (boosts.feeMultiplier - 1.0);
        talentAwardsEgoBoost += boosts.egoBoost;
      }
    }

    const finalFeeMultiplier = feeMultiplier * talentAwardsFeeMultiplier;
    
    const newTalent = {
      ...talent,
      draw: clamp(talent.draw + drawChange + talentAwardsDrawBonus, 0, 100),
      prestige: clamp(talent.prestige + prestigeChange + talentAwardsPrestigeBonus, 0, 100),
      fee: Math.round(clamp(talent.fee * finalFeeMultiplier, 10000, 75000000)),
      psychology: {
        ...talent.psychology,
        ego: clamp((talent.psychology?.ego || 50) + talentAwardsEgoBoost, 0, 100)
      }
    };

    updatedTalent.push(newTalent);
  }

  return updatedTalent;
}

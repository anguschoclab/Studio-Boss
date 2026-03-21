import { Project, Contract, TalentProfile, Award } from '../types';
import { clamp } from '../utils';

export function updateTalentStats(project: Project, contracts: Contract[], talentPoolMap: Map<string, TalentProfile>, awards: Award[] = []) {
  if (contracts.length === 0) return;

  const ROI = project.revenue / project.budget;

  // Define success/failure bounds
  let drawChange = 0;
  let prestigeChange = 0;
  let feeMultiplier = 1.0;

  if (ROI > 3.0) {
    // Massive hit
    drawChange = 10;
    prestigeChange = 5;
    feeMultiplier = 1.5;
  } else if (ROI > 1.5) {
    // Solid success
    drawChange = 5;
    prestigeChange = 2;
    feeMultiplier = 1.2;
  } else if (ROI < 0.5) {
    // Bomb
    drawChange = -10;
    prestigeChange = -5;
    feeMultiplier = 0.8;
  } else if (ROI < 1.0) {
    // Disappointment
    drawChange = -5;
    prestigeChange = -2;
    feeMultiplier = 0.9;
  }


  const projectAwards = awards.filter(a => a.projectId === project.id);

  for (const contract of contracts) {
    const talent = talentPoolMap.get(contract.talentId);
    if (talent) {
      let talentAwardsDrawBonus = 0;
      let talentAwardsPrestigeBonus = 0;
      let talentAwardsFeeMultiplier = 1.0;

      for (const award of projectAwards) {
        // Determine if this talent qualifies for the specific award bonus based on their role
        let qualifiesForBonus;

        const isDirector = talent.roles.includes('director');
        const isActor = talent.roles.includes('actor');
        const isWriter = talent.roles.includes('writer');

        if (award.category.includes('Director')) {
          qualifiesForBonus = isDirector;
        } else if (award.category.includes('Actor') || award.category.includes('Actress') || award.category.includes('Ensemble')) {
          qualifiesForBonus = isActor;
        } else if (award.category.includes('Screenplay')) {
          qualifiesForBonus = isWriter;
        } else {
          // General project awards (Best Picture, Palme d'Or, etc) boost everyone
          qualifiesForBonus = true;
        }

        if (qualifiesForBonus) {
          let multiplier = 1.0;
          // General project awards provide a slightly diluted individual bonus compared to specific category wins
          if (!award.category.includes('Director') && !award.category.includes('Actor') && !award.category.includes('Actress') && !award.category.includes('Screenplay')) {
             multiplier = 0.5;
          }

          if (award.status === 'won') {
            if (award.body === 'Academy Awards' || award.body === 'Cannes Film Festival') {
              talentAwardsPrestigeBonus += 15 * multiplier;
              talentAwardsDrawBonus += 10 * multiplier;
              talentAwardsFeeMultiplier += 0.5 * multiplier;
            } else if (award.body === 'Sundance Film Festival' || award.body === 'Independent Spirit Awards') {
              talentAwardsPrestigeBonus += 10 * multiplier;
              talentAwardsDrawBonus += 5 * multiplier;
              talentAwardsFeeMultiplier += 0.2 * multiplier;
            } else {
              talentAwardsPrestigeBonus += 5 * multiplier;
              talentAwardsDrawBonus += 2 * multiplier;
              talentAwardsFeeMultiplier += 0.1 * multiplier;
            }
          } else if (award.status === 'nominated') {
            talentAwardsPrestigeBonus += 2 * multiplier;
            talentAwardsDrawBonus += 1 * multiplier;
            talentAwardsFeeMultiplier += 0.05 * multiplier;
          }
        }
      }

      const finalFeeMultiplier = feeMultiplier * talentAwardsFeeMultiplier;

      talent.draw = clamp(talent.draw + drawChange + talentAwardsDrawBonus, 0, 100);
      talent.prestige = clamp(talent.prestige + prestigeChange + talentAwardsPrestigeBonus, 0, 100);
      talent.fee = clamp(talent.fee * finalFeeMultiplier, 10000, 50000000);
    }
  }
}

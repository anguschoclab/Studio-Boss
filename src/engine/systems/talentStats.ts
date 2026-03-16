import { Project, Contract, TalentProfile } from '../types';
import { clamp } from '../utils';

export function updateTalentStats(project: Project, contracts: Contract[], talentPoolMap: Map<string, TalentProfile>) {
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


  for (const contract of contracts) {
    const talent = talentPoolMap.get(contract.talentId);
    if (talent) {
      talent.draw = clamp(talent.draw + drawChange, 0, 100);
      talent.prestige = clamp(talent.prestige + prestigeChange, 0, 100);
      talent.fee = Math.max(50000, Math.floor(talent.fee * feeMultiplier));
    }
  }
}

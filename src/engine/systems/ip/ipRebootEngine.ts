import { IPAsset, Project } from '../../types';

/**
 * Logic for "Rebooting" historical IP.
 * A rebooted project inherits a "Nostalgia Bonus" based on the original IP's success.
 */
export function applyRebootNostalgia(project: Project, sourceAsset: IPAsset): Project {
  // Nostalgia Factor: If the original was a massive hit (high baseValue), 
  // the reboot starts with a significant Buzz floor.
  // We scale this so a huge hit provides a +30 buzz bump.
  let nostalgiaBonus = Math.min(30, (sourceAsset.baseValue / 1000000) * 5);
  
  // 🌌 The Universe Builder: Cynical IP Retention. If a studio reboots a legacy IP
  // with a low-budget tier just to retain rights, the market punishes it severely.
  let reviewPenalty = 0;
  if (project.budgetTier === 'low') {
    nostalgiaBonus = -25;
    reviewPenalty = 15;
  }

  return {
    ...project,
    buzz: Math.min(100, Math.max(0, project.buzz + Math.floor(nostalgiaBonus))),
    reviewScore: project.reviewScore ? Math.max(1, project.reviewScore - reviewPenalty) : project.reviewScore,
    isSpinoff: true,
    parentProjectId: sourceAsset.originalProjectId,
    title: project.title || `Untitled ${sourceAsset.title} Reboot`
  };
}

import { IPAsset, Project } from '../../types';

/**
 * Logic for "Rebooting" historical IP.
 * A rebooted project inherits a "Nostalgia Bonus" based on the original IP's success.
 */
export function applyRebootNostalgia(project: Project, sourceAsset: IPAsset): Project {
  // Nostalgia Factor: If the original was a massive hit (high baseValue), 
  // the reboot starts with a significant Buzz floor.
  // We scale this so a huge hit provides a +30 buzz bump.
  const nostalgiaBonus = Math.min(30, (sourceAsset.baseValue / 1000000) * 5); 
  
  return {
    ...project,
    buzz: Math.min(100, project.buzz + Math.floor(nostalgiaBonus)),
    isSpinoff: true,
    parentProjectId: sourceAsset.originalProjectId,
    title: project.title || `Untitled ${sourceAsset.title} Reboot`
  };
}

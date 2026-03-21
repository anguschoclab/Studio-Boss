import { Project, GameState } from '../types';
import { FRANCHISE_FATIGUE_RISK } from '../data/genres';

export function exploitIP(sourceProject: Project, state?: GameState) {
  if (sourceProject.status !== 'released') {
    return null;
  }

  // Find all related projects to calculate fatigue
  let relatedProjectCount = 0;
  let recentCrossoverTarget: Project | null = null;

  if (state) {
    const rootId = sourceProject.parentProjectId || sourceProject.id;
    for (const p of state.projects) {
      if (p.id === rootId || p.parentProjectId === rootId) {
        relatedProjectCount++;
      }
      // Look for a crossover opportunity
      if (
        p.id !== sourceProject.id &&
        p.genre === sourceProject.genre &&
        p.status === 'released' &&
        p.revenue > p.budget * 2 &&
        Math.random() > 0.8
      ) {
        recentCrossoverTarget = p;
      }
    }
  }

  // Fatigue risk calculation
  const baseFatigueRisk = FRANCHISE_FATIGUE_RISK[sourceProject.genre] || 0.1;
  const saturationPenalty = relatedProjectCount * baseFatigueRisk * 10;

  const isFatigued = saturationPenalty > 30; // High saturation

  // Financial success check: revenue > budget * 1.5 (unless it's a desperate reboot attempt)
  if (sourceProject.revenue <= sourceProject.budget * 1.5 && !isFatigued) {
    return null;
  }

  // If the franchise is dead/fatigued and underperformed, there's a small chance to reboot
  if (isFatigued && sourceProject.revenue <= sourceProject.budget * 1.5) {
    if (Math.random() < 0.3) {
      return {
        title: `${sourceProject.title}: Reboot`,
        format: sourceProject.format,
        genre: sourceProject.genre,
        budgetTier: sourceProject.budgetTier,
        targetAudience: sourceProject.targetAudience,
        flavor: `A gritty, modern reboot of the classic ${sourceProject.genre} franchise. Will audiences forgive past mistakes?`,
        parentProjectId: sourceProject.id,
        isSpinoff: true,
        initialBuzzBonus: 5 - (saturationPenalty / 2), // Penalty for rebooting too soon
      };
    }
    return null; // Otherwise, the IP is dead for now
  }

  const rand = Math.random();
  let newTitle: string;
  let flavorText: string;
  let buzzBonus = 15 - saturationPenalty;

  if (recentCrossoverTarget && rand < 0.2) {
    // Crossover Event
    newTitle = `${sourceProject.title} vs ${recentCrossoverTarget.title}`;
    flavorText = `A massive crossover event combining two powerhouse ${sourceProject.genre} franchises.`;
    buzzBonus += 20; // Crossovers generate massive hype
  } else if (rand < 0.5) {
    // Direct Sequel
    const nextNumber = relatedProjectCount + 1;
    newTitle = `${sourceProject.title} ${nextNumber}`;
    flavorText = `The next highly anticipated chapter in the blockbuster ${sourceProject.title} franchise.`;
    buzzBonus += 10;
  } else if (rand < 0.8) {
    // Prequel
    newTitle = `${sourceProject.title}: Origins`;
    flavorText = `A prequel revealing the hidden history of the ${sourceProject.title} universe.`;
  } else {
    // Spinoff
    newTitle = `${sourceProject.title}: The Next Generation`;
    flavorText = `A spinoff expanding the universe of the hit ${sourceProject.format} ${sourceProject.title}.`;
  }

  // Minimum buzz bonus to prevent negative overflow unless completely saturated
  buzzBonus = Math.max(-10, buzzBonus);

  return {
    title: newTitle,
    format: sourceProject.format,
    genre: sourceProject.genre,
    budgetTier: sourceProject.budgetTier,
    targetAudience: sourceProject.targetAudience,
    flavor: flavorText,
    parentProjectId: sourceProject.id,
    isSpinoff: true,
    initialBuzzBonus: buzzBonus,
  };
}

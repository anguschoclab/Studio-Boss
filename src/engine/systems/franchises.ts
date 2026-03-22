import { Project, GameState } from '../types';
import { FRANCHISE_FATIGUE_RISK } from '../data/genres';

export function exploitIP(sourceProject: Project, state?: GameState) {
  if (sourceProject.status !== 'released') {
    return null;
  }

  // Find all related projects to calculate fatigue
  let relatedProjectCount = 0;
  let genreSaturationCount = 0;
  let recentCrossoverTarget: Project | null = null;
  let isLegacy = false;

  if (state) {
    const rootId = sourceProject.parentProjectId || sourceProject.id;
    for (const p of state.projects) {
      if (p.id === rootId || p.parentProjectId === rootId) {
        relatedProjectCount++;
      }

      // Calculate overall market genre saturation (recent releases)
      if (
        p.genre === sourceProject.genre &&
        p.status === 'released' &&
        p.releaseWeek &&
        state.week - p.releaseWeek <= 50
      ) {
        genreSaturationCount++;
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

    // Check if it's a legacy IP
    if (sourceProject.releaseWeek && state.week - sourceProject.releaseWeek > 150) {
        isLegacy = true;
    }
  }

  // Fatigue risk calculation
  const baseFatigueRisk = FRANCHISE_FATIGUE_RISK[sourceProject.genre] || 0.1;
  const exponentialSaturation = Math.pow(relatedProjectCount, 1.2); // Exponential decay for heavily saturated franchises
  // Factor in both the direct related projects and the general market saturation for this genre
  const saturationPenalty = (exponentialSaturation * baseFatigueRisk * 10) + (genreSaturationCount * (baseFatigueRisk / 2) * 5);

  const isFatigued = saturationPenalty > 35; // High saturation

  // Financial success check: revenue > budget * 1.5 (unless it's a desperate reboot attempt)
  if (sourceProject.revenue <= sourceProject.budget * 1.5 && !isFatigued) {
    return null;
  }

  const rand = Math.random();

  // If the franchise is dead/fatigued and underperformed, there's a chance to reboot or format flip
  if (isFatigued && sourceProject.revenue <= sourceProject.budget * 1.5) {
    if (rand < 0.3) {
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
    } else if (rand < 0.5 && sourceProject.format === 'film') {
        // Format flip: Film to TV to save the IP
        return {
          title: `${sourceProject.title}: The Series`,
          format: 'tv',
          tvFormat: 'prestige_drama',
          episodes: 8,
          releaseModel: 'weekly',
          genre: sourceProject.genre,
          budgetTier: 'high',
          targetAudience: sourceProject.targetAudience,
          flavor: `A high-budget TV adaptation attempting to breathe new life into the fatigued ${sourceProject.title} universe.`,
          parentProjectId: sourceProject.id,
          isSpinoff: true,
          initialBuzzBonus: 10 - (saturationPenalty / 3),
        };
    }
    return null; // Otherwise, the IP is dead for now
  }

  let newTitle: string;
  let flavorText: string;
  let buzzBonus = 15 - saturationPenalty;
  let newBudgetTier = sourceProject.budgetTier;

  if (recentCrossoverTarget && rand < 0.2) {
    // Cinematic Universe Event
    newTitle = `${sourceProject.title} vs ${recentCrossoverTarget.title}: Dawn of Justice`;
    flavorText = `A blockbuster Cinematic Universe event combining two powerhouse ${sourceProject.genre} franchises. Stakes have never been higher.`;
    buzzBonus += 30 - (genreSaturationCount * 2); // Crossovers generate massive hype, but suffer if the genre is saturated
    newBudgetTier = 'blockbuster'; // Crossovers are always huge events
  } else if (isLegacy && rand < 0.4) {
      // Legacy Sequel
      newTitle = `${sourceProject.title}: Legacy`;
      flavorText = `Decades later, the original cast returns to pass the torch to a new generation in this long-awaited continuation.`;
      buzzBonus += 25; // Massive nostalgia bump
      newBudgetTier = 'blockbuster';
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
    tvFormat: sourceProject.tvFormat,
    episodes: sourceProject.episodes,
    releaseModel: sourceProject.releaseModel,
    genre: sourceProject.genre,
    budgetTier: newBudgetTier,
    targetAudience: sourceProject.targetAudience,
    flavor: flavorText,
    parentProjectId: sourceProject.id,
    isSpinoff: true,
    initialBuzzBonus: buzzBonus,
  };
}

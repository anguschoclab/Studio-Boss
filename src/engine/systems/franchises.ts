import { Project, GameState } from '../types';
import { FRANCHISE_FATIGUE_RISK, CROSSOVER_AFFINITY } from '../data/genres';

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

      // Look for a crossover opportunity (same genre OR compatible genre)
      const isCompatibleCrossover = p.genre === sourceProject.genre ||
        (CROSSOVER_AFFINITY[sourceProject.genre] && CROSSOVER_AFFINITY[sourceProject.genre].includes(p.genre));

      if (
        p.id !== sourceProject.id &&
        isCompatibleCrossover &&
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
  let baseFatigueRisk = FRANCHISE_FATIGUE_RISK[sourceProject.genre] || 0.1;

  // Apply "Superhero Fatigue" (or general blockbuster fatigue) logic:
  // If the genre is heavily saturated, amplify the risk severely.
  if ((sourceProject.genre === 'Superhero' || sourceProject.genre === 'Action' || sourceProject.genre === 'Sci-Fi') && genreSaturationCount > 5) {
      baseFatigueRisk *= 1.5; // Steep fatigue curve
  }

  const exponentialSaturation = Math.pow(relatedProjectCount, 1.2); // Exponential decay for heavily saturated franchises
  // Factor in both the direct related projects and the general market saturation for this genre
  const saturationPenalty = (exponentialSaturation * baseFatigueRisk * 10) + (genreSaturationCount * (baseFatigueRisk / 2) * 5);

  const isFatigued = saturationPenalty > 35; // High saturation

  // IP Rights / Retention check: If it's a legacy IP with past related projects, we might rush something purely to keep rights
  const atRiskOfLosingRights = isLegacy && relatedProjectCount > 0 && sourceProject.revenue <= sourceProject.budget * 1.5;

  // Financial success check: revenue > budget * 1.5 (unless it's a desperate reboot attempt or a rights retention rush job)
  if (sourceProject.revenue <= sourceProject.budget * 1.5 && !isFatigued && !atRiskOfLosingRights) {
    return null;
  }

  const rand = Math.random();

  // If the franchise is dead/fatigued and underperformed, there's a chance to reboot, format flip, or deconstruct
  if (isFatigued && sourceProject.revenue <= sourceProject.budget * 1.5) {
    if (rand < 0.2) {
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
    } else if (rand < 0.4) {
      // Deconstructive Meta-Sequel
      return {
        title: `${sourceProject.title}: Resurrection`,
        format: sourceProject.format,
        genre: 'Comedy', // Often becomes a meta-comedy
        budgetTier: 'mid',
        targetAudience: 'Genre Fans',
        flavor: `A self-aware, fourth-wall-breaking installment that mocks the bloated history of the ${sourceProject.title} franchise.`,
        parentProjectId: sourceProject.id,
        isSpinoff: true,
        initialBuzzBonus: 10, // Meta-commentary tends to get initial positive buzz
      };
    } else if (rand < 0.6 && sourceProject.format === 'film') {
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

  if (atRiskOfLosingRights && rand < 0.5 && !isFatigued) {
    // IP Rights Retention Rush Job
    return {
      title: `${sourceProject.title}: The Untold Chapter`,
      format: sourceProject.format,
      genre: sourceProject.genre,
      budgetTier: 'low',
      targetAudience: sourceProject.targetAudience,
      flavor: `A hastily greenlit prequel rushed into production primarily to ensure the studio retains the ${sourceProject.title} IP rights.`,
      parentProjectId: sourceProject.id,
      isSpinoff: true,
      initialBuzzBonus: -5, // Audience sees through the rush job
    };
  }

  if (recentCrossoverTarget && rand < 0.2) {
    // Cinematic Universe Event
    newTitle = `${sourceProject.title} vs ${recentCrossoverTarget.title}: Dawn of Justice`;
    flavorText = `A blockbuster Cinematic Universe event combining two powerhouse franchises. Stakes have never been higher.`;
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

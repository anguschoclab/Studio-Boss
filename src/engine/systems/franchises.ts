import { Project, GameState } from '@/engine/types';
import { FRANCHISE_FATIGUE_RISK, CROSSOVER_AFFINITY } from '../data/genres';

interface StateCache {
  week: number;
  projectCount: number;
  relatedCounts: Map<string, number>;
  genreSaturationCounts: Map<string, number>;
  crossoverTargets: Map<string, Project[]>;
  universeProjectCount: number;
}

// ⚡ Bolt: Cache index to avoid O(N) traversal on every exploitIP call for the same state tick
const stateIndexes = new WeakMap<GameState, StateCache>();

export function exploitIP(sourceProject: Project, state?: GameState) {
  if (sourceProject.status !== 'released') {
    return null;
  }

  // Find all related projects to calculate fatigue
  let relatedProjectCount = 0;
  let genreSaturationCount = 0;
  let universeProjectCount = 0;
  let recentCrossoverTarget: Project | null = null;
  let isLegacy = false;

  if (state) {
    const rootId = sourceProject.parentProjectId || sourceProject.id;

    let cache = stateIndexes.get(state);
    // ⚡ Bolt: Strict cache invalidation checks using state tick identity and length
    if (!cache || cache.week !== state.week || cache.projectCount !== state.studio.internal.projects.length) {
      // Build O(1) indices for the current state exactly once
      cache = {
        week: state.week,
        projectCount: state.studio.internal.projects.length,
        relatedCounts: new Map<string, number>(),
        genreSaturationCounts: new Map<string, number>(),
        crossoverTargets: new Map<string, Project[]>(),
        universeProjectCount: 0,
      };

      const saturationCutoff = state.week - 50;

      for (let i = 0, len = state.studio.internal.projects.length; i < len; i++) {
        const p = state.studio.internal.projects[i];

        if (p.parentProjectId) {
          cache.universeProjectCount++;
        }

        // Count related projects by root ID
        const pRootId = p.parentProjectId || p.id;
        cache.relatedCounts.set(pRootId, (cache.relatedCounts.get(pRootId) || 0) + 1);

        if (p.status === 'released') {
          // Track genre saturation
          if (p.releaseWeek !== undefined && p.releaseWeek !== null && p.releaseWeek >= saturationCutoff) {
            cache.genreSaturationCounts.set(p.genre, (cache.genreSaturationCounts.get(p.genre) || 0) + 1);
          }

          // Track potential crossover targets (high revenue blockbusters)
          if (p.revenue > p.budget * 2) {
             const targets = cache.crossoverTargets.get(p.genre) || [];
             targets.push(p);
             cache.crossoverTargets.set(p.genre, targets);
          }
        }
      }

      stateIndexes.set(state, cache);
    }

    relatedProjectCount = cache.relatedCounts.get(rootId) || 0;
    genreSaturationCount = cache.genreSaturationCounts.get(sourceProject.genre) || 0;
    universeProjectCount = cache.universeProjectCount;

    // Look for a crossover opportunity (same genre OR compatible genre)
    // ⚡ Bolt: Check cached targets for O(1) resolution
    const targetAffinities = [sourceProject.genre, ...(CROSSOVER_AFFINITY[sourceProject.genre] || [])];
    for (const genre of targetAffinities) {
      const candidates = cache.crossoverTargets.get(genre);
      if (candidates) {
        // Iterate through all candidates to mimic the original array iteration probability
        for (const candidate of candidates) {
          if (candidate.id !== sourceProject.id && Math.random() > 0.8) {
            recentCrossoverTarget = candidate;
            // No early break here, as we want the *last* candidate to potentially overwrite,
            // mirroring the probability distribution of the original O(N) traversal.
          }
        }
      }
    }

    // Check if it's a legacy IP
    if (sourceProject.releaseWeek !== undefined && sourceProject.releaseWeek !== null && state.week - sourceProject.releaseWeek > 150) {
        isLegacy = true;
    }
  }

  // Fatigue risk calculation
  let baseFatigueRisk = FRANCHISE_FATIGUE_RISK[sourceProject.genre] || 0.1;

  // Calculate Cinematic Universe Oversaturation Penalty
  // High volume of spin-offs in the studio overall contributes to general audience fatigue
  let oversaturationPenalty = (universeProjectCount / 10) * baseFatigueRisk * 5;

  if (universeProjectCount > 15 && genreSaturationCount > 10) {
      oversaturationPenalty += 10; // Cinematic Universe Collapse penalty
      baseFatigueRisk *= 1.5;
  }

  // Apply "Superhero Fatigue" (or general blockbuster fatigue) logic:
  // If the genre is heavily saturated, amplify the risk severely.
  if ((sourceProject.genre === 'Superhero' || sourceProject.genre === 'Action' || sourceProject.genre === 'Sci-Fi') && genreSaturationCount > 10) {
      baseFatigueRisk *= 2.0; // Extreme fatigue curve
  } else if ((sourceProject.genre === 'Superhero' || sourceProject.genre === 'Action' || sourceProject.genre === 'Sci-Fi') && genreSaturationCount > 5) {
      baseFatigueRisk *= 1.5; // Steep fatigue curve
  } else if ((sourceProject.genre === 'Horror' || sourceProject.genre === 'Comedy' || sourceProject.genre === 'Fantasy') && genreSaturationCount > 8) {
      baseFatigueRisk *= 1.3; // Noticeable fatigue for these genres when heavily saturated
  }

  const exponentialSaturation = Math.pow(relatedProjectCount, 1.2); // Exponential decay for heavily saturated franchises
  // Factor in both the direct related projects and the general market saturation for this genre, plus cinematic universe overall fatigue
  const saturationPenalty = (exponentialSaturation * baseFatigueRisk * 10) + (genreSaturationCount * (baseFatigueRisk / 2) * 5) + oversaturationPenalty;

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
    if (rand < 0.15) {
      return {
        title: `${sourceProject.title}: Villain Origin Story`,
        format: 'film',
        genre: 'Drama',
        budgetTier: 'mid',
        targetAudience: 'Prestige / Critics',
        flavor: `A gritty, character-driven origin story for the franchise's iconic villain.`,
        parentProjectId: sourceProject.id,
        isSpinoff: true,
        initialBuzzBonus: 10 - (saturationPenalty / 2),
      };
    } else if (rand < 0.2) {
      return {
        title: `${sourceProject.title} Returns`,
        format: sourceProject.format,
        genre: sourceProject.genre,
        budgetTier: sourceProject.budgetTier,
        targetAudience: 'General Audience',
        flavor: `A soft reboot ignoring recent failures, hoping general audiences have a short memory.`,
        parentProjectId: sourceProject.id,
        isSpinoff: true,
        initialBuzzBonus: 8 - (saturationPenalty / 2),
      };
    } else if (rand < 0.4) {
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
    } else if (rand < 0.6) {
      // Deconstructive Meta-Sequel
      return {
        title: `${sourceProject.title}: Resurrection`,
        format: sourceProject.format,
        genre: 'Comedy', // Often becomes a meta-comedy
        budgetTier: 'mid',
        targetAudience: 'Adults 25-54',
        flavor: `A self-aware, fourth-wall-breaking installment that mocks the bloated history of the ${sourceProject.title} franchise.`,
        parentProjectId: sourceProject.id,
        isSpinoff: true,
        initialBuzzBonus: 12, // Meta-commentary tends to get initial positive buzz
      };
    } else if (rand < 0.7 && sourceProject.format === 'film') {
        if (rand < 0.6) {
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
        } else {
            // Expanded Universe Series (Streaming)
            return {
              title: `${sourceProject.title}: Expanded Universe`,
              format: 'tv',
              tvFormat: 'prestige_drama',
              episodes: 10,
              releaseModel: 'binge',
              genre: sourceProject.genre,
              budgetTier: 'high',
              targetAudience: sourceProject.targetAudience,
              flavor: `A high-budget streaming spinoff attempting to salvage the lore of the fatigued ${sourceProject.title} universe.`,
              parentProjectId: sourceProject.id,
              isSpinoff: true,
              initialBuzzBonus: 12 - (saturationPenalty / 3),
            };
        }
    } else if (universeProjectCount >= 10 && rand >= 0.7 && rand < 0.8) {
      // Cinematic Universe Phase Reset
      return {
        title: `${sourceProject.title}: A New Era`,
        format: sourceProject.format,
        genre: sourceProject.genre,
        budgetTier: 'blockbuster',
        targetAudience: 'General Audience',
        flavor: `A massive, universe-resetting event designed to clear out bloated continuity and start fresh for a new era of ${sourceProject.title}.`,
        parentProjectId: sourceProject.id,
        isSpinoff: true,
        initialBuzzBonus: 15 - (saturationPenalty / 4), // Good buzz for a fresh start, but some fatigue remains
      };
    } else if (sourceProject.genre === 'Animation' && rand >= 0.8 && rand < 0.9) {
      // Live-Action Remake
      return {
        title: `${sourceProject.title}: Live-Action Event`,
        format: 'film',
        genre: 'Fantasy',
        budgetTier: 'blockbuster',
        targetAudience: 'Family',
        flavor: `A soulless but highly profitable live-action remake of the beloved animated classic ${sourceProject.title}.`,
        parentProjectId: sourceProject.id,
        isSpinoff: true,
        initialBuzzBonus: 10 - (saturationPenalty / 3),
      };
    } else if (sourceProject.format === 'film' && rand >= 0.9 && rand < 0.97) {
      // The Animated Series format flip
      return {
        title: `${sourceProject.title}: The Animated Series`,
        format: 'tv',
        tvFormat: 'standard_drama',
        episodes: 13,
        releaseModel: 'weekly',
        genre: 'Animation',
        budgetTier: 'mid',
        targetAudience: 'Genre Fans',
        flavor: `An animated continuation of the film franchise, aiming to keep the brand alive for a dedicated audience.`,
        parentProjectId: sourceProject.id,
        isSpinoff: true,
        initialBuzzBonus: 5,
      };
    }
    return null; // Otherwise, the IP is dead for now
  }

  let newTitle: string;
  let flavorText: string;
  let buzzBonus = 15 - saturationPenalty;
  let newBudgetTier = sourceProject.budgetTier;

  if (!isFatigued && rand < 0.05) {
    // Holiday Special Gimmick
    return {
      title: `${sourceProject.title}: The Holiday Special`,
      format: sourceProject.format === 'film' ? 'tv' : sourceProject.format,
      tvFormat: sourceProject.format === 'film' ? 'limited_series' : sourceProject.tvFormat,
      episodes: 1,
      releaseModel: 'binge',
      genre: 'Comedy',
      budgetTier: 'low',
      targetAudience: 'Family',
      flavor: `A bizarre, non-canon holiday special featuring the cast of ${sourceProject.title} in increasingly awkward festive situations.`,
      parentProjectId: sourceProject.id,
      isSpinoff: true,
      initialBuzzBonus: -5, // Often reviled by fans
    };
  }

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

  // Desperate Nostalgia Cash-Grab for dead fatigued legacy IPs
  if (isFatigued && isLegacy && sourceProject.revenue <= sourceProject.budget * 1.5 && rand < 0.3) {
    return {
      title: `${sourceProject.title}: The Return`,
      format: sourceProject.format,
      genre: sourceProject.genre,
      budgetTier: 'low', // Cheap cache-grab
      targetAudience: sourceProject.targetAudience,
      flavor: `A cheaply produced nostalgia cash-grab trying to squeeze the last remaining drops of goodwill from the ${sourceProject.title} franchise.`,
      parentProjectId: sourceProject.id,
      isSpinoff: true,
      initialBuzzBonus: -10, // General audience resents it
    };
  }

  if (isLegacy && recentCrossoverTarget && rand < 0.15) {
    // Multiverse Event
    newTitle = `${sourceProject.title}: Into the Multiverse`;
    flavorText = `A massive multiverse event uniting legacy characters from the ${sourceProject.title} universe with ${recentCrossoverTarget.title}.`;
    buzzBonus += 40 - (genreSaturationCount * 1.5); // Insane hype, slightly offset by genre saturation
    newBudgetTier = 'blockbuster';
  } else if (recentCrossoverTarget && rand < 0.2) {
    // Cinematic Universe Event
    newTitle = `${sourceProject.title} vs ${recentCrossoverTarget.title}: Dawn of Justice`;
    flavorText = `A blockbuster Cinematic Universe event combining two powerhouse franchises. Stakes have never been higher.`;
    buzzBonus += 30 - (genreSaturationCount * 2); // Crossovers generate massive hype, but suffer if the genre is saturated
    newBudgetTier = 'blockbuster'; // Crossovers are always huge events
  } else if (universeProjectCount >= 15 && rand < 0.35) {
      // Cinematic Universe Team-Up
      newTitle = `${sourceProject.title}: The Assembly`;
      flavorText = `The ultimate team-up event bringing together every corner of the massive ${sourceProject.title} universe.`;
      buzzBonus += 50 - (genreSaturationCount * 2);
      newBudgetTier = 'blockbuster';
  } else if (isLegacy && rand < 0.5) {
      if (rand < 0.3) {
          // Requel
          newTitle = `${sourceProject.title}: A New Generation`;
          flavorText = `A "requel" where the legacy cast returns to pass the torch to a new, younger set of heroes.`;
          buzzBonus += 20;
          newBudgetTier = 'blockbuster';
      } else {
          // Legacy Sequel
          newTitle = `${sourceProject.title}: Legacy`;
          flavorText = `Decades later, the original cast returns to pass the torch to a new generation in this long-awaited continuation.`;
          buzzBonus += 25; // Massive nostalgia bump
          newBudgetTier = 'blockbuster';
      }
  } else if (relatedProjectCount >= 3 && sourceProject.revenue > sourceProject.budget * 3 && rand < 0.55) {
      // Part 1 of 2 Finale
      newTitle = `${sourceProject.title}: The Final Chapter - Part 1`;
      flavorText = `The massive, two-part conclusion to the epic ${sourceProject.title} saga begins here.`;
      buzzBonus += 40;
      newBudgetTier = 'blockbuster';
  } else if (rand < 0.6) {
    // Direct Sequel
    const nextNumber = relatedProjectCount + 1;
    newTitle = `${sourceProject.title} ${nextNumber}`;
    flavorText = `The next highly anticipated chapter in the blockbuster ${sourceProject.title} franchise.`;
    buzzBonus += 10;
  } else if (rand < 0.85) {
    // Prequel
    newTitle = `${sourceProject.title}: Origins`;
    flavorText = `A prequel revealing the hidden history of the ${sourceProject.title} universe.`;
  } else if (sourceProject.parentProjectId) {
    // Spinoff of a Spinoff
    newTitle = `${sourceProject.title}: The Next Chapter`;
    flavorText = `An unexpected spinoff of a spinoff, proving the studio will milk the ${sourceProject.title} name dry.`;
    buzzBonus -= 5; // Extra fatigue for spinning off a spinoff
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

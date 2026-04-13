import { Project, TvFormatKey, BudgetTierKey, UnscriptedFormatKey, IPAsset } from '../../types';
import { RandomGenerator } from '../../utils/rng';
import { applyRebootNostalgia } from './ipRebootEngine';

/**
 * Spinoff Factory.
 * Dictionary-based generator for sequels, reboot, and crossovers.
 * Replaces the monolithic logic in franchises.ts.
 */

export interface SpinoffTemplate {
  titleSuffix: string;
  format?: 'film' | 'tv' | 'unscripted';
  tvFormat?: TvFormatKey;
  unscriptedFormat?: UnscriptedFormatKey;
  genre?: string;
  budgetTier?: BudgetTierKey;
  buzzBonus: number;
  flavorTemplate: string;
}

export const SPINOFF_TEMPLATES: Record<'FATIGUED' | 'HEALTHY' | 'LEGACY' | 'OVERALL_DEAL', SpinoffTemplate[]> = {
  OVERALL_DEAL: [
    {
      titleSuffix: 'The Masterpiece',
      format: 'tv',
      tvFormat: 'prestige_limited_series',
      budgetTier: 'high',
      buzzBonus: 25,
      flavorTemplate: 'A prestige commission from a top-tier creative under an overall deal, pushing the boundaries of {title}.'
    },
    {
      titleSuffix: 'Universe Expansion',
      format: 'tv',
      tvFormat: 'sci_fi_epic',
      budgetTier: 'blockbuster',
      buzzBonus: 15,
      flavorTemplate: 'An ambitious expansion of the {title} lore, commissioned through a first-look agreement.'
    },
    {
      titleSuffix: 'The Anthology',
      format: 'tv',
      tvFormat: 'anthology_series',
      budgetTier: 'mid',
      buzzBonus: 10,
      flavorTemplate: 'A creative anthology exploring different facets of the {title} world, produced under an overall deal.'
    }
  ],
  FATIGUED: [
    {
      titleSuffix: 'The True Story',
      format: 'unscripted',
      unscriptedFormat: 'docuseries',
      genre: 'Unscripted',
      budgetTier: 'low',
      buzzBonus: 10,
      flavorTemplate: 'An unscripted docuseries retrospective detailing the troubled production and ultimate downfall of the {title} franchise.'
    },
    {
      titleSuffix: 'IP Retention',
      format: 'film',
      budgetTier: 'low',
      buzzBonus: -20,
      flavorTemplate: 'A cynical, zero-budget IP retention flop designed purely to keep the rights to {title} before they expire.'
    },
    {
      titleSuffix: 'Interactive Special',
      format: 'tv',
      tvFormat: 'limited_series',
      budgetTier: 'mid',
      buzzBonus: -5,
      flavorTemplate: "A desperate gimmick interactive special attempting to pull audiences back with a 'choose your own adventure' format."
    },
    {
      titleSuffix: 'The Musical',
      format: 'film',
      genre: 'Musical',
      budgetTier: 'mid',
      buzzBonus: 5,
      flavorTemplate: 'A polarizing musical adaptation attempting to breathe new life into {title}.'
    },
    {
      titleSuffix: 'Deconstructed',
      format: 'film',
      budgetTier: 'high',
      buzzBonus: -10,
      flavorTemplate: 'A meta-narrative sequel that actively mocks the {title} fanbase.'
    }
  ],
  HEALTHY: [
    {
      titleSuffix: 'Origins',
      buzzBonus: 15,
      flavorTemplate: 'A prequel revealing the hidden history of the {title} universe.'
    },
    {
      titleSuffix: 'The Next Generation',
      buzzBonus: 10,
      flavorTemplate: 'A spinoff expanding the universe of the hit {title} with a fresh cast.'
    },
    {
      titleSuffix: 'The Anime Series',
      format: 'tv',
      genre: 'Animation',
      budgetTier: 'mid',
      buzzBonus: 5,
      flavorTemplate: 'A highly stylized anime spin-off meant to expand the global reach of the {title} universe.'
    },
    {
      titleSuffix: 'Into the Multiverse',
      format: 'film',
      genre: 'Multiverse',
      budgetTier: 'blockbuster',
      buzzBonus: 20,
      flavorTemplate: 'A massive crossover event pulling alternate reality versions of characters from the {title} universe.'
    },
    {
      titleSuffix: 'The Spin-Off',
      format: 'film',
      budgetTier: 'high',
      buzzBonus: 10,
      flavorTemplate: 'A side-story focusing on a fan-favorite secondary character from {title}.'
    }
  ],
  LEGACY: [
    {
      titleSuffix: 'Legacy',
      budgetTier: 'blockbuster',
      buzzBonus: 25,
      flavorTemplate: 'Decades later, the original cast returns to pass the torch to a new generation in this long-awaited continuation.'
    },
    {
      titleSuffix: 'Awakening',
      budgetTier: 'high',
      buzzBonus: 15,
      flavorTemplate: 'A massive "soft reboot" of a dead legacy IP with extreme risk and a huge budget.'
    },
    {
      titleSuffix: 'Reborn',
      format: 'film',
      budgetTier: 'blockbuster',
      buzzBonus: 30,
      flavorTemplate: 'A gritty, grounded re-imagining of {title} for modern audiences.'
    },
    {
      titleSuffix: 'Reunion',
      format: 'unscripted',
      unscriptedFormat: 'talk_show',
      genre: 'Unscripted',
      budgetTier: 'low',
      buzzBonus: 20,
      flavorTemplate: 'The original cast of {title} reunites to discuss the franchise\'s cultural impact.'
    }
  ]
};

/**
 * Generates a new project proposal based on an existing IP asset (Hardened).
 */
export function generateSpinoffProposal(
  rng: RandomGenerator,
  sourceProject: Project, 
  status: 'FATIGUED' | 'HEALTHY' | 'LEGACY' | 'OVERALL_DEAL',
  relatedCount: number = 0,
  sourceAsset?: IPAsset
): Partial<Project> {
  const pool = SPINOFF_TEMPLATES[status];
  const template = rng.pick(pool);
  
  // Standard Sequel Check: If healthy and not reached many entries
  if (status === 'HEALTHY' && rng.next() > 0.5) {
     const sequelNum = relatedCount + 2;

     if (sequelNum >= 3) {
       return {
         title: `${sourceProject.title} ${sequelNum}: Part 1`,
         format: sourceProject.format,
         genre: sourceProject.genre,
         budgetTier: 'blockbuster', // Finale bloat
         buzz: 20,
         flavor: `The epic first half of the massive conclusion to the ${sourceProject.title} saga.`,
         parentProjectId: sourceProject.id,
         isSpinoff: true
       };
     }

     return {
       title: `${sourceProject.title} ${sequelNum}`,
       format: sourceProject.format,
       genre: sourceProject.genre,
       budgetTier: sourceProject.budgetTier,
       buzz: 15,
       flavor: `The next highly anticipated chapter in the blockbuster ${sourceProject.title} franchise.`,
       parentProjectId: sourceProject.id,
       isSpinoff: true
     };
  }

  const proposal = {
    title: `${sourceProject.title}: ${template.titleSuffix}`,
    format: template.format || sourceProject.format,
    tvFormat: template.tvFormat,
    unscriptedFormat: template.unscriptedFormat,
    genre: template.genre || sourceProject.genre,
    budgetTier: template.budgetTier || (sourceProject.budgetTier as any),
    buzz: template.buzzBonus,
    flavor: template.flavorTemplate.replace('{title}', sourceProject.title),
    parentProjectId: sourceProject.id,
    isSpinoff: true
  };

  // Apply nostalgia bonus if source asset is available
  if (sourceAsset) {
    return applyRebootNostalgia(proposal, sourceAsset);
  }

  return proposal;
}

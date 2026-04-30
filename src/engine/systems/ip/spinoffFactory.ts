import { Project, TvFormatKey, BudgetTierKey, UnscriptedFormatKey } from '../../types';
import { secureRandom } from '../../utils';

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

export const SPINOFF_TEMPLATES: Record<'FATIGUED' | 'HEALTHY' | 'LEGACY', SpinoffTemplate[]> = {
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
    }
  ]
};

/**
 * Generates a new project proposal based on an existing IP asset.
 */
export function generateSpinoffProposal(
  sourceProject: Project, 
  status: 'FATIGUED' | 'HEALTHY' | 'LEGACY',
  relatedCount: number = 0
): Partial<Project> {
  const pool = SPINOFF_TEMPLATES[status];
  const template = pool[Math.floor(secureRandom() * pool.length)];
  
  // Standard Sequel Check: If healthy and not reached many entries
  if (status === 'HEALTHY' && secureRandom() > 0.5) {
     const sequelNum = relatedCount + 2;
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

  return {
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
}

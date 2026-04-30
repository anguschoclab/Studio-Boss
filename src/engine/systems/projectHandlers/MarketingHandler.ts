import { Project, Contract, Talent, StateImpact, MarketingCampaign } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

// Extended angle type covering the 6 new angles not yet in project.types.ts
type ExtendedMarketingAngle =
  | import('@/engine/types').MarketingAngle
  | 'SELL_THE_SCARES'
  | 'SELL_THE_ROMANCE'
  | 'SELL_THE_WORLD_MYTHOLOGY'
  | 'SELL_THE_TRUE_STORY_HOOK'
  | 'SELL_THE_MUSIC'
  | 'BROAD_FOUR_QUADRANT_MARKETING';

/**
 * Compute an efficiency multiplier for a given marketing angle relative to
 * the project's genre and attributes.
 *
 * Returns a multiplier where 1.0 = neutral, >1.0 = bonus, <1.0 = penalty.
 * The floor clamp for BROAD_FOUR_QUADRANT_MARKETING (0.7×) is applied here
 * so callers can rely on the returned value directly.
 */
export function computeAngleMultiplier(
  angle: ExtendedMarketingAngle,
  project: Project
): number {
  const genre = (project.genre || '').toLowerCase();
  const isHorrorThriller = genre.includes('horror') || genre.includes('thriller');
  const isRomanceDrama   = genre.includes('romance') || genre.includes('drama');
  const isFranchise      = !!project.franchiseId;

  switch (angle) {
    // ── Existing angles ──────────────────────────────────────────────────
    case 'SELL_THE_SPECTACLE': return 1.15;
    case 'SELL_THE_STORY':     return 1.10;
    case 'SELL_THE_STARS':     return 1.10;
    case 'FAMILY_ADVENTURE':   return 1.12;
    case 'AWARDS_PUSH':        return 1.20;
    case 'GRASSROOTS':         return 1.08;
    case 'GLOBAL_BLITZ':       return 1.25;
    case 'CONTROVERSY':        return 1.05;

    // ── New angles ───────────────────────────────────────────────────────

    // +25% for horror/thriller, +5% baseline
    case 'SELL_THE_SCARES':
      return isHorrorThriller ? 1.25 : 1.05;

    // +20% for romance/drama, +0% baseline (neutral)
    case 'SELL_THE_ROMANCE':
      return isRomanceDrama ? 1.20 : 1.0;

    // +30% for franchise projects, +5% baseline
    case 'SELL_THE_WORLD_MYTHOLOGY':
      return isFranchise ? 1.30 : 1.05;

    // +15% baseline broad appeal (prestige boost handled externally via buzz)
    case 'SELL_THE_TRUE_STORY_HOOK':
      return 1.15;

    // +10% baseline (streaming revenue boost handled in box-office layer)
    case 'SELL_THE_MUSIC':
      return 1.10;

    // Always 1.0×, but floor prevents catastrophic failures
    case 'BROAD_FOUR_QUADRANT_MARKETING':
      return 1.0; // floor of 0.7× enforced in caller

    default:
      return 1.0;
  }
}

/**
 * Apply both primary and (optional) secondary angle multipliers.
 * The secondary angle contributes 30% of its own multiplier bonus.
 * BROAD_FOUR_QUADRANT_MARKETING has a special floor of 0.7× applied to the
 * combined result when it is the primary angle.
 */
export function computeCampaignMultiplier(
  campaign: MarketingCampaign & { secondaryAngle?: ExtendedMarketingAngle },
  project: Project
): number {
  const primaryAngle = (campaign.primaryAngle as ExtendedMarketingAngle);
  const secondaryAngle = campaign.secondaryAngle as ExtendedMarketingAngle | undefined;

  const primaryMult = computeAngleMultiplier(primaryAngle, project);

  let secondaryContribution = 0;
  if (secondaryAngle && secondaryAngle !== primaryAngle) {
    const secondaryMult = computeAngleMultiplier(secondaryAngle, project);
    // Secondary contributes 30% of its multiplier delta (bonus above 1.0)
    secondaryContribution = (secondaryMult - 1.0) * 0.30;
  }

  let combined = primaryMult + secondaryContribution;

  // BROAD_FOUR_QUADRANT_MARKETING as primary enforces a floor of 0.7×
  if (primaryAngle === 'BROAD_FOUR_QUADRANT_MARKETING') {
    combined = Math.max(0.7, combined);
  }

  return combined;
}

export function handleMarketingPhase(p: Project, talentPool: Record<string, Talent>, projectContracts: Contract[], rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  let newBuzz = p.buzz;

  // Auteur Friction Logic
  if (p.activeCut === 'sanitized') {
    const directorContract = projectContracts.find(c => (c as any).role === 'director');
    if (directorContract) {
      const director = talentPool[directorContract.talentId];
      if (director && (director as any).directorArchetype === 'auteur') {
        // 80% chance of a scandal if an auteur is sanitized
        if (rng.next() < 0.8) {
          impacts.push({
            type: 'SCANDAL_ADDED',
            payload: {
              scandal: {
                id: rng.uuid('SND'),
                type: 'director_speaks_out' as any,
                talentId: director.id,
                severity: 70,
                description: `Renowned director ${director.name} has publically disowned the studio's "sanitized" cut of "${p.title}", claiming their creative vision was compromised for commercial gain.`,
                isPublic: true,
                weekDiscovered: 0
              }
            }
          });
          newBuzz = Math.max(0, p.buzz - 15);
        }
      }
    }
  }

  // Apply marketing angle efficiency to buzz if a campaign exists
  if (p.marketingCampaign) {
    const campaignWithSecondary = p.marketingCampaign as MarketingCampaign & { secondaryAngle?: ExtendedMarketingAngle };
    const multiplier = computeCampaignMultiplier(campaignWithSecondary, p);
    // Buzz bonus from angle: each 0.1× above 1.0 adds ~2 buzz points
    const angleBuzzBonus = Math.round((multiplier - 1.0) * 20);
    newBuzz = Math.min(100, newBuzz + angleBuzzBonus);
  }

  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: p.id,
      update: {
        state: 'marketing',
        weeksInPhase: 0,
        buzz: newBuzz
      }
    }
  });

  return impacts;
}

export function executeMarketing(
  project: Project,
  campaign: MarketingCampaign
): { project: Project } {
  const p = {
    ...project,
    marketingCampaign: {
      ...campaign,
      weeksInMarketing: 1
    }
  };
  return { project: p };
}

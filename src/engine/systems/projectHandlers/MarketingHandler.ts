import { Project, Contract, Talent, StateImpact, MarketingCampaign } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

type ExtendedMarketingAngle =
  | import('@/engine/types').MarketingAngle
  | 'SELL_THE_SCARES'
  | 'SELL_THE_ROMANCE'
  | 'SELL_THE_WORLD_MYTHOLOGY'
  | 'SELL_THE_TRUE_STORY_HOOK'
  | 'SELL_THE_MUSIC'
  | 'BROAD_FOUR_QUADRANT_MARKETING';

const ANGLE_MULTIPLIERS: Record<string, (p: Project) => number> = {
  'SELL_THE_SPECTACLE': () => 1.15,
  'SELL_THE_STORY': () => 1.10,
  'SELL_THE_STARS': () => 1.10,
  'FAMILY_ADVENTURE': () => 1.12,
  'AWARDS_PUSH': () => 1.20,
  'GRASSROOTS': () => 1.08,
  'GLOBAL_BLITZ': () => 1.25,
  'CONTROVERSY': () => 1.05,
  'SELL_THE_SCARES': (p) => {
    const genre = (p.genre || '').toLowerCase();
    return (genre.includes('horror') || genre.includes('thriller')) ? 1.25 : 1.05;
  },
  'SELL_THE_ROMANCE': (p) => {
    const genre = (p.genre || '').toLowerCase();
    return (genre.includes('romance') || genre.includes('drama')) ? 1.20 : 1.0;
  },
  'SELL_THE_WORLD_MYTHOLOGY': (p) => p.franchiseId ? 1.30 : 1.05,
  'SELL_THE_TRUE_STORY_HOOK': () => 1.15,
  'SELL_THE_MUSIC': () => 1.10,
  'BROAD_FOUR_QUADRANT_MARKETING': () => 1.0,
};

/**
 * Compute an efficiency multiplier for a given marketing angle relative to
 * the project's genre and attributes.
 */
export function computeAngleMultiplier(
  angle: ExtendedMarketingAngle,
  project: Project
): number {
  const handler = ANGLE_MULTIPLIERS[angle];
  return handler ? handler(project) : 1.0;
}

/**
 * Apply both primary and (optional) secondary angle multipliers.
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
    secondaryContribution = (secondaryMult - 1.0) * 0.30;
  }

  let combined = primaryMult + secondaryContribution;

  if (primaryAngle === 'BROAD_FOUR_QUADRANT_MARKETING') {
    combined = Math.max(0.7, combined);
  }

  return combined;
}

export function handleMarketingPhase(p: Project, talentPool: Record<string, Talent>, projectContracts: Contract[], rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  let newBuzz = p.buzz;

  if (p.activeCut === 'sanitized') {
    const directorContract = projectContracts.find(c => (c as any).role === 'director');
    if (directorContract) {
      const director = talentPool[directorContract.talentId];
      if (director && (director as any).directorArchetype === 'auteur') {
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

  if (p.marketingCampaign) {
    const campaignWithSecondary = p.marketingCampaign as MarketingCampaign & { secondaryAngle?: ExtendedMarketingAngle };
    const multiplier = computeCampaignMultiplier(campaignWithSecondary, p);
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

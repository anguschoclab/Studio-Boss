import { GameState, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { RatingMarket } from '../../types/project.types';
import { MARKET_CONFIGS } from '../../data/ratingMarkets';
import { Project } from '../../types/project.types';
import { BardResolver } from '../bardResolver';

export type RatingEventType = 'rating_controversy' | 'foreign_market_cut' | 'banned_in_market';

export function generateStudioRatingEvent(
  type: RatingEventType,
  context: { projectTitle: string; marketName?: string; week: number },
  rng: RandomGenerator
): StateImpact {
  const prestigeLoss = type === 'banned_in_market' ? -10
    : type === 'rating_controversy' ? -5
    : -3;

  const headline = BardResolver.resolve({
    domain: 'Industry',
    subDomain: 'Scandal',
    variant: type,
    intensity: 50,
    context: { project: context.projectTitle },
    rng
  });

  const description = BardResolver.resolve({
    domain: 'Industry',
    subDomain: 'Scandal',
    intensity: prestigeLoss < -5 ? 20 : 50,
    tone: 'Trade',
    context: { project: context.projectTitle, market: context.marketName },
    rng
  });

  const publication = type === 'banned_in_market' ? 'The Hollywood Reporter' as const
    : 'Variety' as const;

  return {
    prestigeChange: prestigeLoss,
    newsEvents: [{
      id: rng.uuid('NWS'),
      week: context.week,
      type: 'SCANDAL',
      headline,
      description,
      publication
    }],
    newHeadlines: [{
      id: rng.uuid('NWS'),
      text: headline,
      week: context.week,
      category: 'scandal',
      publication
    }]
  };
}

export function generateMarketBanScandal(
  project: Project,
  bannedMarkets: RatingMarket[],
  week: number,
  state: GameState,
  rng: RandomGenerator
): StateImpact | null {
  if (bannedMarkets.length === 0) return null;

  const alreadyReported = state.industry.newsHistory.some(e =>
    e.headline.includes(project.title) && e.headline.includes('BANNED')
  );
  if (alreadyReported) return null;

  const primaryBan = bannedMarkets[0];
  const marketName = MARKET_CONFIGS[primaryBan]?.displayName ?? primaryBan;
  const extraCount = bannedMarkets.length - 1;

  const suffix = extraCount > 0 ? ` (and ${extraCount} other market${extraCount > 1 ? 's' : ''})` : '';
  const headline = `"${project.title}" BANNED in ${marketName}${suffix}`;

  const prestigeLoss = Math.min(15, bannedMarkets.length * 3);

  return {
    prestigeChange: -prestigeLoss,
    newsEvents: [{
      id: rng.uuid('NWS'),
      week,
      type: 'SCANDAL',
      headline,
      description: BardResolver.resolve({
        domain: 'Industry',
        subDomain: 'Scandal',
        intensity: 20,
        tone: 'Trade',
        context: { project: project.title, market: marketName },
        rng
      }),
      publication: 'The Hollywood Reporter'
    }],
    newHeadlines: [{
      id: rng.uuid('NWS'),
      text: headline,
      week,
      category: 'scandal',
      publication: 'The Hollywood Reporter'
    }]
  };
}

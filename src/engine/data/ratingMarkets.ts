import { ContentFlag, FilmRating, RatingMarket } from '../types/project.types';

export interface MarketConfig {
  market: RatingMarket;
  displayName: string;
  /** Flags that cause this market to ban the film entirely */
  bannedFlags: ContentFlag[];
  /** Flags that restrict access (reduced revenue, not full ban) */
  restrictedFlags: ContentFlag[];
  /** Revenue multiplier applied when restricted (e.g. 0.60 = 40% revenue lost) */
  restrictionRevenueMultiplier: number;
  /** This market's share of global box office (all 8 markets sum to 1.0) */
  boxOfficeSharePct: number;
  /** Display-only: what the local rating board calls equivalent US ratings */
  ratingEquivalents: Partial<Record<FilmRating, string>>;
}

export const MARKET_CONFIGS: Record<RatingMarket, MarketConfig> = {
  us: {
    market: 'us',
    displayName: 'United States',
    bannedFlags: [],
    restrictedFlags: [],
    restrictionRevenueMultiplier: 1.0,
    boxOfficeSharePct: 0.35,
    ratingEquivalents: { G: 'G', PG: 'PG', 'PG-13': 'PG-13', R: 'R', 'NC-17': 'NC-17', Unrated: 'Unrated' }
  },
  uk: {
    market: 'uk',
    displayName: 'United Kingdom',
    bannedFlags: [],
    restrictedFlags: ['gore', 'sexual_content'],
    restrictionRevenueMultiplier: 0.85,
    boxOfficeSharePct: 0.07,
    ratingEquivalents: { G: 'U', PG: 'PG', 'PG-13': '12A', R: '15', 'NC-17': '18', Unrated: '18' }
  },
  europe: {
    market: 'europe',
    displayName: 'Europe',
    bannedFlags: [],
    restrictedFlags: ['violence', 'gore'],
    restrictionRevenueMultiplier: 0.80,
    boxOfficeSharePct: 0.12,
    ratingEquivalents: { G: 'Tous publics', PG: 'Tous publics', 'PG-13': '-12', R: '-16', 'NC-17': '-18' }
  },
  china: {
    market: 'china',
    displayName: 'China',
    bannedFlags: ['lgbtq_themes', 'political', 'supernatural', 'religious', 'gore', 'nudity', 'sexual_content'],
    restrictedFlags: ['violence', 'drug_use'],
    restrictionRevenueMultiplier: 0.60,
    boxOfficeSharePct: 0.20,
    ratingEquivalents: { G: 'Approved', PG: 'Approved', 'PG-13': 'Approved' }
  },
  india: {
    market: 'india',
    displayName: 'India',
    bannedFlags: ['nudity', 'sexual_content'],
    restrictedFlags: ['violence', 'political', 'religious', 'drug_use'],
    restrictionRevenueMultiplier: 0.70,
    boxOfficeSharePct: 0.06,
    ratingEquivalents: { G: 'U', PG: 'U/A', 'PG-13': 'U/A', R: 'A', 'NC-17': 'A' }
  },
  latam: {
    market: 'latam',
    displayName: 'Latin America',
    bannedFlags: ['lgbtq_themes'],
    restrictedFlags: ['nudity', 'sexual_content', 'drug_use'],
    restrictionRevenueMultiplier: 0.75,
    boxOfficeSharePct: 0.07,
    ratingEquivalents: { G: 'ATP', PG: 'ATP', 'PG-13': '+13', R: '+18', 'NC-17': '+18' }
  },
  middleeast: {
    market: 'middleeast',
    displayName: 'Middle East',
    bannedFlags: ['lgbtq_themes', 'nudity', 'sexual_content', 'religious', 'political'],
    restrictedFlags: ['violence', 'gore', 'drug_use', 'profanity'],
    restrictionRevenueMultiplier: 0.50,
    boxOfficeSharePct: 0.05,
    ratingEquivalents: { G: 'General', PG: 'General', 'PG-13': '15+', R: '18+' }
  },
  apac: {
    market: 'apac',
    displayName: 'Asia-Pacific',
    bannedFlags: [],
    restrictedFlags: ['violence', 'gore', 'nudity', 'sexual_content'],
    restrictionRevenueMultiplier: 0.75,
    boxOfficeSharePct: 0.08,
    ratingEquivalents: { G: 'G', PG: 'PG', 'PG-13': 'M', R: 'MA15+', 'NC-17': 'R18+' }
  }
};

/** Returns all markets where this set of flags results in a ban */
export function getBannedMarkets(flags: ContentFlag[]): RatingMarket[] {
  return (Object.keys(MARKET_CONFIGS) as RatingMarket[]).filter(market => {
    const config = MARKET_CONFIGS[market];
    return config.bannedFlags.some(f => flags.includes(f));
  });
}

/** Returns all markets where this set of flags results in restriction (not ban) */
export function getRestrictedMarkets(flags: ContentFlag[]): RatingMarket[] {
  return (Object.keys(MARKET_CONFIGS) as RatingMarket[]).filter(market => {
    const config = MARKET_CONFIGS[market];
    const isBanned = config.bannedFlags.some(f => flags.includes(f));
    const isRestricted = config.restrictedFlags.some(f => flags.includes(f));
    return isRestricted && !isBanned;
  });
}

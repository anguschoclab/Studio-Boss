// Marketing & Promotion System Types
// Talk shows, magazine photoshoots, press tours

export type TalkShowType =
  | 'late_night'
  | 'morning_show'
  | 'podcast'
  | 'variety'
  | 'comedy_central'
  | 'serious_interview';

export interface TalkShowAppearance {
  id: string;
  talentId: string;
  projectId?: string; // Optional - promoting a specific project
  showName: string;
  showType: TalkShowType;
  week: number;
  performance: number; // 0-100
  viralMoment: boolean;
  scandalGenerated: boolean;
  audienceReach: number; // Estimated viewers
  prestigeChange: number;
  starMeterBoost: number;
  // Chemistry with host affects performance
  hostId?: string;
  chemistryBonus: number; // -20 to +20
}

export type PhotoshootType =
  | 'magazine_cover'
  | 'fashion_editorial'
  | 'promotional'
  | 'candid'
  | 'red_carpet'
  | 'controversial';

export interface MagazinePhotoshoot {
  id: string;
  talentId: string;
  magazineName: string;
  shootType: PhotoshootType;
  week: number;
  quality: number; // 0-100
  controversy: number; // 0-100
  publicationWeek: number;
  starMeterBoost: number;
  prestigeChange: number;
  // Multi-talent shoots (celebrity couples, cliques)
  coTalentIds: string[];
  isCoupleShoot: boolean;
}

// Press tour for major releases
export interface PressTour {
  id: string;
  projectId: string;
  talentIds: string[];
  startWeek: number;
  endWeek: number;
  appearances: TalkShowAppearance[];
  photoshoots: MagazinePhotoshoot[];
  totalCost: number;
  effectiveness: number; // 0-100
}

// For storage in state
export interface MarketingPromotionsState {
  talkShowAppearances: Record<string, TalkShowAppearance>;
  photoshoots: Record<string, MagazinePhotoshoot>;
  activePressTours: Record<string, PressTour>;
}

// Famous talk shows
export const FAMOUS_TALK_SHOWS: Record<TalkShowType, string[]> = {
  'late_night': [
    'The Tonight Show',
    'Late Night with...',
    'Jimmy Kimmel Live!',
    'The Late Show',
  ],
  'morning_show': [
    'Good Morning America',
    'Today Show',
    'CBS Mornings',
    'Morning Joe',
  ],
  'podcast': [
    'The Joe Rogan Experience',
    'WTF with Marc Maron',
    'Conan O\'Brien Needs a Friend',
    'SmartLess',
  ],
  'variety': [
    'Saturday Night Live',
    'The Daily Show',
    'Last Week Tonight',
    'Full Frontal',
  ],
  'comedy_central': [
    'Comedy Central Roast',
    '@midnight',
    'The Opposition',
    'Drunk History',
  ],
  'serious_interview': [
    '60 Minutes',
    'CBS Sunday Morning',
    'Frontline',
    'Real Time with Bill Maher',
  ],
};

// Prestigious magazines
export const PRESTIGIOUS_MAGAZINES = [
  'Vanity Fair',
  'Vogue',
  'The Hollywood Reporter',
  'Variety',
  'Entertainment Weekly',
  'GQ',
  'Elle',
  'Harper\'s Bazaar',
  'People',
  'Rolling Stone',
  'Time',
  'Esquire',
];

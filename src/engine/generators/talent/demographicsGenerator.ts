import { TalentDemographics } from '../../types/talent.types';

export type Ethnicity = 'Caucasian' | 'Black' | 'Hispanic' | 'Asian' | 'South Asian' | 'Middle Eastern' | 'Mixed';

interface CountryProfile {
  ethnicities: { type: Ethnicity; weight: number }[];
}

const COUNTRY_PROFILES: Record<string, CountryProfile> = {
  'USA': {
    ethnicities: [
      { type: 'Caucasian', weight: 60 },
      { type: 'Black', weight: 13 },
      { type: 'Hispanic', weight: 18 },
      { type: 'Asian', weight: 6 },
      { type: 'Mixed', weight: 3 }
    ]
  },
  'UK': {
    ethnicities: [
      { type: 'Caucasian', weight: 85 },
      { type: 'South Asian', weight: 7 },
      { type: 'Black', weight: 4 },
      { type: 'Mixed', weight: 3 },
      { type: 'Asian', weight: 1 }
    ]
  },
  'Japan': {
    ethnicities: [{ type: 'Asian', weight: 98 }, { type: 'Mixed', weight: 2 }]
  },
  'South Korea': {
    ethnicities: [{ type: 'Asian', weight: 99 }, { type: 'Mixed', weight: 1 }]
  },
  'India': {
    ethnicities: [{ type: 'South Asian', weight: 98 }, { type: 'Mixed', weight: 2 }]
  },
  'Mexico': {
    ethnicities: [{ type: 'Hispanic', weight: 90 }, { type: 'Caucasian', weight: 10 }]
  },
  'France': {
    ethnicities: [
      { type: 'Caucasian', weight: 85 },
      { type: 'Black', weight: 10 },
      { type: 'Middle Eastern', weight: 5 }
    ]
  },
  'Default': {
    ethnicities: [{ type: 'Mixed', weight: 100 }]
  }
};

const GENDERS = ['MALE', 'FEMALE', 'NON_BINARY'] as const;

function pick<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function generateDemographics(isGlobalStar: boolean = false, country?: string): TalentDemographics {
  const finalCountry = country || pick(['USA', 'UK', 'Canada', 'Australia', 'Japan', 'Mexico', 'South Korea', 'France', 'India']);
  const profile = COUNTRY_PROFILES[finalCountry] || COUNTRY_PROFILES['Default'];
  
  // Weighted ethnicity pick
  const roll = Math.random() * 100;
  let cumulative = 0;
  let ethnicity: Ethnicity = 'Mixed';
  
  for (const entry of profile.ethnicities) {
    cumulative += entry.weight;
    if (roll <= cumulative) {
      ethnicity = entry.type;
      break;
    }
  }

  return {
    age: Math.floor(randRange(18, isGlobalStar ? 65 : 45)),
    gender: pick(GENDERS),
    country: finalCountry,
    ethnicity
  };
}

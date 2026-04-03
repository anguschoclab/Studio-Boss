import { TalentDemographics } from '../../types/talent.types';
import { RandomGenerator } from '../../utils/rng';

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

export function generateDemographics(rng: RandomGenerator, isGlobalStar: boolean = false, localCountry?: string): TalentDemographics {
  const COUNTRIES = ['USA', 'UK', 'Canada', 'Australia', 'Japan', 'Mexico', 'South Korea', 'France', 'India'];
  let finalCountry = rng.pick(COUNTRIES);
  
  // Bias for local country if not a global star
  if (!isGlobalStar && localCountry && rng.next() < 0.8) {
    finalCountry = localCountry;
  }

  const profile = COUNTRY_PROFILES[finalCountry] || COUNTRY_PROFILES['Default'];
  
  // Weighted ethnicity pick
  const roll = rng.next() * 100;
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
    age: rng.rangeInt(18, isGlobalStar ? 65 : 45),
    gender: rng.pick(GENDERS),
    country: finalCountry,
    ethnicity
  };
}

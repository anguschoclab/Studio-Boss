import { TalentDemographics } from '../../types/talent.types';

const GENDERS = ['MALE', 'FEMALE', 'NON_BINARY'] as const;
const COUNTRIES = ['USA', 'UK', 'Canada', 'Australia', 'Japan', 'Mexico', 'South Korea', 'France', 'India'];
const ETHNICITIES = ['Caucasian', 'Black', 'Hispanic', 'Asian', 'South Asian', 'Middle Eastern', 'Mixed'];

function getSensibleEthnicity(country: string): string {
  if (country === 'Japan' || country === 'South Korea') return 'Asian';
  if (country === 'India') return 'South Asian';
  if (country === 'Mexico') return 'Hispanic';
  return ETHNICITIES[Math.floor(Math.random() * ETHNICITIES.length)];
}

export function generateDemographics(isGlobalSuperstar: boolean, localCountry?: string): TalentDemographics {
  let country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  
  // Non-superstars favor the local country (80% chance)
  if (!isGlobalSuperstar && localCountry && Math.random() < 0.8) {
    country = localCountry;
  }

  return {
    age: 18 + Math.floor(Math.random() * 62),
    gender: GENDERS[Math.floor(Math.random() * GENDERS.length)],
    ethnicity: getSensibleEthnicity(country),
    country
  };
}

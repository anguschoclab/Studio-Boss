import { Project, Talent } from '@/engine/types';
import { AwardsProfile } from '@/engine/types/project.types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Derives an AwardsProfile from a project's core metrics.
 * Used to populate awardsProfile for projects that lack one.
 */
export function generateAwardsProfile(project: Project): AwardsProfile {
  const reviewScore = Math.max(0, project.reviewScore || 50);
  const buzz = Math.max(0, project.buzz || 0);
  const budget = Math.max(0, project.budget || 0);
  const genre = (project.genre || '').toLowerCase();
  const isIndie = budget < 15_000_000;
  const isDrama = genre.includes('drama');
  const isHorror = genre.includes('horror');

  const criticScore = Math.max(0, Math.min(100, reviewScore));
  const audienceScore = Math.max(0, Math.min(100, buzz * 0.6 + reviewScore * 0.4));
  const prestigeScore = Math.max(0, Math.min(100, (criticScore * 0.7 + audienceScore * 0.3) * (isDrama ? 1.1 : 1.0)));
  const craftScore = Math.max(0, Math.min(100, criticScore * 0.8 + (isDrama ? 15 : 0)));
  const culturalHeat = Math.max(0, Math.min(100, buzz * 0.7 + (reviewScore >= 80 ? 20 : 0)));
  const campaignStrength = Math.max(0, Math.min(100, Math.log10(Math.max(1, budget)) * 8));
  const controversyRisk = isHorror ? 20 : 5;
  const festivalBuzz = Math.max(0, Math.min(100, criticScore * 0.9 + (isIndie ? 15 : 0)));
  const academyAppeal = Math.max(0, Math.min(100, prestigeScore * 0.85 + (isDrama ? 10 : -5)));
  const guildAppeal = Math.max(0, Math.min(100, craftScore * 0.9));
  const populistAppeal = Math.max(0, Math.min(100, audienceScore * 0.8 + buzz * 0.2));
  const indieCredibility = Math.max(0, Math.min(100, isIndie ? 70 + criticScore * 0.3 : criticScore * 0.2));
  const industryNarrativeScore = Math.max(0, Math.min(100, prestigeScore * 0.6 + campaignStrength * 0.4));

  return {
    criticScore: Math.round(criticScore),
    audienceScore: Math.round(audienceScore),
    prestigeScore: Math.round(prestigeScore),
    craftScore: Math.round(craftScore),
    culturalHeat: Math.round(culturalHeat),
    campaignStrength: Math.round(campaignStrength),
    controversyRisk,
    festivalBuzz: Math.round(festivalBuzz),
    academyAppeal: Math.round(academyAppeal),
    guildAppeal: Math.round(guildAppeal),
    populistAppeal: Math.round(populistAppeal),
    indieCredibility: Math.round(indieCredibility),
    industryNarrativeScore: Math.round(industryNarrativeScore),
  };
}

export function calculateNominationWeight(
  project: Project, 
  talent: Talent[], 
  campaignBuzz: number = 0
): number {
  const metaScore = project.reviewScore || 0;

  if (metaScore < 65) return 0;

  let weight = (metaScore - 60) * 1.5;

  const maxPrestige = talent.length > 0 
    ? Math.max(...talent.map(t => t.prestige)) 
    : 0;
  
  if (maxPrestige > 80) {
    weight += (maxPrestige - 80) * 2;
  }

  weight += campaignBuzz;

  const genre = (project.genre || '').toLowerCase();
  if (genre.includes('drama')) {
    weight += 10;
  } else if (genre.includes('horror')) {
    weight -= 15;
  }

  return Math.max(0, Math.round(weight));
}

export function checkCampaignBacklash(
  metaScore: number, 
  campaignTier: 'Grassroots' | 'Trade' | 'Blitz',
  rng: RandomGenerator
): boolean {
  if (campaignTier === 'Blitz' && metaScore < 70) {
    return rng.next() < 0.20;
  }
  return false;
}

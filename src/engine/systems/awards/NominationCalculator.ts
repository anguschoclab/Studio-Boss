import { Project, Talent } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

export function calculateNominationWeight(
  project: Project, 
  talent: Talent[], 
  campaignBuzz: number = 0
): number {
  const metaScore = project.reception?.metaScore || project.reviewScore || 0;

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

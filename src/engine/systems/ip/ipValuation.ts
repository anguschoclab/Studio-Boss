import { Project, IPAsset } from '../../types';
import { randRange, clamp } from '../../utils';
import { determineSyndicationTier, getSyndicationImpact } from './syndicationEngine';

/**
 * Logic for initial IP value and weekly cultural decay.
 * A project's success (revenue/awards) is converted into a persistent IPAsset.
 */
export function calculateInitialIPValue(project: Project): IPAsset {
  // Base value: roughly 20% of total revenue as catalog potential
  let baseValue = project.revenue * 0.2;
  
  // Prestige/Awards bonus: 50% spike
  if (project.awardsProfile && project.awardsProfile.prestigeScore > 80) {
    baseValue *= 1.5;
  }

  // Genre Multiplier: Franchise friendly genres get higher multipliers
  let merchandisingMultiplier = 1.0;
  const genre = project.genre.toUpperCase();
  if (genre === 'SCI-FI' || genre === 'ANIMATION' || genre === 'SUPERHERO') {
    merchandisingMultiplier = 2.5;
  } else if (genre === 'HORROR' || genre === 'FANTASY') {
    merchandisingMultiplier = 1.8;
  }

  // Syndication Tiering: Delegate to the logic engine
  const episodes = project.tvDetails?.episodesAired || 0;
  const syndicationTier = determineSyndicationTier(episodes, project.genre);
  const syndicationStatus = (syndicationTier !== 'NONE') ? 'SYNDICATED' : 'NONE';

  // Rights Expiry: 10 years (520 weeks) by default
  const rightsExpirationWeek = (project.releaseWeek || 0) + 520;

  return {
    id: `ip-${project.id}`,
    originalProjectId: project.id,
    franchiseId: project.franchiseId, 
    title: project.title,
    baseValue: Math.floor(baseValue),
    decayRate: 1.0, // Cultural peak at launch
    merchandisingMultiplier,
    syndicationStatus,
    syndicationTier,
    totalEpisodes: episodes,
    rightsExpirationWeek,
    rightsOwner: 'STUDIO'
  };
}

/**
 * Cultural Decay: Cultural relevance drops every week.
 * This decreases total merchant revenue.
 */
export function applyIPDecay(asset: IPAsset): IPAsset {
  const baseDecay = 0.01; // 1% weekly drop by default
  const impact = getSyndicationImpact(asset.syndicationTier);

  // Syndication halts or slows decay: 
  // Gold (1.0) = 0% decay, Silver (0.9) = 0.1% decay, Bronze (0.5) = 0.5% decay
  const effectiveDecay = baseDecay * (1 - impact.decayShield);

  return {
    ...asset,
    decayRate: clamp(asset.decayRate - effectiveDecay, 0.05, 1.0)
  };
}

import { Project, IPAsset, SeriesProject } from '../../types';
import { clamp } from '../../utils';
import { determineSyndicationTier, getSyndicationImpact } from './syndicationEngine';

/**
 * Logic for initial IP value and weekly cultural decay.
 * A project's success (revenue/awards) is converted into a persistent IPAsset.
 */
export function calculateInitialIPValue(project: Project): IPAsset {
  // 1. Determine Tier based on Industrial Performance
  let tier: IPAsset['tier'] = 'ORIGINAL';
  if (project.revenue > 500000000) tier = 'BLOCKBUSTER';
  if (project.isCultClassic) tier = 'CULT_CLASSIC';
  
  // 2. Base value: roughly 20% of total revenue as catalog potential
  let baseValue = project.revenue * 0.2;
  
  // Prestige/Awards bonus: 50% spike
  if (project.awardsProfile && project.awardsProfile.prestigeScore > 80) {
    baseValue *= 1.5;
  }

  // Genre Multipliers: Franchise friendly genres get higher multipliers
  let merchandisingMultiplier = 1.0;
  const genre = project.genre.toUpperCase();
  if (['SCI-FI', 'ANIMATION', 'SUPERHERO'].includes(genre)) merchandisingMultiplier = 2.5;
  else if (['HORROR', 'FANTASY'].includes(genre)) merchandisingMultiplier = 1.8;

  // Syndication Tiering
  const episodes = (project as SeriesProject).tvDetails?.episodesAired || 0;
  const syndicationTier = determineSyndicationTier(episodes, project.genre);

  return {
    id: `ip-${project.id}`,
    originalProjectId: project.id,
    franchiseId: project.franchiseId, 
    title: project.title,
    tier,
    quality: project.reviewScore || 50,
    baseValue: Math.floor(baseValue),
    decayRate: 1.0, 
    merchandisingMultiplier,
    syndicationStatus: (syndicationTier !== 'NONE') ? 'SYNDICATED' : 'NONE',
    syndicationTier,
    totalEpisodes: episodes,
    rightsExpirationWeek: (project.releaseWeek || 0) + 520,
    rightsOwner: 'STUDIO'
  };
}

/**
 * Cultural Decay: Cultural relevance drops every week.
 * This decreases total merchant revenue.
 */
export function applyIPDecay(asset: IPAsset): IPAsset {
  // 1. Synergy Check (Reboot/Spinoff active)
  if (asset.isSynergyActive) {
    // Synergy freezes decay and adds a small "Anniversary/Hype" recovery
    return {
      ...asset,
      decayRate: clamp(asset.decayRate + 0.002, 0.05, 1.0)
    };
  }

  // 2. Tiered Decay Logic
  let baseDecay = 0.01; // 1% default
  if (asset.tier === 'BLOCKBUSTER') baseDecay = 0.005; // Slower decay
  if (asset.tier === 'LEGACY') baseDecay = 0.002; // Very slow
  if (asset.tier === 'CULT_CLASSIC') baseDecay = 0.008; // Slightly better than original

  const impact = getSyndicationImpact(asset.syndicationTier);
  const effectiveDecay = baseDecay * (1 - impact.decayShield);

  return {
    ...asset,
    decayRate: clamp(asset.decayRate - effectiveDecay, 0.05, 1.0)
  };
}

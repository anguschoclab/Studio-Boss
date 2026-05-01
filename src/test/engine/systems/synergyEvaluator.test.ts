import { describe, it, expect } from 'vitest';
import { calculateSynergyGains } from '../../../engine/systems/ip/synergyEvaluator';
import { Franchise, IPAsset } from '../../../engine/types';

describe('Synergy Evaluator', () => {
  const mockFranchise: Franchise = { 
    id: 'f1', 
    name: 'Galaxy Wars', 
    description: 'Universe',
    activeProjectIds: ['film1'], // Hits hasActiveTheatricalRun
    assetIds: [], 
    fatigueLevel: 0, 
    audienceLoyalty: 50, 
    synergyMultiplier: 1.0, 
    totalEquity: 0, 
    relevanceScore: 100,
    lastReleaseWeeks: [], 
    creationWeek: 0 
  };

  const createMockAsset = (id: string, syndicationStatus: 'NONE' | 'SYNDICATED', syndicationTier: 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD' = 'NONE'): IPAsset => ({
    id,
    originalProjectId: 'p1',
    title: 'Asset',
    baseValue: 1000000,
    decayRate: 0.01,
    merchandisingMultiplier: 1.0,
    syndicationStatus,
    syndicationTier,
    totalEpisodes: 10,
    rightsExpirationWeek: 100,
    rightsOwner: 'STUDIO'
  });

  it('applies Halo Effect to television projects when a related film is active', () => {
    const gains = calculateSynergyGains(mockFranchise, 'SERIES', []);
    expect(gains.ratingBonus).toBe(15);
    expect(gains.revenueMultiplier).toBe(1.25);
  });

  it('applies Built-in Audience bonus to films if the vault has syndicated TV assets', () => {
    const relatedAssets = [
      createMockAsset('ip-tv1', 'SYNDICATED', 'GOLD')
    ];
    const gains = calculateSynergyGains(mockFranchise, 'FILM', relatedAssets);
    expect(gains.buzzBonus).toBe(30); // Gold tier bonus
  });

  it('applies Multi-Format Prestige bonus if the brand spans Film and TV', () => {
    const assets = [
      createMockAsset('ip-film1', 'NONE'),
      createMockAsset('ip-tv1', 'SYNDICATED')
    ];
    const gains = calculateSynergyGains(mockFranchise, 'SERIES', assets);
    // 1.0 (base) + 0.25 (Halo) + 0.15 (Multi-format) = 1.4
    expect(gains.revenueMultiplier).toBeCloseTo(1.4);
  });
});

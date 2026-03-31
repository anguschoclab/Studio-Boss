import { describe, it, expect } from 'vitest';
import { calculateSynergyGains } from '../../../engine/systems/ip/synergyEvaluator';
import { Franchise, IPAsset } from '../../../engine/types';

describe('Synergy Evaluator', () => {
  const mockFranchise: Franchise = { 
    id: 'f1', 
    name: 'Galaxy Wars', 
    description: 'Universe',
    activeProjectIds: ['film1'], // Represents an active theatrical run
    assetIds: [], 
    fatigueLevel: 0, 
    audienceLoyalty: 50, 
    synergyMultiplier: 1.0, 
    totalEquity: 0, 
    relevanceScore: 100,
    lastReleaseWeeks: [], 
    creationWeek: 0 
  };

  it('applies Halo Effect to television projects when a related film is active', () => {
    const gains = calculateSynergyGains(mockFranchise, 'TELEVISION', []);
    expect(gains.ratingBonus).toBe(15);
    expect(gains.revenueMultiplier).toBe(1.25);
  });

  it('applies Built-in Audience bonus to films if the vault has syndicated TV assets', () => {
    const relatedAssets = [
      { 
        id: 'ip-tv1', 
        syndicationStatus: 'SYNDICATED', 
        syndicationTier: 'GOLD',
        title: 'Galaxy Wars: The Series'
      } as IPAsset
    ];
    const gains = calculateSynergyGains(mockFranchise, 'FILM', relatedAssets);
    expect(gains.buzzBonus).toBe(30); // Gold tier bonus
  });

  it('applies Multi-Format Prestige bonus if the brand spans Film and TV', () => {
    const assets = [
      { id: 'ip-film1', syndicationStatus: 'NONE' } as IPAsset,
      { id: 'ip-tv1', syndicationStatus: 'SYNDICATED' } as IPAsset
    ];
    const gains = calculateSynergyGains(mockFranchise, 'TELEVISION', assets);
    expect(gains.revenueMultiplier).toBe(1.25 + 0.15); // Halo + Multi-format
  });
});

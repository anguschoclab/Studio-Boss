import { BuyerArchetype } from '../types/studio.types';

export interface PlatformData {
  id: string;
  name: string;
  archetype: BuyerArchetype;
  baseMarketShare: number; // 0.0 to 1.0
  reach: number; // 0 to 100
  description: string;
}

export const PLATFORMS_REGISTRY: PlatformData[] = [
  {
    id: 'nebula_streaming',
    name: 'Nebula+',
    archetype: 'streamer',
    baseMarketShare: 0.25,
    reach: 90,
    description: 'The global leader in high-end streaming content.'
  },
  {
    id: 'critics_choice',
    name: 'Criterion Selection',
    archetype: 'premium',
    baseMarketShare: 0.05,
    reach: 30,
    description: 'Boutique platform focused on prestige and awards-season heavyweights.'
  },
  {
    id: 'global_network',
    name: 'GBC Network',
    archetype: 'network',
    baseMarketShare: 0.15,
    reach: 100,
    description: 'Traditional terrestrial network with massive reach but lower prestige.'
  },
  {
    id: 'indie_hub',
    name: 'IndieHub',
    archetype: 'streamer',
    baseMarketShare: 0.08,
    reach: 40,
    description: 'A growing platform dedicated to niche, low-budget, and cult content.'
  },
  {
    id: 'mega_corp',
    name: 'MegaStreaming',
    archetype: 'streamer',
    baseMarketShare: 0.35,
    reach: 95,
    description: 'Mass-market giant prioritizing broad appeal and blockbuster franchises.'
  }
];

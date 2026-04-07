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
    id: 'plat-6f3b7d1a-9c4e-4e2a-bb0a-25de8fc4ad13',
    name: 'Nebula+',
    archetype: 'streamer',
    baseMarketShare: 0.22,
    reach: 85,
    description: 'The incumbent global leader, now facing fierce subscriber churn in the cutthroat streaming wars as audiences demand consistent season-over-season quality and 100-episode syndication hits.'
  },
  {
    id: 'plat-4d8e5f2b-1a6c-4b3d-98e7-f1c9d2b3e4f5',
    name: 'Criterion Selection',
    archetype: 'premium',
    baseMarketShare: 0.04,
    reach: 25,
    description: 'Boutique platform with sticky, loyal subscribers focused on prestige cinema and high-retention auteur television.'
  },
  {
    id: 'plat-2a1b3c4d-5e6f-4a0b-9c8d-7e6f5a4b3c2d',
    name: 'GBC Network',
    archetype: 'network',
    baseMarketShare: 0.12,
    reach: 100,
    description: 'Traditional broadcast dinosaur bleeding viewers but holding onto lucrative live sports and 100-episode syndication rights.'
  },
  {
    id: 'plat-9a8b7c6d-5e4f-3a2b-1c0d-e9f8a7b6c5d4',
    name: 'IndieHub',
    archetype: 'streamer',
    baseMarketShare: 0.06,
    reach: 35,
    description: 'Niche platform surviving the streaming wars through low-cost, high-engagement cult hits that guarantee low churn.'
  },
  {
    id: 'plat-f1e2d3c4-b5a6-9788-7766-554433221100',
    name: 'MegaStreaming',
    archetype: 'streamer',
    baseMarketShare: 0.38,
    reach: 98,
    description: 'A ruthless corporate titan aggressively outspending rivals to monopolize watch time, known for instantly canceling expensive shows that flatline and focusing on high-retention syndication deals.'
  }
];

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
    baseMarketShare: 0.22,
    reach: 85,
    description: 'The incumbent global leader, now facing fierce subscriber churn in the cutthroat streaming wars as audiences demand consistent season-over-season quality.'
  },
  {
    id: 'critics_choice',
    name: 'Criterion Selection',
    archetype: 'premium',
    baseMarketShare: 0.04,
    reach: 25,
    description: 'Boutique platform with sticky, loyal subscribers focused on prestige cinema and high-retention auteur television.'
  },
  {
    id: 'global_network',
    name: 'GBC Network',
    archetype: 'network',
    baseMarketShare: 0.12,
    reach: 100,
    description: 'Traditional broadcast dinosaur bleeding viewers but holding onto lucrative live sports and 100-episode syndication rights.'
  },
  {
    id: 'indie_hub',
    name: 'IndieHub',
    archetype: 'streamer',
    baseMarketShare: 0.06,
    reach: 35,
    description: 'Niche platform surviving the streaming wars through low-cost, high-engagement cult hits that guarantee low churn.'
  },
  {
    id: 'mega_corp',
    name: 'MegaStreaming',
    archetype: 'streamer',
    baseMarketShare: 0.38,
    reach: 98,
    description: 'A ruthless corporate titan aggressively outspending rivals to monopolize watch time, known for instantly canceling expensive shows that flatline.'
  }
];

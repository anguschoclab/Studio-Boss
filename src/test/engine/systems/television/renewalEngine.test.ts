import { describe, it, expect } from 'vitest';
import { SeriesProject, NetworkPlatform } from '@/engine/types';
import { evaluateRenewal } from '@/engine/systems/television/renewalEngine';

describe('Renewal Engine (Target B2)', () => {
  const mockSeries: SeriesProject = {
    id: 'tv2',
    title: 'Canceled Show',
    type: 'SERIES',
    averageRating: 2.1,
    tvDetails: {
      episodesAired: 10,
      episodesOrdered: 10,
      status: 'ON_AIR',
      averageRating: 2.1
    }
  } as unknown as SeriesProject;

  const mockNetwork: NetworkPlatform = {
    id: 'n1',
    archetype: 'network',
    reach: 80
  } as unknown as NetworkPlatform;

  it('should cancel a show if its average rating is below the threshold', () => {
      // Assuming threshold for this network is e.g. 5.0
      const nextStatus = evaluateRenewal(mockSeries, 2.1, 5.0);
      expect(nextStatus).toBe('CANCELLED');
  });

  it('should renew a show if its average rating is above the threshold', () => {
      const nextStatus = evaluateRenewal(mockSeries, 8.5, 5.0);
      expect(nextStatus).toBe('RENEWED');
  });
});

import { describe, it, expect } from 'vitest';
import { tickVerticalIntegration } from '../../../../engine/systems/industry/VerticalIntegrationProcessor';
import { createMockGameState } from '../../../utils/mockFactories';
import { RandomGenerator } from '../../../../engine/utils/rng';
import { StreamerPlatform } from '@/engine/types';

describe('VerticalIntegrationProcessor', () => {
  it('emits FINANCE_TRANSACTION for player-owned platform', () => {
    const state = createMockGameState({ week: 10 });
    const playerPlatform: StreamerPlatform = {
      id: 'buy-player-streamer',
      name: 'Player Stream',
      archetype: 'streamer',
      foundedWeek: 1,
      parentBrand: 'Player',
      ownerId: state.studio.id,
      subscribers: 10_000_000,
      churnRate: 0.05,
      contentLibraryQuality: 60,
      marketingSpend: 2_000_000,
      marketShare: 0.15,
      reach: 70,
      subscriberHistory: [],
    };
    state.market.buyers = [playerPlatform];

    const rng = new RandomGenerator(42);
    const impacts = tickVerticalIntegration(state, rng);

    const financeTx = impacts.filter(i => i.type === 'FINANCE_TRANSACTION');
    expect(financeTx.length).toBeGreaterThanOrEqual(1);
    expect(financeTx[0].payload.description).toContain('Player Stream');
  });

  it('emits RIVAL_UPDATED for rival-owned platform', () => {
    const state = createMockGameState({ week: 10 });
    const rivalPlatform: StreamerPlatform = {
      id: 'buy-rival-streamer',
      name: 'Rival Stream',
      archetype: 'streamer',
      foundedWeek: 1,
      parentBrand: 'Rival',
      ownerId: 'rival-1',
      subscribers: 10_000_000,
      churnRate: 0.05,
      contentLibraryQuality: 60,
      marketingSpend: 2_000_000,
      marketShare: 0.15,
      reach: 70,
      subscriberHistory: [],
    };
    state.market.buyers = [rivalPlatform];
    state.entities.rivals['rival-1'] = {
      id: 'rival-1',
      name: 'Rival Studio',
      archetype: 'major',
      cash: 100_000_000,
      prestige: 50,
    } as any;

    const rng = new RandomGenerator(42);
    const impacts = tickVerticalIntegration(state, rng);

    const rivalUpdates = impacts.filter(i => i.type === 'RIVAL_UPDATED');
    expect(rivalUpdates.length).toBeGreaterThanOrEqual(1);
    expect(rivalUpdates[0].payload.rivalId).toBe('rival-1');
  });
});

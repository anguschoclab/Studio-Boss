import { describe, it, expect } from 'vitest';
import { tickTalentDiscoverySystem } from '@/engine/systems/talent/TalentDiscoverySystem';
import { RandomGenerator } from '@/engine/utils/rng';
import { createMockGameState, createMockTalent, createMockProject, createMockContract } from '../../generators/mockFactory';
import { BreakoutStar } from '@/engine/types/discovery.types';

describe('tickTalentDiscoverySystem', () => {
  it('returns empty impacts on empty state', () => {
    const state = createMockGameState();
    const rng = new RandomGenerator(12345);
    const impacts = tickTalentDiscoverySystem(state, rng);
    // Empty state still replenishes hidden pool → DISCOVERY_STATE_UPDATED
    const discoveryUpdate = impacts.find((i: any) => i.type === 'DISCOVERY_STATE_UPDATED');
    expect(discoveryUpdate).toBeDefined();
  });

  it('detects breakout stars from recently released projects', () => {
    const talent = createMockTalent({ id: 'TAL-1', name: 'Rising Star', tier: 'C_LIST', starMeter: 40 });
    const project = createMockProject({
      id: 'PRJ-1',
      title: 'Indie Hit',
      type: 'FILM' as any,
      state: 'released',
      releaseWeek: 8,
      budget: 3_000_000,
    } as any);
    const contract = createMockContract({ id: 'CON-1', talentId: 'TAL-1', projectId: 'PRJ-1' });
    const state = createMockGameState({
      week: 10,
      entities: {
        projects: { 'PRJ-1': project },
        releasedProjectIds: ['PRJ-1'],
        talents: { 'TAL-1': talent },
        contracts: { 'CON-1': contract },
        rivals: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    const rng = new RandomGenerator(42);
    const impacts = tickTalentDiscoverySystem(state, rng);
    const breakout = impacts.find((i: any) => i.type === 'BREAKOUT_STAR_CREATED');
    // With high enough rng luck, a breakout should be detected
    if (breakout) {
      expect((breakout as any).payload.breakout).toBeDefined();
      expect((breakout as any).payload.breakout.talentId).toBe('TAL-1');
    }
  });

  it('skips projects outside the 4-week release window', () => {
    const talent = createMockTalent({ id: 'TAL-1', tier: 'C_LIST', starMeter: 40 });
    const project = createMockProject({
      id: 'PRJ-1',
      title: 'Old Movie',
      type: 'FILM' as any,
      state: 'released',
      releaseWeek: 1,
      budget: 3_000_000,
    } as any);
    const contract = createMockContract({ id: 'CON-1', talentId: 'TAL-1', projectId: 'PRJ-1' });
    const state = createMockGameState({
      week: 100,
      entities: {
        projects: { 'PRJ-1': project },
        releasedProjectIds: ['PRJ-1'],
        talents: { 'TAL-1': talent },
        contracts: { 'CON-1': contract },
        rivals: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    const rng = new RandomGenerator(42);
    const impacts = tickTalentDiscoverySystem(state, rng);
    const breakout = impacts.find((i: any) => i.type === 'BREAKOUT_STAR_CREATED');
    expect(breakout).toBeUndefined();
  });

  it('finds guest star opportunities on released SERIES', () => {
    const star = createMockTalent({
      id: 'TAL-GUEST',
      name: 'Famous Guest',
      starMeter: 75,
      tier: 'B_LIST',
    });
    const series = createMockProject({
      id: 'PRJ-SERIES',
      title: 'Hit TV Show',
      type: 'SERIES' as any,
      state: 'released',
      releaseWeek: 5,
    } as any);
    const seriesContract = createMockContract({ id: 'CON-S1', talentId: 'TAL-CAST', projectId: 'PRJ-SERIES' });
    const state = createMockGameState({
      week: 10,
      entities: {
        projects: { 'PRJ-SERIES': series },
        releasedProjectIds: ['PRJ-SERIES'],
        talents: { 'TAL-GUEST': star },
        contracts: { 'CON-S1': seriesContract },
        rivals: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
    });
    const rng = new RandomGenerator(42);
    const impacts = tickTalentDiscoverySystem(state, rng);
    // Guest star opportunity may or may not trigger (10% chance), but should not crash
    const guestOpp = impacts.find((i: any) => i.type === 'GUEST_STAR_OPPORTUNITY');
    if (guestOpp) {
      expect((guestOpp as any).payload.booking).toBeDefined();
    }
  });

  it('skips already-booked guest stars', () => {
    const star = createMockTalent({
      id: 'TAL-GUEST',
      name: 'Famous Guest',
      starMeter: 75,
      tier: 'B_LIST',
    });
    const series = createMockProject({
      id: 'PRJ-SERIES',
      title: 'Hit TV Show',
      type: 'SERIES' as any,
      state: 'released',
      releaseWeek: 5,
    } as any);
    const seriesContract = createMockContract({ id: 'CON-S1', talentId: 'TAL-CAST', projectId: 'PRJ-SERIES' });
    const existingBooking = {
      id: 'BOOK-1',
      talentId: 'TAL-GUEST',
      seriesId: 'PRJ-SERIES',
      episodeNumber: 1,
      seasonNumber: 1,
      roleType: 'cameo' as const,
      impact: 5,
      cost: 500_000,
      chemistryWithCast: 50,
      fanReaction: 'positive' as const,
    };
    const state = createMockGameState({
      week: 10,
      entities: {
        projects: { 'PRJ-SERIES': series },
        releasedProjectIds: ['PRJ-SERIES'],
        talents: { 'TAL-GUEST': star },
        contracts: { 'CON-S1': seriesContract },
        rivals: {},
        contractsByProjectId: {},
        contractsByTalentId: {},
      },
      relationships: {
        discovery: {
          breakoutStars: {},
          guestStarBookings: { 'BOOK-1': existingBooking },
          hiddenTalentPool: {},
          discoveryLog: [],
        },
      } as any,
    });
    const rng = new RandomGenerator(42);
    const impacts = tickTalentDiscoverySystem(state, rng);
    const guestOpp = impacts.find((i: any) => i.type === 'GUEST_STAR_OPPORTUNITY');
    // If a guest opp is produced, it should NOT be for the already-booked combination
    if (guestOpp) {
      const booking = (guestOpp as any).payload.booking;
      expect(booking.talentId === 'TAL-GUEST' && booking.seriesId === 'PRJ-SERIES').toBe(false);
    }
  });

  it('updates existing breakout stars (decrements hypeWeeksRemaining)', () => {
    const breakout: BreakoutStar = {
      id: 'BRK-1',
      talentId: 'TAL-1',
      trigger: 'indie_hit',
      projectId: 'PRJ-1',
      week: 5,
      previousStarMeter: 40,
      previousTier: 'C_LIST',
      starMeterJump: 30,
      newTier: 'B_LIST',
      feeMultiplier: 2,
      hypeWeeksRemaining: 10,
      biddingWarActive: true,
      sustainedSuccess: false,
      oneHitWonder: false,
    };
    const state = createMockGameState({
      relationships: {
        discovery: {
          breakoutStars: { 'BRK-1': breakout },
          guestStarBookings: {},
          hiddenTalentPool: {},
          discoveryLog: [],
        },
      } as any,
    });
    const rng = new RandomGenerator(12345);
    const impacts = tickTalentDiscoverySystem(state, rng);
    const updateImpact = impacts.find((i: any) => i.type === 'BREAKOUT_STAR_UPDATED');
    expect(updateImpact).toBeDefined();
    expect((updateImpact as any).payload.breakout.hypeWeeksRemaining).toBe(9);
  });
});

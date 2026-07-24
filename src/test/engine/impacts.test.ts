import { describe, it, expect } from 'vitest';
import { impacts } from '@/engine/core/impacts';
import type { StateImpact, HeadlineCategory } from '@/engine/types';

describe('typed impact constructors', () => {
  // ── newsAdded ──
  it('newsAdded builds a NEWS_ADDED impact', () => {
    const i = impacts.newsAdded({ headline: 'H', description: 'D', category: 'market' });
    expect(i.type).toBe('NEWS_ADDED');
    expect(i.payload.headline).toBe('H');
    expect(i.payload.description).toBe('D');
    expect(i.payload.category).toBe('market');
  });

  it('newsAdded accepts all 13 HeadlineCategory values', () => {
    const categories: HeadlineCategory[] = [
      'rival', 'market', 'talent', 'awards', 'general',
      'rumor', 'scandal', 'box_office', 'business', 'industry',
      'cancellation', 'festival', 'development',
    ];
    for (const c of categories) {
      const i = impacts.newsAdded({ headline: 'X', category: c });
      expect(i.payload.category).toBe(c);
    }
  });

  it('newsAdded accepts optional id and publication', () => {
    const i = impacts.newsAdded({ headline: 'H', id: 'n1', publication: 'Variety' });
    expect(i.payload.id).toBe('n1');
    expect(i.payload.publication).toBe('Variety');
  });

  it('newsAdded works with only headline (minimum required field)', () => {
    const i = impacts.newsAdded({ headline: 'H' });
    expect(i.type).toBe('NEWS_ADDED');
    expect(i.payload.headline).toBe('H');
    expect(i.payload.description).toBeUndefined();
    expect(i.payload.category).toBeUndefined();
  });

  // ── fundsDeducted ──
  it('fundsDeducted builds a FUNDS_DEDUCTED impact', () => {
    const i = impacts.fundsDeducted(500);
    expect(i.type).toBe('FUNDS_DEDUCTED');
    expect(i.payload!.amount).toBe(500);
  });

  // ── fundsChanged ──
  it('fundsChanged builds a FUNDS_CHANGED impact', () => {
    const i = impacts.fundsChanged(500);
    expect(i.type).toBe('FUNDS_CHANGED');
    expect(i.payload.amount).toBe(500);
  });

  it('fundsChanged accepts negative amounts', () => {
    const i = impacts.fundsChanged(-100);
    expect(i.payload.amount).toBe(-100);
  });

  // ── rivalUpdated ──
  it('rivalUpdated carries rivalId and a partial update', () => {
    const i = impacts.rivalUpdated('r1', { cash: 10 });
    expect(i.type).toBe('RIVAL_UPDATED');
    expect(i.payload.rivalId).toBe('r1');
    expect(i.payload.update.cash).toBe(10);
  });

  it('rivalUpdated works with empty update object', () => {
    const i = impacts.rivalUpdated('r1', {});
    expect(i.payload.rivalId).toBe('r1');
    expect(i.payload.update).toEqual({});
  });

  // ── franchiseUpdated ──
  it('franchiseUpdated carries franchiseId and update', () => {
    const i = impacts.franchiseUpdated('f1', { ownerId: 'PLAYER' });
    expect(i.type).toBe('FRANCHISE_UPDATED');
    expect(i.payload.franchiseId).toBe('f1');
    expect(i.payload.update.ownerId).toBe('PLAYER');
  });

  // ── industryUpdate ──
  it('industryUpdate takes dot-path keys from the state root', () => {
    const i = impacts.industryUpdate({ 'ip.vault': [] });
    expect(i.type).toBe('INDUSTRY_UPDATE');
    expect(i.payload.update!['ip.vault']).toEqual([]);
  });

  it('industryUpdate accepts mergedRivalId and acquirerId', () => {
    const i = impacts.industryUpdate({}, { mergedRivalId: 'r1', acquirerId: 'r2' });
    expect(i.payload.mergedRivalId).toBe('r1');
    expect(i.payload.acquirerId).toBe('r2');
  });

  it('industryUpdate accepts bankruptRivalId', () => {
    const i = impacts.industryUpdate({}, { bankruptRivalId: 'r1' });
    expect(i.payload.bankruptRivalId).toBe('r1');
  });

  it('industryUpdate works with empty update record', () => {
    const i = impacts.industryUpdate({});
    expect(i.type).toBe('INDUSTRY_UPDATE');
    expect(i.payload.update).toEqual({});
  });

  // ── modalTriggered ──
  it('modalTriggered defaults priority and passes a payload through', () => {
    const i = impacts.modalTriggered('CRISIS', { projectId: 'p1' });
    expect(i.type).toBe('MODAL_TRIGGERED');
    expect(i.payload.modalType).toBe('CRISIS');
    expect(typeof i.payload.priority).toBe('number');
    expect((i.payload.payload as { projectId: string }).projectId).toBe('p1');
  });

  it('modalTriggered with no payload defaults to empty object', () => {
    const i = impacts.modalTriggered('SUMMARY');
    expect(i.payload.modalType).toBe('SUMMARY');
    expect(i.payload.payload).toEqual({});
  });

  it('modalTriggered accepts custom priority', () => {
    const i = impacts.modalTriggered('CRISIS', {}, 5);
    expect(i.payload.priority).toBe(5);
  });

  // ── projectUpdated ──
  it('projectUpdated carries projectId and update', () => {
    const i = impacts.projectUpdated('p1', { state: 'archived' });
    expect(i.type).toBe('PROJECT_UPDATED');
    expect(i.payload.projectId).toBe('p1');
    expect(i.payload.update.state).toBe('archived');
  });

  // ── buyerUpdated ──
  it('buyerUpdated carries buyerId and update', () => {
    const i = impacts.buyerUpdated('b1', { ownerId: undefined });
    expect(i.type).toBe('BUYER_UPDATED');
    expect(i.payload.buyerId).toBe('b1');
    expect(i.payload.update.ownerId).toBeUndefined();
  });

  // ── prestigeChanged ──
  it('prestigeChanged builds a PRESTIGE_CHANGED impact', () => {
    const i = impacts.prestigeChanged(15);
    expect(i.type).toBe('PRESTIGE_CHANGED');
    expect(i.payload.amount).toBe(15);
  });

  it('prestigeChanged accepts negative amounts', () => {
    const i = impacts.prestigeChanged(-10);
    expect(i.payload.amount).toBe(-10);
  });

  // ── talentUpdated ──
  it('talentUpdated carries talentId and update', () => {
    const i = impacts.talentUpdated('t1', { razzieWinner: true });
    expect(i.type).toBe('TALENT_UPDATED');
    expect(i.payload.talentId).toBe('t1');
    expect(i.payload.update.razzieWinner).toBe(true);
  });

  // ── awardWon ──
  it('awardWon carries projectId and award', () => {
    const award = {
      id: 'a1',
      projectId: 'p1',
      name: 'Best Picture',
      category: 'Best Picture',
      body: 'Academy Awards',
      status: 'won' as const,
      year: 2026,
    };
    const i = impacts.awardWon('p1', award);
    expect(i.type).toBe('AWARD_WON');
    expect(i.payload.projectId).toBe('p1');
    expect(i.payload.award.name).toBe('Best Picture');
  });

  // ── Type-level compile checks ──
  it('all constructors return values assignable to StateImpact', () => {
    const _check: StateImpact[] = [
      impacts.newsAdded({ headline: 'H' }),
      impacts.fundsDeducted(100),
      impacts.fundsChanged(100),
      impacts.rivalUpdated('r1', { cash: 10 }),
      impacts.franchiseUpdated('f1', { ownerId: 'P' }),
      impacts.industryUpdate({ 'ip.vault': [] }),
      impacts.industryUpdate({}, { mergedRivalId: 'r1', acquirerId: 'r2' }),
      impacts.modalTriggered('CRISIS'),
      impacts.projectUpdated('p1', { state: 'archived' }),
      impacts.buyerUpdated('b1', { ownerId: undefined }),
      impacts.prestigeChanged(10),
      impacts.talentUpdated('t1', { razzieWinner: true }),
      impacts.awardWon('p1', {
        id: 'a1', projectId: 'p1', name: 'N', category: 'C',
        body: 'Academy Awards', status: 'won', year: 2026,
      }),
    ];
    expect(_check.length).toBe(13);
  });
});

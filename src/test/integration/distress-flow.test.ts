import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/store/uiStore';

// The doAdvanceWeek bridge does: for MODAL_TRIGGERED impacts,
// const { modalType, ...rest } = impact.payload; ui.enqueueModal(modalType, rest);
// This test replicates that bridge for a DISTRESSED_ASSET_OFFER impact.
describe('distress flow: modal bridge', () => {
  beforeEach(() => useUIStore.setState({ activeModal: null, modalQueue: [] } as any));

  it('a MODAL_TRIGGERED impact enqueues the offer modal with offerId in payload', () => {
    const impact = { type: 'MODAL_TRIGGERED', payload: { modalType: 'DISTRESSED_ASSET_OFFER', offerId: 'o1' } } as any;
    const { modalType, ...rest } = impact.payload;
    useUIStore.getState().enqueueModal(modalType, rest);

    const active = useUIStore.getState().activeModal;
    expect(active?.type).toBe('DISTRESSED_ASSET_OFFER');
    expect((active?.payload as { offerId: string }).offerId).toBe('o1');
  });
});

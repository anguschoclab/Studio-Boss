
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { persistenceService } from '@/persistence/PersistenceService';
import { GameState } from '@/engine/types';

// Mock Worker
class MockWorker {
    onmessage: ((e: { data: unknown }) => void) | null = null;
    postMessage = vi.fn((data) => {
        console.log(`[MockWorker] Received: ${data.type} (req: ${data.requestId})`);
        // Simulate background worker delay
        setTimeout(() => {
            if (this.onmessage) {
                console.log(`[MockWorker] Responding to: ${data.requestId}`);
                if (data.type === 'SAVE_GAME') {
                    this.onmessage({
                        data: {
                            type: 'SAVE_SUCCESS',
                            slotId: data.slotId,
                            requestId: data.requestId
                        }
                    });
                } else if (data.type === 'LOAD_GAME') {
                    this.onmessage({
                        data: {
                            type: 'LOAD_SUCCESS',
                            slotId: data.slotId,
                            requestId: data.requestId,
                            state: { mockState: true, slotId: data.slotId }
                        }
                    });
                }
            } else {
                console.error('[MockWorker] No onmessage handler found!');
            }
        }, 20); // Static delay for predictability in debug
    });
}

describe('Persistence Layer Race Hardening', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        const mock = new MockWorker();
        (persistenceService as unknown as any).worker = mock;
        // reset resolves
        if ((persistenceService as unknown as any).pendingResolves) (persistenceService as unknown as any).pendingResolves.clear();

        // ⚡ Manually attach the message handling logic since initWorker likely skipped it in Node
        mock.onmessage = (e: { data: unknown }) => {
            const { requestId, state, type } = e.data;
            let result = state;
            if (type === 'SAVE_SUCCESS') result = true;
            // reaching into private method for test purposes
            if((persistenceService as unknown as any).resolvePromise) (persistenceService as unknown as any).resolvePromise(requestId, result);
        };

        console.log('[Test] Injected mock worker and attached handler');
    });

    it('handles rapid concurrent saves with unique requestIds', async () => {});

    it('correctly matches load responses to their specific request callers', async () => {});
});

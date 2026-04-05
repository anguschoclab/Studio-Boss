import { describe, it, expect, vi, beforeEach } from 'vitest';
import { persistenceService } from '@/persistence/PersistenceService';

// Mock Worker
class MockWorker {
    onmessage: ((e: any) => void) | null = null;
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
        // @ts-ignore
        persistenceService.worker = mock;
        // @ts-ignore - reset resolves
        persistenceService.pendingResolves.clear();

        // ⚡ Manually attach the message handling logic since initWorker likely skipped it in Node
        // @ts-ignore
        mock.onmessage = (e: any) => {
            const { requestId, state, type } = e.data;
            let result = state;
            if (type === 'SAVE_SUCCESS') result = true;
            // @ts-ignore - reaching into private method for test purposes
            persistenceService.resolvePromise(requestId, result);
        };

        console.log('[Test] Injected mock worker and attached handler');
    });

    it('handles rapid concurrent saves with unique requestIds', async () => {
        console.log('[Test] Starting rapid save test');
        const results = await Promise.all([
            persistenceService.save(0, { v: 1 }),
            persistenceService.save(0, { v: 2 }),
            persistenceService.save(0, { v: 3 })
        ]);
        console.log('[Test] Save results received:', results);

        expect(results).toEqual([true, true, true]);
        // @ts-ignore
        expect(persistenceService.worker.postMessage).toHaveBeenCalledTimes(3);
        
        // Ensure request IDs were unique in the calls
        // @ts-ignore
        const firstId = persistenceService.worker.postMessage.mock.calls[0][0].requestId;
        // @ts-ignore
        const secondId = persistenceService.worker.postMessage.mock.calls[1][0].requestId;
        expect(firstId).not.toBe(secondId);
    });

    it('correctly matches load responses to their specific request callers', async () => {
        // We trigger two loads for different slots
        const load1 = persistenceService.load(0);
        const load2 = persistenceService.load(1);

        const [res1, res2] = await Promise.all([load1, load2]);

        expect(res1.slotId).toBe(0);
        expect(res2.slotId).toBe(1);
    });
});

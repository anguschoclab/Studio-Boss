import { describe, it, expect, vi, beforeEach } from 'vitest';
import { persistenceService } from '@/persistence/PersistenceService';

// Mock Worker
class MockWorker {
    onmessage: ((e: any) => void) | null = null;
    postMessage = vi.fn((data) => {
        // Simulate background worker delay
        setTimeout(() => {
            if (this.onmessage) {
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
            }
        }, Math.random() * 50); // Random delay to force race
    });
}

describe('Persistence Layer Race Hardening', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // @ts-ignore - inject mock worker
        persistenceService.worker = new MockWorker();
        // @ts-ignore - reach inside to reset
        persistenceService.pendingResolves.clear();
    });

    it('handles rapid concurrent saves with unique requestIds', async () => {
        const results = await Promise.all([
            persistenceService.save(0, { v: 1 }),
            persistenceService.save(0, { v: 2 }),
            persistenceService.save(0, { v: 3 })
        ]);

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

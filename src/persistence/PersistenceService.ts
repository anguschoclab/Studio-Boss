/**
 * Studio Boss - Persistence Service (Core API)
 *
 * This layer handles communication with the OPFS Save Worker.
 * It manages the lifecycle of the Background I/O and exposes
 * an asynchronous interface to the Redux/Zustand store.
 */

class PersistenceService {
  private worker: Worker | null = null;
  private pendingResolves: Map<string, { resolve: (data: any) => void; slotId: string | number }> = new Map();
  private lastRequestId = 0;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window !== 'undefined' && 'Worker' in window) {
      this.worker = new Worker(new URL('./saveWorker.ts', import.meta.url), {
        type: 'module',
      });

      this.worker.onmessage = (e: MessageEvent) => {
        const { type, slotId, requestId, state, message } = e.data;

        if (type === 'SAVE_SUCCESS') {
          console.log(`[PersistenceService] Save successful: ${slotId} (req: ${requestId})`);
          this.resolvePromise(requestId, true);
        } else if (type === 'LOAD_SUCCESS') {
          console.log(`[PersistenceService] Load successful: ${slotId} (req: ${requestId})`);
          this.resolvePromise(requestId, state);
        } else if (type === 'ERROR') {
          console.error(`[PersistenceService] Worker error: ${message} (req: ${requestId})`);
          this.resolvePromise(requestId, null);
        }
      };
    }
  }

  private resolvePromise(requestId: string, result: any) {
    const entry = this.pendingResolves.get(requestId);
    if (entry) {
      entry.resolve(result);
      this.pendingResolves.delete(requestId);
    }
  }

  private generateRequestId(): string {
    return `req_${++this.lastRequestId}_${Date.now()}`;
  }

  /**
   * Save the current game state.
   * Note: The store should ideally debounce/throttle this.
   */
  async save(slotId: string | number, state: any): Promise<boolean> {
    if (!this.worker) return false;

    const requestId = this.generateRequestId();

    return new Promise((resolve) => {
      this.pendingResolves.set(requestId, { resolve, slotId });
      this.worker?.postMessage({
        type: 'SAVE_GAME',
        slotId,
        requestId,
        state
      });
    });
  }

  /**
   * Load a game state from a named slot.
   */
  async load(slotId: string | number): Promise<any | null> {
    if (!this.worker) return null;

    const requestId = this.generateRequestId();

    return new Promise((resolve) => {
      this.pendingResolves.set(requestId, { resolve, slotId });
      this.worker?.postMessage({
        type: 'LOAD_GAME',
        slotId,
        requestId
      });
    });
  }

  /**
   * Checks if a save slot exists.
   */
  async exists(slotId: string | number): Promise<boolean> {
    try {
      const root = await navigator.storage.getDirectory();
      await root.getFileHandle(`slot_${slotId}.sb`);
      return true;
    } catch {
      return false;
    }
  }
}

export const persistenceService = new PersistenceService();

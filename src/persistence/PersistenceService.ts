/**
 * Studio Boss - Persistence Service (Core API)
 *
 * This layer handles communication with the OPFS Save Worker.
 * It manages the lifecycle of the Background I/O and exposes
 * an asynchronous interface to the Redux/Zustand store.
 */

class PersistenceService {
  private worker: Worker | null = null;
  private pendingPromises: Map<number, { resolve: (data: any) => void; reject: (err: Error) => void }> = new Map();
  private requestCounter = 0;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window !== 'undefined' && 'Worker' in window) {
      // Vite handles ?worker imports
      this.worker = new Worker(new URL('./saveWorker.ts', import.meta.url), {
        type: 'module',
      });

      this.worker.onmessage = (e: MessageEvent) => {
        const { type, requestId, state, message } = e.data;

        const pending = this.pendingPromises.get(requestId);
        if (!pending) return;
        this.pendingPromises.delete(requestId);

        if (type === 'SAVE_SUCCESS') {
          console.log(`[PersistenceService] Save successful (requestId: ${requestId})`);
          pending.resolve(true);
        } else if (type === 'LOAD_SUCCESS') {
          console.log(`[PersistenceService] Load successful (requestId: ${requestId})`);
          pending.resolve(state);
        } else if (type === 'ERROR') {
          console.error(`[PersistenceService] Worker error (requestId: ${requestId}): ${message}`);
          pending.reject(new Error(message));
        }
      };
    }
  }

  /**
   * Save the current game state to a named slot (.sb file).
   */
  async save(slotId: string | number, state: any): Promise<boolean> {
    if (!this.worker) return false;

    const requestId = ++this.requestCounter;
    return new Promise((resolve, reject) => {
      this.pendingPromises.set(requestId, { resolve, reject });
      this.worker?.postMessage({
        type: 'SAVE_GAME',
        slotId,
        state,
        requestId,
      });
    });
  }

  /**
   * Load a game state from a named slot.
   */
  async load(slotId: string | number): Promise<any | null> {
    if (!this.worker) return null;

    const requestId = ++this.requestCounter;
    return new Promise((resolve, reject) => {
      this.pendingPromises.set(requestId, { resolve, reject });
      this.worker?.postMessage({
        type: 'LOAD_GAME',
        slotId,
        requestId,
      });
    });
  }

  /**
   * Checks if a save slot exists (TBD: OPFS list files)
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

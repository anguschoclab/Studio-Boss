/**
 * Studio Boss - Persistence Service (Core API)
 *
 * This layer handles communication with the OPFS Save Worker.
 * It manages the lifecycle of the Background I/O and exposes
 * an asynchronous interface to the Redux/Zustand store.
 */

class PersistenceService {
  private worker: Worker | null = null;
  private pendingResolves: Map<string, (data: any) => void> = new Map();

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
        const { type, slotId, state, message } = e.data;

        if (type === 'SAVE_SUCCESS') {
          console.log(`[PersistenceService] Save successful: ${slotId}`);
          this.resolvePromise(`save_${slotId}`, true);
        } else if (type === 'LOAD_SUCCESS') {
          console.log(`[PersistenceService] Load successful: ${slotId}`);
          this.resolvePromise(`load_${slotId}`, state);
        } else if (type === 'ERROR') {
          console.error(`[PersistenceService] Worker error: ${message}`);
          this.resolvePromise(`error`, message);
        }
      };
    }
  }

  private resolvePromise(key: string, result: any) {
    const resolve = this.pendingResolves.get(key);
    if (resolve) {
      resolve(result);
      this.pendingResolves.delete(key);
    }
  }

  /**
   * Save the current game state to a named slot (.sb file).
   */
  async save(slotId: string | number, state: any): Promise<boolean> {
    if (!this.worker) return false;

    return new Promise((resolve) => {
      this.pendingResolves.set(`save_${slotId}`, resolve);
      this.worker?.postMessage({
        type: 'SAVE_GAME',
        slotId,
        state
      });
    });
  }

  /**
   * Load a game state from a named slot.
   */
  async load(slotId: string | number): Promise<any | null> {
    if (!this.worker) return null;

    return new Promise((resolve) => {
      this.pendingResolves.set(`load_${slotId}`, resolve);
      this.worker?.postMessage({
        type: 'LOAD_GAME',
        slotId
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

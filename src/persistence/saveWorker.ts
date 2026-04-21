/**
 * Studio Boss - OPFS Save Worker
 *
 * This worker handles background serialization and high-performance synchronous
 * disk I/O using Origin Private File System (OPFS).
 */

self.onmessage = async (e: MessageEvent) => {
  const { type, slotId, state } = e.data;

  try {
    if (type === 'SAVE_GAME') {
      await handleSave(slotId, state);
      self.postMessage({ type: 'SAVE_SUCCESS', slotId });
    } else if (type === 'LOAD_GAME') {
      const loadedState = await handleLoad(slotId);
      self.postMessage({ type: 'LOAD_SUCCESS', slotId, state: loadedState });
    }
  } catch (error) {
    console.error(`SaveWorker Error [${type}]:`, error);
    self.postMessage({ type: 'ERROR', message: (error as Error).message });
  }
};

async function handleSave(slotId: string | number, state: any) {
  const root = await navigator.storage.getDirectory();
  const fileHandle = await root.getFileHandle(`slot_${slotId}.sb`, { create: true });

  // @ts-ignore - createSyncAccessHandle is only in Workers
  const accessHandle = await fileHandle.createSyncAccessHandle();

  try {
    // 1. Off-thread serialization
    const encoder = new TextEncoder();
    const buffer = encoder.encode(JSON.stringify(state));

    // 2. Synchronous high-speed write
    accessHandle.truncate(0);
    accessHandle.write(buffer, { at: 0 });
    accessHandle.flush();
  } finally {
    accessHandle.close();
  }
}

async function handleLoad(slotId: string | number) {
  const root = await navigator.storage.getDirectory();
  const fileHandle = await root.getFileHandle(`slot_${slotId}.sb`);

  // @ts-ignore - createSyncAccessHandle is only in Workers
  const accessHandle = await fileHandle.createSyncAccessHandle();

  try {
    const fileSize = accessHandle.getSize();
    const buffer = new DataView(new ArrayBuffer(fileSize));
    accessHandle.read(buffer, { at: 0 });

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(buffer));
  } finally {
    accessHandle.close();
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Studio Boss - OPFS Save Worker
 *
 * This worker handles background serialization and high-performance synchronous
 * disk I/O using Origin Private File System (OPFS).
 */

import { parseAndValidate } from "./saveSchema";

self.onmessage = async (e: MessageEvent) => {
  const { type, slotId, state, requestId } = e.data;

  try {
    if (type === "SAVE_GAME") {
      await handleSave(slotId, state);
      self.postMessage({ type: "SAVE_SUCCESS", slotId, requestId });
    } else if (type === "LOAD_GAME") {
      const loadedState = await handleLoad(slotId);
      self.postMessage({ type: "LOAD_SUCCESS", slotId, state: loadedState, requestId });
    }
  } catch (error) {
    console.error(`SaveWorker Error [${type}]:`, error);
    self.postMessage({ type: "ERROR", message: (error as Error).message, requestId });
  }
};

async function handleSave(slotId: string | number, state: any) {
  const root = await navigator.storage.getDirectory();
  const fileHandle = await root.getFileHandle(`slot_${slotId}.sb`, { create: true });

  // @ts-expect-error - createSyncAccessHandle is only in Workers
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

export async function handleLoad(slotId: string | number) {
  const root = await navigator.storage.getDirectory();
  const fileHandle = await root.getFileHandle(`slot_${slotId}.sb`);

  // @ts-expect-error - createSyncAccessHandle is only in Workers
  const accessHandle = await fileHandle.createSyncAccessHandle();

  try {
    const fileSize = accessHandle.getSize();
    const buffer = new DataView(new ArrayBuffer(fileSize));
    accessHandle.read(buffer, { at: 0 });

    const decoder = new TextDecoder();
    const result = parseAndValidate(decoder.decode(buffer));
    if (!result.success) {
      throw new Error(`Save validation failed: ${result.error}`);
    }
    return result.data;
  } finally {
    accessHandle.close();
  }
}

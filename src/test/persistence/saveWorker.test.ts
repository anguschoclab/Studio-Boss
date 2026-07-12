import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initializeGame } from '../../engine/core/gameInit';

// Mock the OPFS APIs that saveWorker uses
function createMockAccessHandle(fileContent: string) {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(fileContent);
  return {
    getSize: () => buffer.length,
    read: (dataView: DataView, opts?: { at: number }) => {
      const offset = opts?.at ?? 0;
      for (let i = 0; i < buffer.length; i++) {
        dataView.setInt8(offset + i, buffer[i]);
      }
    },
    write: vi.fn(),
    truncate: vi.fn(),
    flush: vi.fn(),
    close: vi.fn(),
  };
}

function createMockRoot(fileContent: string) {
  return {
    getFileHandle: vi.fn().mockResolvedValue({
      createSyncAccessHandle: vi.fn().mockResolvedValue(createMockAccessHandle(fileContent)),
    }),
  };
}

describe('saveWorker handleLoad with validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('returns parsed + validated state for valid save data', async () => {
    const validState = initializeGame('Worker Test Studio', 'indie');
    const fileContent = JSON.stringify(validState);

    const mockRoot = createMockRoot(fileContent);
    (navigator as any).storage = { getDirectory: vi.fn().mockResolvedValue(mockRoot) };

    try {
      const { handleLoad } = await import('../../persistence/saveWorker');
      const result = await handleLoad(0);
      expect(result).toBeTruthy();
      expect((result as any).studio.name).toBe('Worker Test Studio');
    } finally {
      delete (navigator as any).storage;
    }
  });

  it('throws error for corrupt JSON in OPFS', async () => {
    const fileContent = '{corrupt json!!!';

    const mockRoot = createMockRoot(fileContent);
    (navigator as any).storage = { getDirectory: vi.fn().mockResolvedValue(mockRoot) };

    try {
      const { handleLoad } = await import('../../persistence/saveWorker');
      await expect(handleLoad(0)).rejects.toThrow();
    } finally {
      delete (navigator as any).storage;
    }
  });

  it('throws error for valid JSON but invalid save shape', async () => {
    const fileContent = JSON.stringify({ hello: 'world', not: 'a save file' });

    const mockRoot = createMockRoot(fileContent);
    (navigator as any).storage = { getDirectory: vi.fn().mockResolvedValue(mockRoot) };

    try {
      const { handleLoad } = await import('../../persistence/saveWorker');
      await expect(handleLoad(0)).rejects.toThrow();
    } finally {
      delete (navigator as any).storage;
    }
  });

  it('strips prototype pollution payload from OPFS file', async () => {
    const validState = initializeGame('Proto Test', 'mid-tier');
    // Inject __proto__ pollution into the JSON string directly
    const fileContent = JSON.stringify(validState).replace(
      '"week":1,',
      '"week":1,"__proto__":{"polluted":true},'
    );

    const mockRoot = createMockRoot(fileContent);
    (navigator as any).storage = { getDirectory: vi.fn().mockResolvedValue(mockRoot) };

    try {
      const { handleLoad } = await import('../../persistence/saveWorker');
      const result = await handleLoad(0);
      expect(result).toBeTruthy();
      expect(Object.keys(result as any)).not.toContain('__proto__');
      expect((result as any).hasOwnProperty('__proto__')).toBe(false);
      expect((Object.prototype as any).polluted).toBeUndefined();
    } finally {
      delete (navigator as any).storage;
    }
  });
});

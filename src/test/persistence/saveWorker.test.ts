import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { initializeGame } from "../../engine/core/gameInit";

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

function createMockWriteRoot() {
  const accessHandle = {
    getSize: () => 0,
    read: vi.fn(),
    write: vi.fn(),
    truncate: vi.fn(),
    flush: vi.fn(),
    close: vi.fn(),
  };
  const root = {
    getFileHandle: vi.fn().mockResolvedValue({
      createSyncAccessHandle: vi.fn().mockResolvedValue(accessHandle),
    }),
  };
  return { root, accessHandle };
}

describe("saveWorker handleLoad with validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns parsed + validated state for valid save data", async () => {
    const validState = initializeGame("Worker Test Studio", "indie");
    const fileContent = JSON.stringify(validState);

    const mockRoot = createMockRoot(fileContent);
    (navigator as any).storage = { getDirectory: vi.fn().mockResolvedValue(mockRoot) };

    try {
      const { handleLoad } = await import("../../persistence/saveWorker");
      const result = await handleLoad(0);
      expect(result).toBeTruthy();
      expect((result as any).studio.name).toBe("Worker Test Studio");
    } finally {
      delete (navigator as any).storage;
    }
  });

  it("throws error for corrupt JSON in OPFS", async () => {
    const fileContent = "{corrupt json!!!";

    const mockRoot = createMockRoot(fileContent);
    (navigator as any).storage = { getDirectory: vi.fn().mockResolvedValue(mockRoot) };

    try {
      const { handleLoad } = await import("../../persistence/saveWorker");
      await expect(handleLoad(0)).rejects.toThrow();
    } finally {
      delete (navigator as any).storage;
    }
  });

  it("throws error for valid JSON but invalid save shape", async () => {
    const fileContent = JSON.stringify({ hello: "world", not: "a save file" });

    const mockRoot = createMockRoot(fileContent);
    (navigator as any).storage = { getDirectory: vi.fn().mockResolvedValue(mockRoot) };

    try {
      const { handleLoad } = await import("../../persistence/saveWorker");
      await expect(handleLoad(0)).rejects.toThrow();
    } finally {
      delete (navigator as any).storage;
    }
  });

  it("strips prototype pollution payload from OPFS file", async () => {
    const validState = initializeGame("Proto Test", "mid-tier");
    // Inject __proto__ pollution into the JSON string directly
    const fileContent = JSON.stringify(validState).replace(
      '"week":1,',
      '"week":1,"__proto__":{"polluted":true},'
    );

    const mockRoot = createMockRoot(fileContent);
    (navigator as any).storage = { getDirectory: vi.fn().mockResolvedValue(mockRoot) };

    try {
      const { handleLoad } = await import("../../persistence/saveWorker");
      const result = await handleLoad(0);
      expect(result).toBeTruthy();
      expect(Object.keys(result as any)).not.toContain("__proto__");
      expect(Object.prototype.hasOwnProperty.call(result, "__proto__")).toBe(false);
      expect((Object.prototype as any).polluted).toBeUndefined();
    } finally {
      delete (navigator as any).storage;
    }
  });
});

describe("saveWorker onmessage dispatch", () => {
  let postMessage: ReturnType<typeof vi.fn>;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    postMessage = vi.fn();
    (self as any).postMessage = postMessage;
    // The handler console.errors on failures — silence expected noise.
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    delete (navigator as any).storage;
    delete (self as any).postMessage;
    consoleSpy.mockRestore();
  });

  it("responds SAVE_SUCCESS after writing state to OPFS", async () => {
    const { root, accessHandle } = createMockWriteRoot();
    (navigator as any).storage = { getDirectory: vi.fn().mockResolvedValue(root) };

    await import("../../persistence/saveWorker");
    const state = initializeGame("Dispatch Studio", "indie");
    await (self as any).onmessage({
      data: { type: "SAVE_GAME", slotId: 0, state, requestId: "req-1" },
    });

    expect(root.getFileHandle).toHaveBeenCalledWith("slot_0.sb", { create: true });
    expect(accessHandle.truncate).toHaveBeenCalledWith(0);
    expect(accessHandle.write).toHaveBeenCalled();
    expect(accessHandle.flush).toHaveBeenCalled();
    expect(accessHandle.close).toHaveBeenCalled();
    expect(postMessage).toHaveBeenCalledWith({
      type: "SAVE_SUCCESS",
      slotId: 0,
      requestId: "req-1",
    });
  });

  it("responds ERROR when OPFS is unavailable during save", async () => {
    (navigator as any).storage = {
      getDirectory: vi.fn().mockRejectedValue(new Error("OPFS down")),
    };

    await import("../../persistence/saveWorker");
    await (self as any).onmessage({
      data: { type: "SAVE_GAME", slotId: 0, state: {}, requestId: "req-2" },
    });

    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "ERROR", requestId: "req-2" })
    );
  });

  it("responds LOAD_SUCCESS with parsed state for a valid save file", async () => {
    const validState = initializeGame("Load Studio", "indie");
    const mockRoot = createMockRoot(JSON.stringify(validState));
    (navigator as any).storage = { getDirectory: vi.fn().mockResolvedValue(mockRoot) };

    await import("../../persistence/saveWorker");
    await (self as any).onmessage({
      data: { type: "LOAD_GAME", slotId: 1, requestId: "req-3" },
    });

    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "LOAD_SUCCESS", slotId: 1, requestId: "req-3" })
    );
    const payload = postMessage.mock.calls[0][0];
    expect(payload.state.studio.name).toBe("Load Studio");
  });

  it("responds ERROR when loading a corrupt save file", async () => {
    const mockRoot = createMockRoot("{corrupt json!!!");
    (navigator as any).storage = { getDirectory: vi.fn().mockResolvedValue(mockRoot) };

    await import("../../persistence/saveWorker");
    await (self as any).onmessage({
      data: { type: "LOAD_GAME", slotId: 0, requestId: "req-4" },
    });

    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "ERROR", requestId: "req-4" })
    );
  });
});

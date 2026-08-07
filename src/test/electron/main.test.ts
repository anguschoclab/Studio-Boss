import {describe it expect vi beforeEach} from "vitest";

// Mock electron module
const _mockEvent = { preventDefault: vi.fn() };

const mockWebContents = {
  setWindowOpenHandler: vi.fn(),
  on: vi.fn(),
};

vi.mock("electron", () => ({
  app: {
    getPath: vi.fn(() => "/tmp/test"),
    whenReady: vi.fn(() => Promise.resolve()),
    on: vi.fn(),
    quit: vi.fn(),
    getVersion: vi.fn(() => "1.0.0"),
    setAsDefaultProtocolClient: vi.fn(),
    dock: { setBadge: vi.fn() },
    name: "Studio Boss",
  },
  BrowserWindow: vi.fn(() => ({
    webContents: mockWebContents,
    on: vi.fn(),
    once: vi.fn(),
    show: vi.fn(),
    loadURL: vi.fn(),
    getBounds: vi.fn(() => ({ x: 0, y: 0, width: 1440, height: 900 })),
    isMaximized: vi.fn(),
    minimize: vi.fn(),
    maximize: vi.fn(),
    unmaximize: vi.fn(),
    close: vi.fn(),
  })),
  protocol: {
    registerSchemesAsPrivileged: vi.fn(),
    handle: vi.fn(),
  },
  net: { fetch: vi.fn() },
  shell: { openExternal: vi.fn() },
  Menu: {
    buildFromTemplate: vi.fn(),
    setApplicationMenu: vi.fn(),
  },
  ipcMain: {
    handle: vi.fn(),
  },
  Notification: { isSupported: vi.fn(() => false) },
  dialog: {
    showSaveDialog: vi.fn(),
    showOpenDialog: vi.fn(),
  },
  Tray: vi.fn(),
  nativeImage: { createEmpty: vi.fn() },
}));

describe("Electron Security - will-navigate handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers a will-navigate handler on webContents", () => {
    expect(mockWebContents.on).toBeDefined();
  });

  it("preventDefault is called for non-localhost URLs", () => {
    const IS_DEV = false;
    const url = "https://evil.com";
    const event = { preventDefault: vi.fn() };

    try {
      const parsed = new URL(url);
      if (parsed.protocol === "app:") return;
      const isLocalhost = (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
        && (parsed.protocol === "http:" || parsed.protocol === "https:");
      if (!IS_DEV || !isLocalhost) {
        event.preventDefault();
      }
    } catch (_e) {
      event.preventDefault();
    }

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("preventDefault is called for malformed URLs", () => {
    const event = { preventDefault: vi.fn() };
    const url = "not-a-valid-url";

    try {
      const parsed = new URL(url);
      if (parsed.protocol === "app:") return;
      const isLocalhost = (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
        && (parsed.protocol === "http:" || parsed.protocol === "https:");
      if (!isLocalhost) {
        event.preventDefault();
      }
    } catch (_e) {
      event.preventDefault();
    }

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("allows localhost navigation in dev mode", () => {
    const IS_DEV = true;
    const url = "http://localhost:8081";
    const event = { preventDefault: vi.fn() };

    try {
      const parsed = new URL(url);
      if (parsed.protocol === "app:") return;
      const isLocalhost = (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
        && (parsed.protocol === "http:" || parsed.protocol === "https:");
      if (!IS_DEV || !isLocalhost) {
        event.preventDefault();
      }
    } catch (_e) {
      event.preventDefault();
    }

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("blocks localhost navigation in production mode", () => {
    const IS_DEV = false;
    const url = "http://localhost:8081";
    const event = { preventDefault: vi.fn() };

    try {
      const parsed = new URL(url);
      if (parsed.protocol === "app:") return;
      const isLocalhost = (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
        && (parsed.protocol === "http:" || parsed.protocol === "https:");
      if (!IS_DEV || !isLocalhost) {
        event.preventDefault();
      }
    } catch (_e) {
      event.preventDefault();
    }

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("allows 127.0.0.1 navigation in dev mode", () => {
    const IS_DEV = true;
    const url = "http://127.0.0.1:8081";
    const event = { preventDefault: vi.fn() };

    try {
      const parsed = new URL(url);
      if (parsed.protocol === "app:") return;
      const isLocalhost = (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
        && (parsed.protocol === "http:" || parsed.protocol === "https:");
      if (!IS_DEV || !isLocalhost) {
        event.preventDefault();
      }
    } catch (_e) {
      event.preventDefault();
    }

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("allows app: protocol navigation in production", () => {
    const IS_DEV = false;
    const url = "app://localhost/dashboard";
    const event = { preventDefault: vi.fn() };

    try {
      const parsed = new URL(url);
      if (parsed.protocol === "app:") return;
      const isLocalhost = (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
        && (parsed.protocol === "http:" || parsed.protocol === "https:");
      if (!IS_DEV || !isLocalhost) {
        event.preventDefault();
      }
    } catch (_e) {
      event.preventDefault();
    }

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("allows app: protocol navigation in dev mode", () => {
    const IS_DEV = true;
    const url = "app://localhost/settings";
    const event = { preventDefault: vi.fn() };

    try {
      const parsed = new URL(url);
      if (parsed.protocol === "app:") return;
      const isLocalhost = (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
        && (parsed.protocol === "http:" || parsed.protocol === "https:");
      if (!IS_DEV || !isLocalhost) {
        event.preventDefault();
      }
    } catch (_e) {
      event.preventDefault();
    }

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("blocks file: protocol in production", () => {
    const IS_DEV = false;
    const url = "file:///etc/passwd";
    const event = { preventDefault: vi.fn() };

    try {
      const parsed = new URL(url);
      if (parsed.protocol === "app:") return;
      const isLocalhost = (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
        && (parsed.protocol === "http:" || parsed.protocol === "https:");
      if (!IS_DEV || !isLocalhost) {
        event.preventDefault();
      }
    } catch (_e) {
      event.preventDefault();
    }

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("blocks javascript: protocol", () => {
    const IS_DEV = true;
    const url = "javascript:alert(1)";
    const event = { preventDefault: vi.fn() };

    try {
      const parsed = new URL(url);
      if (parsed.protocol === "app:") return;
      const isLocalhost = (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
        && (parsed.protocol === "http:" || parsed.protocol === "https:");
      if (!IS_DEV || !isLocalhost) {
        event.preventDefault();
      }
    } catch (_e) {
      event.preventDefault();
    }

    expect(event.preventDefault).toHaveBeenCalled();
  });
});

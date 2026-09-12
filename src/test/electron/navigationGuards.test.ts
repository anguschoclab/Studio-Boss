import {describe, it, expect, vi, beforeEach} from "vitest";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  shouldAllowNavigation,
  installNavigationGuards,
  // @ts-expect-error - CJS module without type declarations
} = await import("../../../electron/navigationGuards.cjs");

describe("shouldAllowNavigation", () => {
  it("allows app: protocol navigation", () => {
    expect(shouldAllowNavigation("app://index.html", false)).toBe(true);
    expect(shouldAllowNavigation("app://assets/main.js", true)).toBe(true);
  });

  it("allows localhost http navigation in dev mode", () => {
    expect(shouldAllowNavigation("http://localhost:8081", true)).toBe(true);
    expect(shouldAllowNavigation("http://127.0.0.1:8081/path", true)).toBe(true);
    expect(shouldAllowNavigation("https://localhost:8443", true)).toBe(true);
  });

  it("blocks localhost navigation in production mode", () => {
    expect(shouldAllowNavigation("http://localhost:8081", false)).toBe(false);
    expect(shouldAllowNavigation("http://127.0.0.1:8081", false)).toBe(false);
  });

  it("blocks external navigation in all modes", () => {
    expect(shouldAllowNavigation("https://evil.com", false)).toBe(false);
    expect(shouldAllowNavigation("https://evil.com", true)).toBe(false);
    expect(shouldAllowNavigation("file:///etc/passwd", false)).toBe(false);
  });

  it("blocks malformed URLs", () => {
    expect(shouldAllowNavigation("not-a-valid-url", false)).toBe(false);
    expect(shouldAllowNavigation("", true)).toBe(false);
  });

  it("blocks non-localhost hosts that merely contain 'localhost'", () => {
    expect(shouldAllowNavigation("https://localhost.evil.com", true)).toBe(false);
    expect(shouldAllowNavigation("https://evil.com/?q=localhost", true)).toBe(false);
  });
});

describe("installNavigationGuards", () => {
  let contents: { setWindowOpenHandler: ReturnType<typeof vi.fn>; on: ReturnType<typeof vi.fn> };
  let openExternal: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    contents = { setWindowOpenHandler: vi.fn(), on: vi.fn() };
    openExternal = vi.fn();
    installNavigationGuards(contents, { isDev: false, openExternal });
  });

  it("registers a setWindowOpenHandler on the contents", () => {
    expect(contents.setWindowOpenHandler).toHaveBeenCalledTimes(1);
    expect(contents.setWindowOpenHandler).toHaveBeenCalledWith(expect.any(Function));
  });

  it("registers a will-navigate listener on the contents", () => {
    expect(contents.on).toHaveBeenCalledWith("will-navigate", expect.any(Function));
  });

  it("window-open handler sends https links to the external browser and denies the window", () => {
    const handler = contents.setWindowOpenHandler.mock.calls[0][0];
    const result = handler({ url: "https://example.com/article" });
    expect(openExternal).toHaveBeenCalledWith("https://example.com/article");
    expect(result).toEqual({ action: "deny" });
  });

  it("window-open handler denies app: and non-http links WITHOUT opening externally", () => {
    const handler = contents.setWindowOpenHandler.mock.calls[0][0];
    expect(handler({ url: "app://index.html" })).toEqual({ action: "deny" });
    expect(handler({ url: "file:///etc/passwd" })).toEqual({ action: "deny" });
    expect(handler({ url: "javascript:alert(1)" })).toEqual({ action: "deny" });
    expect(openExternal).not.toHaveBeenCalled();
  });

  it("will-navigate handler prevents navigation to disallowed URLs", () => {
    const willNavigate = contents.on.mock.calls.find((c) => c[0] === "will-navigate")![1];
    const event = { preventDefault: vi.fn() };
    willNavigate(event, "https://evil.com");
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("will-navigate handler allows app: navigation", () => {
    const willNavigate = contents.on.mock.calls.find((c) => c[0] === "will-navigate")![1];
    const event = { preventDefault: vi.fn() };
    willNavigate(event, "app://index.html");
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("will-navigate handler allows dev localhost navigation only when isDev", () => {
    const devContents = { setWindowOpenHandler: vi.fn(), on: vi.fn() };
    installNavigationGuards(devContents, { isDev: true, openExternal });
    const devNavigate = devContents.on.mock.calls.find((c) => c[0] === "will-navigate")![1];
    const devEvent = { preventDefault: vi.fn() };
    devNavigate(devEvent, "http://localhost:8081");
    expect(devEvent.preventDefault).not.toHaveBeenCalled();

    const willNavigate = contents.on.mock.calls.find((c) => c[0] === "will-navigate")![1];
    const prodEvent = { preventDefault: vi.fn() };
    willNavigate(prodEvent, "http://localhost:8081");
    expect(prodEvent.preventDefault).toHaveBeenCalled();
  });
});

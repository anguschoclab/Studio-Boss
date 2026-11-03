import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const { shouldAllowNavigation } = await import("../../../electron/navigationGuards.cjs");

const MAIN_SRC = readFileSync(join(__dirname, "../../../electron/main.cjs"), "utf-8");

describe("Electron main process — navigation security", () => {
  // NOTE: main.cjs cannot be imported under vi.mock("electron") — the module is
  // externalized and its require("electron") resolves to the real package.
  // Behavioral coverage of the navigation rules lives in
  // navigationGuards.test.ts against the real exported functions; the tests
  // below guard the *wiring*: main.cjs must install those guards globally on
  // every webContents via app.on("web-contents-created"), not just on
  // mainWindow.webContents.

  it("installs navigation guards globally for every webContents", () => {
    const createdBlock = MAIN_SRC.match(/app\.on\("web-contents-created"[\s\S]*?\}\);/);
    expect(createdBlock).not.toBeNull();
    // The global handler must call installNavigationGuards so that ALL
    // webContents (windows, popups, devtools) get the restrictions — not only
    // the initial mainWindow.
    expect(createdBlock![0]).toMatch(/installNavigationGuards\(contents/);
  });

  it("does not bind navigation restrictions only to mainWindow.webContents", () => {
    // Regression guard for the Sentinel navigation-bypass fixes: per-window
    // binding lets any newly created webContents navigate freely.
    expect(MAIN_SRC).not.toMatch(/mainWindow\.webContents\.setWindowOpenHandler/);
    expect(MAIN_SRC).not.toMatch(/mainWindow\.webContents\.on\("will-navigate"/);
  });

  it("still prevents webview attachment", () => {
    expect(MAIN_SRC).toMatch(/will-attach-webview/);
  });
});

describe("Electron main process — permission handlers", () => {
  // Sentinel hardening: a local game needs no web permissions (camera, mic,
  // geolocation, etc.), so every session must deny permission requests and
  // permission checks outright. Asserted by source inspection for the same
  // reason as the navigation-guard wiring above.
  it("denies all permission requests on the default session", () => {
    expect(MAIN_SRC).toMatch(
      /session\.defaultSession\.setPermissionRequestHandler\([^)]*\)/
    );
  });

  it("denies all permission requests on the persist:studio-boss partition", () => {
    // The main BrowserWindow runs on this custom partition — its session is
    // distinct from defaultSession and must get its own handler.
    expect(MAIN_SRC).toMatch(
      /session\.fromPartition\("persist:studio-boss"\)[\s\S]*?setPermissionRequestHandler/
    );
  });

  it("denies all permission checks on both sessions", () => {
    // setPermissionCheckHandler governs navigator.permissions.query and
    // synchronous checks — deny-all is consistent with the request handler.
    const checks = MAIN_SRC.match(/setPermissionCheckHandler\(/g);
    expect(checks?.length).toBeGreaterThanOrEqual(2);
  });

  it("permission handlers grant nothing (deny-all callbacks)", () => {
    expect(MAIN_SRC).not.toMatch(/PermissionRequestHandler[\s\S]{0,200}callback\(true\)/);
    expect(MAIN_SRC).not.toMatch(/PermissionCheckHandler[\s\S]{0,200}return true/);
  });
});

describe("shouldAllowNavigation (production predicate)", () => {
  it("preventDefault-equivalent: blocks non-localhost URLs in production", () => {
    expect(shouldAllowNavigation("https://evil.com", false)).toBe(false);
  });

  it("blocks malformed URLs", () => {
    expect(shouldAllowNavigation("not-a-valid-url", false)).toBe(false);
  });

  it("allows localhost navigation in dev mode", () => {
    expect(shouldAllowNavigation("http://localhost:8081", true)).toBe(true);
  });

  it("blocks localhost navigation in production mode", () => {
    expect(shouldAllowNavigation("http://localhost:8081", false)).toBe(false);
  });

  it("allows app: protocol navigation", () => {
    expect(shouldAllowNavigation("app://index.html", false)).toBe(true);
  });
});

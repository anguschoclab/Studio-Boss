"use strict";

/**
 * Navigation security guards for Electron webContents.
 *
 * These are installed globally via app.on("web-contents-created") so that EVERY
 * webContents — the main window, popups, devtools windows, and any future
 * webContents — gets the same restrictions. Binding them only to
 * mainWindow.webContents lets any newly created contents bypass them entirely.
 */

/**
 * Whether a navigation to `url` is permitted.
 * @param {string} url
 * @param {boolean} isDev
 * @returns {boolean}
 */
function shouldAllowNavigation(url, isDev) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "app:") return true;
    const isLocalhost =
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") &&
      (parsed.protocol === "http:" || parsed.protocol === "https:");
    // In dev we must allow the Vite dev server; in production nothing outside
    // the app: protocol is ever allowed.
    return Boolean(isDev && isLocalhost);
  } catch (_e) {
    return false;
  }
}

/**
 * @param {import("electron").WebContents} contents
 * @param {{ isDev: boolean, openExternal: (url: string) => unknown }} opts
 */
function installNavigationGuards(contents, opts) {
  const { isDev, openExternal } = opts;

  // Open external links in the real browser, not inside the app
  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      openExternal(url);
    }
    return { action: "deny" };
  });

  // Prevent navigation away from the app origin (security hardening)
  contents.on("will-navigate", (event, url) => {
    if (!shouldAllowNavigation(url, isDev)) {
      event.preventDefault();
    }
  });
}

module.exports = { shouldAllowNavigation, installNavigationGuards };

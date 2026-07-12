/// <reference types="node" />
/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { resolveSafePath } from "../../electron/pathSecurity.cjs";

describe("resolveSafePath", () => {
  let tmpDir: string;
  let distDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pathsec-"));
    distDir = path.join(tmpDir, "dist");

    fs.mkdirSync(distDir, { recursive: true });
    fs.mkdirSync(path.join(distDir, "assets"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, "dist-evil"), { recursive: true });

    fs.writeFileSync(path.join(distDir, "index.html"), "<html></html>");
    fs.writeFileSync(path.join(distDir, "robots.txt"), "User-agent: *");
    fs.writeFileSync(path.join(distDir, "assets", "main.js"), "console.log(1);");
    fs.writeFileSync(path.join(tmpDir, "secret.txt"), "secret");
    fs.writeFileSync(path.join(tmpDir, "dist-evil", "secret.txt"), "evil");

    fs.symlinkSync(path.join(tmpDir, "secret.txt"), path.join(distDir, "symlink-outside"));
    fs.symlinkSync(path.join(distDir, "robots.txt"), path.join(distDir, "symlink-inside"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns real path for a normal file", () => {
    const result = resolveSafePath(distDir, "index.html");
    expect(result).toBe(fs.realpathSync(path.join(distDir, "index.html")));
  });

  it("returns real path for a nested subdirectory file", () => {
    const result = resolveSafePath(distDir, "assets/main.js");
    expect(result).toBe(fs.realpathSync(path.join(distDir, "assets", "main.js")));
  });

  it("returns null for empty path (directory, not file)", () => {
    const result = resolveSafePath(distDir, "");
    expect(result).toBeNull();
  });

  it("returns null for simple traversal", () => {
    const result = resolveSafePath(distDir, "../secret.txt");
    expect(result).toBeNull();
  });

  it("returns null for deep traversal", () => {
    const result = resolveSafePath(distDir, "../../../../etc/passwd");
    expect(result).toBeNull();
  });

  it("returns null for absolute path injection", () => {
    const result = resolveSafePath(distDir, "/etc/passwd");
    expect(result).toBeNull();
  });

  it("returns null for symlink pointing outside baseDir", () => {
    const result = resolveSafePath(distDir, "symlink-outside");
    expect(result).toBeNull();
  });

  it("returns real target path for symlink pointing inside baseDir", () => {
    const result = resolveSafePath(distDir, "symlink-inside");
    expect(result).toBe(fs.realpathSync(path.join(distDir, "robots.txt")));
  });

  it("returns null for non-existent file", () => {
    const result = resolveSafePath(distDir, "nonexistent.html");
    expect(result).toBeNull();
  });

  it("returns null for null byte injection", () => {
    const result = resolveSafePath(distDir, "index.html\0");
    expect(result).toBeNull();
  });

  it("returns null for partial directory name match", () => {
    const result = resolveSafePath(distDir, "../dist-evil/secret.txt");
    expect(result).toBeNull();
  });

  it("returns null for directory path (not file)", () => {
    const result = resolveSafePath(distDir, "assets");
    expect(result).toBeNull();
  });
});

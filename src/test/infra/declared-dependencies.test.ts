import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join, extname, relative } from "path";

const ROOT = join(__dirname, "../../..");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
const allDeps = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
]);

const NODE_BUILTINS = new Set([
  "assert",
  "async_hooks",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "diagnostics_channel",
  "dns",
  "domain",
  "events",
  "fs",
  "http",
  "http2",
  "https",
  "inspector",
  "module",
  "net",
  "os",
  "path",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "readline",
  "repl",
  "stream",
  "string_decoder",
  "sys",
  "timers",
  "tls",
  "trace_events",
  "tty",
  "url",
  "util",
  "v8",
  "vm",
  "wasi",
  "worker_threads",
  "zlib",
]);
const BUN_BUILTINS = new Set(["bun", "bun:test"]);

function isBuiltin(name: string): boolean {
  return NODE_BUILTINS.has(name) || BUN_BUILTINS.has(name);
}

function walk(dir: string, predicate: (entry: string) => boolean, cb: (file: string) => void) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      walk(full, predicate, cb);
    } else if (predicate(full)) {
      cb(full);
    }
  }
}

function extractImports(content: string): string[] {
  const imports: string[] = [];
  // ESM imports and exports
  const importRegex = /(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"./][^'"]*)['"]/g;
  // require() / dynamic import()
  const requireRegex = /(?:import|require)\s*\(\s*['"]([^'"./][^'"]*)['"]\s*\)/g;
  for (const m of content.matchAll(importRegex)) imports.push(m[1]);
  for (const m of content.matchAll(requireRegex)) imports.push(m[1]);
  return imports;
}

function basePackage(name: string): string {
  return name.startsWith("@") ? name.split("/").slice(0, 2).join("/") : name.split("/")[0];
}

describe("declared dependencies", () => {
  it("electron is in devDependencies", () => {
    expect(pkg.devDependencies).toHaveProperty("electron");
  });

  it("canvas is in devDependencies", () => {
    expect(pkg.devDependencies).toHaveProperty("canvas");
  });

  it("@types/dompurify is not in dependencies and is in devDependencies", () => {
    expect(pkg.dependencies || {}).not.toHaveProperty("@types/dompurify");
    expect(pkg.devDependencies).toHaveProperty("@types/dompurify");
  });

  it("playwright-fixture.ts is gone or its package is declared", () => {
    const fixturePath = join(ROOT, "playwright-fixture.ts");
    if (existsSync(fixturePath)) {
      expect(allDeps).toContain("lovable-agent-playwright-config");
    } else {
      expect(existsSync(fixturePath)).toBe(false);
    }
  });

  it("electron/*.cjs runtime imports are declared", () => {
    const missing: string[] = [];
    walk(
      join(ROOT, "electron"),
      (f) => f.endsWith(".cjs"),
      (file) => {
        const content = readFileSync(file, "utf-8");
        for (const imp of extractImports(content)) {
          const base = basePackage(imp);
          if (isBuiltin(base)) continue;
          if (!allDeps.has(base)) missing.push(`${relative(ROOT, file)} -> ${base}`);
        }
      }
    );
    expect(missing).toEqual([]);
  });

  it("scripts runtime imports are declared", () => {
    const missing: string[] = [];
    walk(
      join(ROOT, "scripts"),
      (f) => [".ts", ".mjs", ".js"].includes(extname(f)),
      (file) => {
        const content = readFileSync(file, "utf-8");
        for (const imp of extractImports(content)) {
          const base = basePackage(imp);
          if (isBuiltin(base)) continue;
          if (!allDeps.has(base)) missing.push(`${relative(ROOT, file)} -> ${base}`);
        }
      }
    );
    expect(missing).toEqual([]);
  });

  it("source runtime imports are declared in package.json", () => {
    const missing: string[] = [];
    walk(
      join(ROOT, "src"),
      (f) => [".ts", ".tsx"].includes(extname(f)),
      (file) => {
        const content = readFileSync(file, "utf-8");
        for (const imp of extractImports(content)) {
          if (imp.startsWith("@/")) continue; // path alias
          const base = basePackage(imp);
          if (isBuiltin(base)) continue;
          if (!allDeps.has(base)) missing.push(`${relative(ROOT, file)} -> ${base}`);
        }
      }
    );
    expect(missing).toEqual([]);
  });
});

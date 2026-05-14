import { Contract } from '@/engine/types';
// Shared utilities for the engine layer — no React imports

/**
 * Formats a numeric amount into a human-readable money string with suffixes (K, M, B).
 *
 * @param amount - The numeric amount to format
 * @returns The formatted money string (e.g., "$1.2M")
 */
export function formatMoney(amount: number): string {
  if (Number.isNaN(amount)) return "$NaN";

  const abs = Math.abs(amount);
  const sign = amount < 0 || Object.is(amount, -0) ? '-' : '';

  if (!Number.isFinite(amount)) return `${sign}$InfinityB`;

  // Handle edge case rounding errors where .toFixed bumps up the number into the next tier
  // e.g. 999_999_999.9 becomes "1000.0M" if we don't catch it.
  if (abs >= 999_950_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 999_950) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 999.5) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

/**
 * Calculates the display week and year from a total week count.
 *
 * @param week - The total number of weeks since the start
 * @returns An object containing the display week (1-52) and the current year
 */
export function getWeekDisplay(week: number): { displayWeek: number; year: number } {
  return {
    displayWeek: ((week - 1) % 52) + 1,
    year: 2026 + Math.floor((week - 1) / 52),
  };
}

/**
 * A seedable, deterministic random number generator (Mulberry32).
 */
let currentRandomSource = () => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / (0xffffffff + 1);
};

export function setDeterministicSeed(seed: number) {
  let s = seed;
  currentRandomSource = () => {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The primary random function for the engine.
 * Defaults to non-deterministic unless setDeterministicSeed is called.
 */
export function rand(): number {
  return currentRandomSource();
}

/**
 * Centralized, deterministic ID generation for engine entities.
 * Uses the active PRNG to ensure bit-identical results when seeded.
 */
export function generateId(prefix: string = ''): string {
  // Simple deterministic UUID-like string based on our rand() source
  const hex = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 32; i++) {
    const r = Math.floor(rand() * 16);
    if (i === 8 || i === 12 || i === 16 || i === 20) id += '-';
    id += hex[r];
  }
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Legacy secureRandom — avoided in core simulation for determinism.
 */
export function secureRandom(): number {
  return rand(); // Redirect to our seedable source for unified determinism
}

/**
 * Randomly selects an element from an array using the engine's PRNG.
 *
 * @param arr - The array to pick from
 * @returns A randomly selected element from the array
 */
export function pick<T>(arr: T[]): T {
  if (arr.length === 0) return undefined as T;
  return arr[Math.floor(rand() * arr.length)];
}

/**
 * Generates a random number within a specified range using the engine's PRNG.
 *
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (exclusive)
 * @returns A random number between min and max
 */
export function randRange(min: number, max: number): number {
  return min + rand() * (max - min);
}

/**
 * Clamps a number between a minimum and maximum value.
 *
 * @param value - The value to clamp
 * @param min - The minimum allowed value
 * @param max - The maximum allowed value
 * @returns The clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Groups a list of contracts by their project ID.
 *
 * @param contracts - The list of contracts to group
 * @returns A Map where keys are project IDs and values are arrays of contracts
 */
export function groupContractsByProject(contracts: Contract[]): Map<string, Contract[]> {
  const map = new Map<string, Contract[]>();
  for (const contract of contracts) {
    if (!map.has(contract.projectId)) {
      map.set(contract.projectId, []);
    }
    map.get(contract.projectId)!.push(contract);
  }
  return map;
}

/**
 * Robust string template interpolation for both ${key} and {key} syntaxes.
 * Useful for resolving headlines, scandals, and rumors from data pools.
 */
export function fillTemplate(template: string, vars: Record<string, string | number>): string {
  // Regex matches ${key} (captures key in p2) or {key} (captures key in p4)
  return template.replace(/(\$\{([^}]+)\})|(\{([^}]+)\})/g, (match, p1, p2, p3, p4) => {
    const key = p2 || p4;
    return vars[key] !== undefined ? String(vars[key]) : match;
  });
}

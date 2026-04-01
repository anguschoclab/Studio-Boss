/**
 * Utility functions for the Procedural Avatar System.
 * Deterministic PRNG and color manipulation.
 */

/**
 * Generates a 32-bit hash for a string seed.
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Seeded PRNG using Mulberry32.
 * Returns a function that produces a number between 0 and 1.
 */
export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns a value between min and max based on a random source.
 */
export function seededRange(rand: () => number, min: number, max: number): number {
  return min + rand() * (max - min);
}

/**
 * Picks a random element from an array based on a random source.
 */
export function seededPick<T>(rand: () => number, arr: T[]): T {
  if (arr.length === 0) return undefined as T;
  return arr[Math.floor(rand() * arr.length)];
}

/**
 * Blends two hex colors.
 */
export function blendColor(hex1: string, hex2: string, amount: number): string {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * amount);
  const g = Math.round(g1 + (g2 - g1) * amount);
  const b = Math.round(b1 + (b2 - b1) * amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Darkens a hex color.
 */
export function darkenColor(hex: string, amount: number): string {
  return blendColor(hex, '#000000', amount);
}

/**
 * Lightens a hex color.
 */
export function lightenColor(hex: string, amount: number): string {
  return blendColor(hex, '#FFFFFF', amount);
}

/**
 * Studio Boss - Seeded Random Number Generator (Mulberry32)
 *
 * Provides a 100% deterministic source of randomness for the engine.
 * To ensure determinism, do NOT use Math.random() or crypto.randomUUID()
 * within engine core modules.
 */

export class RandomGenerator {
  private state: number;

  constructor(seed: number) {
    // Ensure seed is a 32-bit integer
    this.state = seed >>> 0;
  }

  /**
   * Returns a float between 0 and 1.
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a random element from an array.
   */
  pick<T>(arr: T[]): T {
    if (arr.length === 0) return undefined as any;
    return arr[Math.floor(this.next() * arr.length)];
  }

  /**
   * Returns a random float between min and max.
   */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Returns a random integer between min and max (inclusive).
   */
  rangeInt(min: number, max: number): number {
    return Math.floor(min + this.next() * (max - min + 1));
  }

  /**
   * Returns a deterministic UUID-like string.
   */
  uuid<T extends string = string>(prefix: string = ''): T {
    const part = () => Math.floor(this.next() * 0xffffffff).toString(16).padStart(8, '0');
    const id = `${part()}-${part().slice(0, 4)}-${part().slice(0, 4)}-${part().slice(0, 4)}-${part().slice(0, 12)}`;
    const lowerPrefix = prefix.toLowerCase();
    return (lowerPrefix ? `${lowerPrefix}-${id}` : id) as T;
  }

  /**
   * Shuffles an array in place (Fisher-Yates).
   */
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Returns the current internal state (useful for snapshotting).
   */
  getState(): number {
    return this.state;
  }
}

import { Contract } from "@/engine/types";
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
  const sign = amount < 0 || Object.is(amount, -0) ? "-" : "";

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
export function generateId(prefix: string = ""): string {
  // Simple deterministic UUID-like string based on our rand() source
  const hex = "0123456789abcdef";
  let id = "";
  for (let i = 0; i < 32; i++) {
    const r = Math.floor(rand() * 16);
    if (i === 8 || i === 12 || i === 16 || i === 20) id += "-";
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

/** Add a contract ID to the contractsByProjectId index. Returns a new index object. */
export function addContractToIndex(
  index: Record<string, string[]>,
  projectId: string,
  contractId: string
): Record<string, string[]> {
  const existing = index[projectId];
  if (existing && existing.includes(contractId)) return index;
  return {
    ...index,
    [projectId]: existing ? [...existing, contractId] : [contractId],
  };
}

/** Add multiple contract IDs to the index. Returns a new index object. */
export function addContractsToIndex(
  index: Record<string, string[]>,
  contracts: Contract[]
): Record<string, string[]> {
  const updates: Record<string, string[]> = {};
  for (const c of contracts) {
    if (!updates[c.projectId]) updates[c.projectId] = [];
    updates[c.projectId].push(c.id);
  }
  const result = { ...index };
  for (const pid in updates) {
    result[pid] = [...(result[pid] || []), ...updates[pid]];
  }
  return result;
}

/** Remove a contract ID from the index. Returns a new index object. */
export function removeContractFromIndex(
  index: Record<string, string[]>,
  projectId: string,
  contractId: string
): Record<string, string[]> {
  const existing = index[projectId];
  if (!existing) return index;
  const filtered = existing.filter((id) => id !== contractId);
  if (filtered.length === 0) {
    const { [projectId]: _, ...rest } = index;
    return rest;
  }
  return { ...index, [projectId]: filtered };
}

/** Remove all contracts for a given (projectId, talentId) pair. Returns new index + removed contract IDs. */
export function removeContractsByTalentFromIndex(
  index: Record<string, string[]>,
  contracts: Record<string, Contract>,
  projectId: string,
  talentId: string
): { index: Record<string, string[]>; removedIds: string[] } {
  const existing = index[projectId] || [];
  const removedIds: string[] = [];
  const remaining: string[] = [];
  for (const cId of existing) {
    const c = contracts[cId];
    if (c && c.talentId === talentId) {
      removedIds.push(cId);
    } else {
      remaining.push(cId);
    }
  }
  if (removedIds.length === 0) return { index, removedIds };
  if (remaining.length === 0) {
    const { [projectId]: _, ...rest } = index;
    return { index: rest, removedIds };
  }
  return { index: { ...index, [projectId]: remaining }, removedIds };
}

/** Look up contracts for a project using the contractsByProjectId index. */
export function getContractsByProjectId(
  index: Record<string, string[]> | undefined,
  contracts: Record<string, Contract>,
  projectId: string
): Contract[] {
  const ids = index?.[projectId];
  if (!ids || ids.length === 0) return [];
  const result: Contract[] = [];
  for (const id of ids) {
    const c = contracts[id];
    if (c) result.push(c);
  }
  return result;
}

// ─── contractsByTalentId index utilities ───

/** Add a single contract ID to the talent index. Returns a new index object. */
export function addContractToTalentIndex(
  index: Record<string, string[]>,
  talentId: string,
  contractId: string
): Record<string, string[]> {
  const existing = index[talentId];
  if (existing && existing.includes(contractId)) return index;
  return {
    ...index,
    [talentId]: existing ? [...existing, contractId] : [contractId],
  };
}

/** Add multiple contract IDs to the talent index. Returns a new index object. */
export function addContractsToTalentIndex(
  index: Record<string, string[]>,
  contracts: Contract[]
): Record<string, string[]> {
  const updates: Record<string, string[]> = {};
  for (const c of contracts) {
    if (!updates[c.talentId]) updates[c.talentId] = [];
    updates[c.talentId].push(c.id);
  }
  const result = { ...index };
  for (const tid in updates) {
    result[tid] = [...(result[tid] || []), ...updates[tid]];
  }
  return result;
}

/** Remove a contract ID from the talent index. Returns a new index object. */
export function removeContractFromTalentIndex(
  index: Record<string, string[]>,
  talentId: string,
  contractId: string
): Record<string, string[]> {
  const existing = index[talentId];
  if (!existing) return index;
  const filtered = existing.filter((id) => id !== contractId);
  if (filtered.length === 0) {
    const { [talentId]: _, ...rest } = index;
    return rest;
  }
  return { ...index, [talentId]: filtered };
}

/** Remove all contracts for a given (projectId, talentId) pair from the talent index. Returns new index + removed contract IDs. */
export function removeContractsByProjectFromTalentIndex(
  index: Record<string, string[]>,
  contracts: Record<string, Contract>,
  projectId: string,
  talentId: string
): { index: Record<string, string[]>; removedIds: string[] } {
  const existing = index[talentId] || [];
  const removedIds: string[] = [];
  const remaining: string[] = [];
  for (const cId of existing) {
    const c = contracts[cId];
    if (c && c.projectId === projectId) {
      removedIds.push(cId);
    } else {
      remaining.push(cId);
    }
  }
  if (removedIds.length === 0) return { index, removedIds };
  if (remaining.length === 0) {
    const { [talentId]: _, ...rest } = index;
    return { index: rest, removedIds };
  }
  return { index: { ...index, [talentId]: remaining }, removedIds };
}

/** Look up contracts for a talent using the contractsByTalentId index. */
export function getContractsByTalentId(
  index: Record<string, string[]> | undefined,
  contracts: Record<string, Contract>,
  talentId: string
): Contract[] {
  const ids = index?.[talentId];
  if (!ids || ids.length === 0) return [];
  const result: Contract[] = [];
  for (const id of ids) {
    const c = contracts[id];
    if (c) result.push(c);
  }
  return result;
}

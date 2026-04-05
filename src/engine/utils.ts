import { Contract } from '@/engine/types';
import { RandomGenerator } from './utils/rng';
// Shared utilities for the engine layer — no React imports

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

export function getWeekDisplay(week: number): { displayWeek: number; year: number } {
  return {
    displayWeek: ((week - 1) % 52) + 1,
    year: 2026 + Math.floor((week - 1) / 52),
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}


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
  return template.replace(/(\$\{([^}]+)\})|(\{([^}]+)\})/g, (match, p1, p2, p3, p4) => {
    const key = p2 || p4;
    return vars[key] !== undefined ? String(vars[key]) : match;
  });
}

export function pick<T>(arr: T[], rng?: RandomGenerator): T {
  if (rng) return rng.pick(arr);
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randRange(min: number, max: number, rng?: RandomGenerator): number {
  if (rng) return rng.rangeInt(min, max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

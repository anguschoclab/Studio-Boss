/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function reviver(this: any, key: string, value: unknown): unknown {
  if (FORBIDDEN_KEYS.has(key)) {
    return undefined;
  }
  return value;
}

export function safeJsonParse(jsonString: string): unknown {
  return JSON.parse(jsonString, reviver as (key: string, value: unknown) => unknown);
}

export const SAVE_SCHEMA = z
  .object({
    week: z.number().int().positive(),
    gameSeed: z.number(),
    tickCount: z.number(),
    saveVersion: z.number().int().positive(),
    game: z.object({ currentWeek: z.number() }).passthrough(),
    finance: z
      .object({
        cash: z.number(),
        ledger: z.array(z.unknown()).optional().default([]),
        weeklyHistory: z.array(z.unknown()).optional().default([]),
        marketState: z.object({ baseRate: z.number() }).passthrough().optional(),
      })
      .passthrough(),
    studio: z
      .object({
        id: z.string(),
        name: z.string(),
        archetype: z.enum(["major", "mid-tier", "indie"]),
        prestige: z.number(),
        internal: z
          .object({
            projectHistory: z.array(z.string()),
            projects: z.record(z.string(), z.unknown()),
            contracts: z.array(z.unknown()),
          })
          .passthrough(),
      })
      .passthrough(),
    entities: z
      .object({
        projects: z.record(z.string(), z.unknown()),
        releasedProjectIds: z.array(z.string()),
        talents: z.record(z.string(), z.unknown()),
        contracts: z.record(z.string(), z.unknown()),
        rivals: z.record(z.string(), z.unknown()),
        shingles: z.record(z.string(), z.unknown()).optional(),
        contractsByProjectId: z.record(z.string(), z.array(z.string())),
        contractsByTalentId: z.record(z.string(), z.array(z.string())),
      })
      .passthrough(),
    market: z
      .object({
        buyers: z.array(z.unknown()).optional().default([]),
        opportunities: z.array(z.unknown()).optional().default([]),
        trends: z.array(z.unknown()).optional(),
      })
      .passthrough(),
    industry: z
      .object({
        families: z.array(z.unknown()).default([]),
        agencies: z.array(z.unknown()).default([]),
        agents: z.array(z.unknown()).default([]),
        awards: z.array(z.unknown()).optional(),
        rumors: z.array(z.unknown()).optional(),
        scandals: z.array(z.unknown()).optional(),
        festivalSubmissions: z.array(z.unknown()).optional(),
        distressedOffers: z.array(z.unknown()).optional(),
        activeMergers: z.array(z.unknown()).optional(),
      })
      .passthrough(),
    culture: z
      .object({
        genrePopularity: z.record(z.string(), z.number()),
      })
      .passthrough(),
    history: z.array(z.unknown()),
    eventHistory: z.array(z.unknown()),
  })
  .passthrough();

export type ValidationResult = { success: true; data: unknown } | { success: false; error: string };

export function validateSaveData(parsed: unknown): ValidationResult {
  const result = SAVE_SCHEMA.safeParse(parsed);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: JSON.stringify(result.error.issues, null, 2) };
}

export function parseAndValidate(jsonString: string): ValidationResult {
  const parsed = safeJsonParse(jsonString);
  return validateSaveData(parsed);
}

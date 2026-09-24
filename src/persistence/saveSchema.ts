 
import { z } from "zod";

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function reviver(key: string, value: unknown): unknown {
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

/**
 * Referential-integrity checks beyond structural validation: record keys must
 * match entity ids, required fields must exist, and cross-references must not
 * dangle. Returns the first violation found, or null.
 */
const PROJECT_TYPES = new Set(["FILM", "SERIES"]);
const PROJECT_STATES = new Set([
  "development",
  "needs_greenlight",
  "pitching",
  "shopping",
  "turnaround",
  "production",
  "post_production",
  "marketing",
  "released",
  "post_release",
  "completed",
  "archived",
]);
const TALENT_TIERS = new Set(["A_LIST", "B_LIST", "C_LIST", "RISING_STAR", "NEWCOMER"]);
const ARCHETYPES = new Set(["major", "mid-tier", "indie"]);

function checkReferentialIntegrity(data: unknown): string | null {
  const state = data as {
    entities?: {
      projects?: Record<string, unknown>;
      releasedProjectIds?: string[];
      talents?: Record<string, unknown>;
      contracts?: Record<string, unknown>;
      rivals?: Record<string, unknown>;
      contractsByProjectId?: Record<string, string[]>;
      contractsByTalentId?: Record<string, string[]>;
    };
    studio?: { internal?: { projects?: Record<string, unknown> } };
  };
  const entities = state.entities;
  if (!entities) return null;

  const projects = entities.projects ?? {};
  const talents = entities.talents ?? {};
  const contracts = entities.contracts ?? {};
  const rivals = entities.rivals ?? {};

  // Every entity record must be an object whose id matches its map key.
  for (const [label, record] of [
    ["project", projects],
    ["talent", talents],
    ["contract", contracts],
    ["rival", rivals],
  ] as const) {
    for (const [key, entity] of Object.entries(record)) {
      if (!entity || typeof entity !== "object") {
        return `entities.${label}s['${key}'] is not an object`;
      }
      const id = (entity as { id?: unknown }).id;
      if (typeof id !== "string" || id.length === 0) {
        return `entities.${label}s['${key}'] is missing an id`;
      }
      if (id !== key) {
        return `entities.${label}s key '${key}' does not match entity.id '${id}'`;
      }
    }
  }

  // Projects must carry load-bearing identity and lifecycle fields.
  for (const [key, project] of Object.entries(projects)) {
    const p = project as { title?: unknown; type?: unknown; state?: unknown };
    if (typeof p.title !== "string" || p.title.length === 0) {
      return `project '${key}' is missing required field 'title'`;
    }
    if (typeof p.type !== "string" || !PROJECT_TYPES.has(p.type)) {
      return `project '${key}' has invalid type '${String(p.type)}'`;
    }
    if (typeof p.state !== "string" || !PROJECT_STATES.has(p.state)) {
      return `project '${key}' has invalid state '${String(p.state)}'`;
    }
  }

  // Talents must carry identity and tier.
  for (const [key, talent] of Object.entries(talents)) {
    const t = talent as { name?: unknown; tier?: unknown };
    if (typeof t.name !== "string" || t.name.length === 0) {
      return `talent '${key}' is missing required field 'name'`;
    }
    if (typeof t.tier !== "string" || !TALENT_TIERS.has(t.tier)) {
      return `talent '${key}' has invalid tier '${String(t.tier)}'`;
    }
  }

  // Rivals must carry identity, archetype, and treasury.
  for (const [key, rival] of Object.entries(rivals)) {
    const r = rival as { name?: unknown; archetype?: unknown; cash?: unknown };
    if (typeof r.name !== "string" || r.name.length === 0) {
      return `rival '${key}' is missing required field 'name'`;
    }
    if (typeof r.archetype !== "string" || !ARCHETYPES.has(r.archetype)) {
      return `rival '${key}' has invalid archetype '${String(r.archetype)}'`;
    }
    if (typeof r.cash !== "number" || !Number.isFinite(r.cash)) {
      return `rival '${key}' has invalid cash`;
    }
  }

  // Contracts must carry their references, fee, and resolve those references.
  for (const [key, contract] of Object.entries(contracts)) {
    const { id, projectId, talentId, fee } = contract as {
      id?: string;
      projectId?: unknown;
      talentId?: unknown;
      fee?: unknown;
    };
    const label = id ?? key;
    if (typeof projectId !== "string" || projectId.length === 0) {
      return `contract '${label}' is missing required field 'projectId'`;
    }
    if (typeof talentId !== "string" || talentId.length === 0) {
      return `contract '${label}' is missing required field 'talentId'`;
    }
    if (typeof fee !== "number" || !Number.isFinite(fee)) {
      return `contract '${label}' has invalid fee`;
    }
    if (!(projectId in projects)) {
      return `contract '${label}' references missing project '${projectId}'`;
    }
    if (!(talentId in talents)) {
      return `contract '${label}' references missing talent '${talentId}'`;
    }
  }

  // Index records must not contain ghost ids.
  for (const [indexName, index] of [
    ["contractsByProjectId", entities.contractsByProjectId],
    ["contractsByTalentId", entities.contractsByTalentId],
  ] as const) {
    for (const [key, ids] of Object.entries(index ?? {})) {
      for (const id of ids) {
        if (!(id in contracts)) {
          return `entities.${indexName}['${key}'] references missing contract '${id}'`;
        }
      }
    }
  }

  // releasedProjectIds must reference live project records.
  for (const id of entities.releasedProjectIds ?? []) {
    if (!(id in projects)) {
      return `entities.releasedProjectIds references missing project '${id}'`;
    }
  }

  // studio.internal.projects mirrors entities.projects — no orphan keys.
  for (const key of Object.keys(state.studio?.internal?.projects ?? {})) {
    if (!(key in projects)) {
      return `studio.internal.projects references missing project '${key}'`;
    }
  }

  return null;
}

export function validateSaveData(parsed: unknown): ValidationResult {
  const result = SAVE_SCHEMA.safeParse(parsed);
  if (!result.success) {
    return { success: false, error: JSON.stringify(result.error.issues, null, 2) };
  }
  const integrityError = checkReferentialIntegrity(result.data);
  if (integrityError) {
    return { success: false, error: integrityError };
  }
  return { success: true, data: result.data };
}

export function parseAndValidate(jsonString: string): ValidationResult {
  const parsed = safeJsonParse(jsonString);
  return validateSaveData(parsed);
}

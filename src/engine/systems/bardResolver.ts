import archiveData from "../data/narrative/archive.json";
import { ResolutionRequest, NarrativeArchive, NarrativeDomainKey, NarrativeContext } from "../data/narrative/archive";
import { RandomGenerator } from "../utils/rng";

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * The Bard Resolver
 * Decouples logic from text by resolving strings from a tiered archive.
 */
export const BardResolver = {
  /**
   * Resolves a narrative string based on domain, sub-domain, and intensity.
   */
  resolve<D extends NarrativeDomainKey>(request: ResolutionRequest<D>): string {
    const { domain, subDomain, intensity, context, tone = "Standard", variant } = request;
    const archive = archiveData as unknown as NarrativeArchive;

    const domainData = archive[domain];
    if (!domainData) return `[MISSING DOMAIN: ${domain}]`;

    let subDomainData: unknown = domainData;
    const subDomainParts = subDomain.split(".");

    for (const part of subDomainParts) {
      if (FORBIDDEN_KEYS.has(part)) {
        return `[INVALID SUB-DOMAIN: ${subDomain}]`;
      }
      if (subDomainData && typeof subDomainData === "object" && part in subDomainData) {
        if (FORBIDDEN_KEYS.has(part)) return `[INVALID KEY: ${part}]`;
        subDomainData = (subDomainData as Record<string, unknown>)[part];
      } else {
        return `[MISSING SUB-DOMAIN: ${subDomain}]`;
      }
    }

    // Helper to pick and interpolate
    const pickAndResolve = (templates: string[] | undefined): string | null => {
      if (!templates || templates.length === 0) return null;
      return this.interpolate(this.pick(templates, request.rng), context || {}, request.rng);
    };

    // 0. Handle Flat Dictionary/Tier Entry
    if (Array.isArray(subDomainData)) {
      return pickAndResolve(subDomainData) || `[EMPTY ARCHIVE: ${domain}.${subDomain}]`;
    }

    // 1. Variant-Specific Resolution (High Priority)
    if (
      variant &&
      subDomainData !== null &&
      typeof subDomainData === "object" &&
      variant in subDomainData
    ) {
      const variantData = (subDomainData as Record<string, string[]>)[variant];
      if (Array.isArray(variantData)) {
        return pickAndResolve(variantData) || `[EMPTY VARIANT: ${variant}]`;
      }
    }

    // 2. Find Tier Data
    const tierKey = this.getTier(domain, intensity);
    const data = subDomainData as Record<string, unknown>;

    // Try finding templates in order of specificity:
    const templates =
      (data[tone] &&
        typeof data[tone] === "object" &&
        (data[tone] as Record<string, string[]>)[tierKey]) ||
      (data["Trade"] &&
        typeof data["Trade"] === "object" &&
        (data["Trade"] as Record<string, string[]>)[tierKey]) ||
      (data["Standard"] &&
        typeof data["Standard"] === "object" &&
        (data["Standard"] as Record<string, string[]>)[tierKey]) ||
      (data[tierKey] as string[]);

    if (Array.isArray(templates)) {
      const result = pickAndResolve(templates);
      if (result) return result;
    }

    // 3. Extreme fallback: Pick any valid tier
    const allPossibleKeys = Object.keys(data);
    for (const key of allPossibleKeys) {
      const potentialTierData = data[key];
      if (Array.isArray(potentialTierData)) {
        const result = pickAndResolve(potentialTierData);
        if (result) return result;
      } else if (typeof potentialTierData === "object" && potentialTierData !== null) {
        const folder = potentialTierData as Record<string, string[]>;
        const nestedTiers = Object.keys(folder);
        for (const t of nestedTiers) {
          if (Array.isArray(folder[t])) {
            const result = pickAndResolve(folder[t]);
            if (result) return result;
          }
        }
      }
    }

    return `[EMPTY ARCHIVE: ${domain}.${subDomain}]`;
  },

  /**
   * Logic to map 0-100 score to a Tier name.
   */
  getTier(domain: NarrativeDomainKey, score: number): string {
    if (domain === "Review") {
      if (score >= 75) return "Acclaimed";
      if (score >= 40) return "Mixed";
      return "Panned";
    }
    if (domain === "Greenlight") {
      if (score >= 70) return "Prestige";
      if (score >= 40) return "Solid";
      return "Risky";
    }
    if (domain === "Talent" || domain === "Industry") {
      if (score >= 80) return "Elite";
      return "Standard";
    }
    // Default tiering behavior
    if (score >= 80) return "Elite";
    if (score >= 40) return "Standard";
    return "Common";
  },

  /**
   * Interpolates templates using double curly braces {{key}}.
   * If a key is missing from context, it checks the Dictionary domain in the archive.
   */
  interpolate(template: string, context: NarrativeContext, rng?: RandomGenerator): string {
    const archive = archiveData as unknown as NarrativeArchive;
    const dictionary = (archive["Dictionary"] as unknown as Record<string, string[]>) || {};

    let result = template;
    let limit = 5; // Prevent infinite loops

    while (result.includes("{{") && limit > 0) {
      const nextResult = result.replace(/\{\{(.*?)\}\}/g, (match: string, key: string) => {
        const trimmedKey = key.trim();

        // 1. Check direct context
        const ctx = context as Record<string, unknown>;
        const val = ctx[trimmedKey];
        if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
          return String(val);
        }

        // 2. Check Dictionary
        const entry = dictionary[trimmedKey];
        if (entry && Array.isArray(entry)) {
          return this.pick(entry, rng);
        }

        // 3. Keep as is if not found
        return match;
      });

      if (nextResult === result) break;
      result = nextResult;
      limit--;
    }

    return result;
  },

  /**
   * Picks a random item from an array.
   */
  pick<T>(items: T[], rng?: RandomGenerator): T {
    if (rng) {
      return rng.pick(items);
    }
    return items[0];
  },
};

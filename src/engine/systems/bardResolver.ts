import archiveData from '../data/narrative/archive.json';
import { ResolutionRequest, NarrativeArchive } from '../data/narrative/archive';
import { RandomGenerator } from '../utils/rng';

/**
 * The Bard Resolver
 * Decouples logic from text by resolving strings from a tiered archive.
 */
export const BardResolver = {
  /**
   * Resolves a narrative string based on domain, sub-domain, and intensity.
   */
  resolve(request: ResolutionRequest): string {
    const { domain, subDomain, intensity, context, tone = 'Standard', variant } = request;
    const archive = archiveData as NarrativeArchive;

    const domainData = archive[domain];
    if (!domainData) return `[MISSING DOMAIN: ${domain}]`;

    const subDomainData = domainData[subDomain];
    if (!subDomainData) return `[MISSING SUB-DOMAIN: ${subDomain}]`;

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
    if (variant && typeof subDomainData === 'object' && variant in subDomainData) {
      const variantData = (subDomainData as Record<string, any>)[variant];
      if (Array.isArray(variantData)) {
        return pickAndResolve(variantData) || `[EMPTY VARIANT: ${variant}]`;
      }
    }

    // 2. Find Tier Data
    const tierKey = this.getTier(domain, intensity);
    const data = subDomainData as unknown as Record<string, Record<string, string[]>>;

    // Try finding templates in order of specificity:
    const templates = 
      (data[tone] && typeof data[tone] === 'object' && data[tone][tierKey]) ||
      (data['Trade'] && typeof data['Trade'] === 'object' && data['Trade'][tierKey]) ||
      (data['Standard'] && typeof data['Standard'] === 'object' && data['Standard'][tierKey]) ||
      (data[tierKey] as unknown as string[]);

    if (Array.isArray(templates)) {
      const result = pickAndResolve(templates);
      if (result) return result;
    }

    // 3. Extreme fallback: Pick any valid tier
    const allPossibleKeys = Object.keys(data);
    for (const key of allPossibleKeys) {
      const potentialTierData = data[key] as unknown;
      if (Array.isArray(potentialTierData)) {
        const result = pickAndResolve(potentialTierData);
        if (result) return result;
      } else if (typeof potentialTierData === 'object' && potentialTierData !== null) {
        const nestedTiers = Object.keys(potentialTierData);
        const folder = potentialTierData as Record<string, string[]>;
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
  getTier(domain: string, score: number): string {
    if (domain === 'Review') {
      if (score >= 75) return 'Acclaimed';
      if (score >= 40) return 'Mixed';
      return 'Panned';
    }
    if (domain === 'Greenlight') {
      if (score >= 70) return 'Prestige';
      if (score >= 40) return 'Solid';
      return 'Risky';
    }
    if (domain === 'Talent' || domain === 'Industry') {
      // For these domains, subDomain often dictates the tier or we use boolean-like tiers
      if (score >= 80) return 'Elite';
      if (score >= 50) return 'Standard';
      return 'Standard'; // Default
    }
    // Default tiering behavior
    if (score >= 80) return 'Elite';
    if (score >= 40) return 'Standard';
    return 'Common';
  },

  /**
   * Interpolates templates using double curly braces {{key}}.
   * If a key is missing from context, it checks the Dictionary domain in the archive.
   */
  interpolate(template: string, context: Record<string, any>, rng?: RandomGenerator): string {
    const archive = archiveData as NarrativeArchive;
    const dictionary = (archive['Dictionary'] as unknown as Record<string, string[]>) || {};

    // Use a loop or iterative replacement to handle potential recursive tags
    let result = template;
    let limit = 5; // Prevent infinite loops

    while (result.includes('{{') && limit > 0) {
      const nextResult = result.replace(/\{\{(.*?)\}\}/g, (match: string, key: string) => {
        const trimmedKey = key.trim();
        
        // 1. Check direct context
        if (context[trimmedKey] !== undefined) {
          return String(context[trimmedKey]);
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
   * If rng is provided, it uses the deterministic pool.
   */
  pick<T>(items: T[], rng?: RandomGenerator): T {
    if (rng) {
      return rng.pick(items);
    }
    // 🌌 Enforcement: Return first element instead of using Math.random()
    return items[0];
  }
};

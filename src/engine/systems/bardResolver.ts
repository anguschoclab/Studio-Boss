import archiveData from '../data/narrative/archive.json';
import { NarrativeArchive, ResolutionRequest } from '../data/narrative/archive';
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
    const archive = archiveData as any;

    const domainData = archive[domain];
    if (!domainData) return `[MISSING DOMAIN: ${domain}]`;

    const subDomainData = domainData[subDomain];
    if (!subDomainData) return `[MISSING SUB-DOMAIN: ${subDomain}]`;

    // 0. Handle Flat Dictionary/Tier Entry
    if (Array.isArray(subDomainData)) {
      return this.interpolate(this.pick(subDomainData, request.rng), context || {}, request.rng);
    }

    // 1. Variant-Specific Resolution (High Priority)
    // If a specific variant key is requested (e.g. for Options or specific story arcs)
    if (variant && subDomainData[variant]) {
      const templates = subDomainData[variant];
      return this.interpolate(this.pick(templates, request.rng), context || {}, request.rng);
    }

    // 2. Find Tier Data
    // A tone can be: specified in request, 'Standard' (default), or inferred.
    let templates: string[] = [];
    const tierKey = this.getTier(domain, intensity);

    // Try finding templates in order of specificity:
    // 1. Specified tone OR 'Standard'
    if (subDomainData[tone] && subDomainData[tone][tierKey]) {
      templates = subDomainData[tone][tierKey];
    } 
    // 2. 'Trade' fallback (the industry standard)
    else if (subDomainData['Trade'] && subDomainData['Trade'][tierKey]) {
      templates = subDomainData['Trade'][tierKey];
    }
    // 3. 'Standard' fallback
    else if (subDomainData['Standard'] && subDomainData['Standard'][tierKey]) {
      templates = subDomainData['Standard'][tierKey];
    }
    // 4. Flat structure (domain[subDomain][tier])
    else if (subDomainData[tierKey]) {
      templates = subDomainData[tierKey];
    }

    if (!templates || templates.length === 0) {
      // 5. Extreme fallback: Pick any valid tier in any available tone
      const allPossibleKeys = Object.keys(subDomainData);
      for (const key of allPossibleKeys) {
        const potentialTierData = subDomainData[key];
        if (typeof potentialTierData === 'object' && !Array.isArray(potentialTierData)) {
          // It's a tone/bucket object, check its tiers
          const nestedTiers = Object.keys(potentialTierData);
          const firstValidTier = nestedTiers.find(t => Array.isArray(potentialTierData[t]) && potentialTierData[t].length > 0);
          if (firstValidTier) {
            templates = potentialTierData[firstValidTier];
            break;
          }
        } else if (Array.isArray(potentialTierData) && potentialTierData.length > 0) {
          // It's a flat tier array
          templates = potentialTierData;
          break;
        }
      }
    }

    if (!templates || templates.length === 0) {
      return `[EMPTY ARCHIVE: ${domain}.${subDomain}]`;
    }

    const template = this.pick(templates, request.rng);
    return this.interpolate(template, context || {}, request.rng);
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
    const archive = archiveData as any;
    const dictionary = archive['Dictionary'] || {};

    // Use a loop or iterative replacement to handle potential recursive tags
    let result = template;
    let limit = 5; // Prevent infinite loops

    while (result.includes('{{') && limit > 0) {
      const nextResult = result.replace(/\{\{(.*?)\}\}/g, (match, key) => {
        const trimmedKey = key.trim();
        
        // 1. Check direct context
        if (context[trimmedKey] !== undefined) {
          return context[trimmedKey];
        }

        // 2. Check Dictionary
        if (dictionary[trimmedKey] && Array.isArray(dictionary[trimmedKey])) {
          return this.pick(dictionary[trimmedKey], rng);
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
    return items[Math.floor(Math.random() * items.length)];
  }
};

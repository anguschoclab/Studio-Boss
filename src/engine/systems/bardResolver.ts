import archiveData from '../data/narrative/archive.json';
import { NarrativeArchive, ResolutionRequest } from '../data/narrative/archive';

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

    // 1. Variant-Specific Resolution (High Priority)
    // If a specific variant key is requested (e.g. for Options or specific story arcs)
    if (variant && subDomainData[variant]) {
      const templates = subDomainData[variant];
      return this.interpolate(this.pick(templates), context || {});
    }

    // 2. Tiered/Intensity Resolution (Legacy Fallback)
    // Attempt to drill down into Tone if it exists in the archive
    let tierData = subDomainData;
    if (subDomainData[tone]) {
      tierData = subDomainData[tone];
    } else if (subDomainData['Standard']) {
      tierData = subDomainData['Standard'];
    }

    // Map intensity (0-100) to Tiers
    const tierKey = this.getTier(domain, intensity);
    let templates = tierData[tierKey];

    // Final fallback: if the specific tier is missing, check the base subDomainData for that tier
    if (!templates || templates.length === 0) {
      templates = subDomainData[tierKey];
    }

    if (!templates || templates.length === 0) {
      // Find any available tier
      const allPossibleTiers = Object.keys(tierData);
      const fallbackTier = allPossibleTiers[0];
      const fallbackTemplates = tierData[fallbackTier];
      if (!fallbackTemplates || fallbackTemplates.length === 0) {
        return `[EMPTY ARCHIVE: ${domain}.${subDomain}]`;
      }
      return this.interpolate(this.pick(fallbackTemplates), context || {});
    }

    const template = this.pick(templates) as string;
    return this.interpolate(template, context || {});
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
   */
  interpolate(template: string, context: Record<string, any>): string {
    return template.replace(/\{\{(.*?)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return context[trimmedKey] !== undefined ? context[trimmedKey] : match;
    });
  },

  /**
   * Picks a random item from an array.
   */
  pick<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }
};

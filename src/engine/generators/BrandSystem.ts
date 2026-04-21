import { pick } from '../utils';
import { 
  CONGLOMERATE_PREFIXES, 
  PREFIXES, 
  SUFFIXES, 
  NETWORK_SUFFIXES, 
  STREAMER_SUFFIXES, 
  PREMIUM_SUFFIXES 
} from '../data/names.data';

export type BrandIdentity = {
  core: string;
  isConglomerate: boolean;
};

/**
 * Studio Boss - Procedural Branding Engine
 * Generates brand identities that can be used to label multiple subsidiaries.
 */
export class BrandSystem {
  /**
   * Generates a new brand identity.
   * 50% chance of being a Conglomerate (uses strong, corporate prefixes).
   * 50% chance of being Legacy (uses more traditional/artistic prefixes).
   */
  static generateIdentity(existing: Set<string>): BrandIdentity {
    let core: string;
    const isConglomerate = Math.random() > 0.5;
    let attempts = 0;

    do {
      core = isConglomerate ? pick(CONGLOMERATE_PREFIXES) : pick(PREFIXES);
      attempts++;
    } while (existing.has(core) && attempts < 50);

    return { core, isConglomerate };
  }

  /**
   * Generates a studio name based on a brand identity.
   */
  static getStudioName(identity: BrandIdentity): string {
    const suffix = pick(['Pictures', 'Studios', 'Entertainment', 'Films', 'Media', 'Productions']);
    return `${identity.core} ${suffix}`;
  }

  /**
   * Generates a streaming platform name based on a brand identity.
   */
  static getStreamingName(identity: BrandIdentity): string {
    if (identity.isConglomerate) {
      // Conglomerates usually use brand-plus naming (Apex+)
      const suffix = pick(['+', 'Plus', 'Max', 'Go', 'Play', 'Hub']);
      return `${identity.core}${suffix}`;
    } else {
      // Legacy brands often use more traditional names or "On Demand"
      const suffix = pick(['Cinema', 'Select', 'Direct', 'Watch', 'Premier', 'On Demand']);
      return `${identity.core} ${suffix}`;
    }
  }

  /**
   * Generates a network name based on a brand identity.
   */
  static getNetworkName(identity: BrandIdentity): string {
    const suffix = pick(NETWORK_SUFFIXES);
    return `${identity.core} ${suffix}`;
  }

  /**
   * Generates a standalone "Legacy" name that doesn't follow a conglomerate pattern.
   */
  static generateLegacyStandalone(existing: Set<string>): string {
    const identity = this.generateIdentity(existing);
    return this.getStudioName(identity);
  }
}

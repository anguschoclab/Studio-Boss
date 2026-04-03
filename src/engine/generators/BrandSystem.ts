import { RandomGenerator } from '../utils/rng';
import { pick } from '../utils';
import { 
  CONGLOMERATE_PREFIXES, 
  PREFIXES, 
  NETWORK_SUFFIXES, 
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
   * 50% chance of being a Conglomerate.
   */
  static generateIdentity(existing: Set<string>, rng: any): BrandIdentity {
    let core: string;
    const isConglomerate = (rng.next ? (rng && rng.next ? rng.next() : Math.random()) : Math.random()) > 0.5;
    let attempts = 0;

    do {
      core = isConglomerate ? (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(CONGLOMERATE_PREFIXES) : (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(PREFIXES);
      attempts++;
    } while (existing.has(core) && attempts < 50);

    return { core, isConglomerate };
  }

  /**
   * Generates a studio name based on a brand identity.
   */
  static getStudioName(identity: BrandIdentity, rng: RandomGenerator): string {
    const suffixes = ['Pictures', 'Studios', 'Entertainment', 'Films', 'Media', 'Productions'];
    const suffix = (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(suffixes);
    return `${identity.core} ${suffix}`;
  }

  /**
   * Generates a streaming platform name based on a brand identity.
   */
  static getStreamingName(identity: BrandIdentity, rng: RandomGenerator): string {
    if (identity.isConglomerate) {
      const suffixes = ['+', 'Plus', 'Max', 'Go', 'Play', 'Hub'];
      const suffix = (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(suffixes);
      return `${identity.core}${suffix}`;
    } else {
      const suffixes = ['Cinema', 'Select', 'Direct', 'Watch', 'Premier', 'On Demand'];
      const suffix = (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(suffixes);
      return `${identity.core} ${suffix}`;
    }
  }

  /**
   * Generates a network name based on a brand identity.
   */
  static getNetworkName(identity: BrandIdentity, rng: RandomGenerator): string {
    const suffix = (rng && (rng && rng.pick ? rng.pick.bind(rng) : pick) ? (rng && rng.pick ? rng.pick.bind(rng) : pick).bind(rng) : pick)(NETWORK_SUFFIXES);
    return `${identity.core} ${suffix}`;
  }

  /**
   * Generates a standalone "Legacy" name.
   */
  static generateLegacyStandalone(existing: Set<string>, rng: RandomGenerator): string {
    const identity = this.generateIdentity(existing, rng as any);
    return this.getStudioName(identity, rng);
  }
}

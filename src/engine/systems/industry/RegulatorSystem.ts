import { GameState, StateImpact } from "@/engine/types";
import { rand } from "../../utils";

/**
 * Studio Boss - Regulator System (Anti-Trust)
 * Assesses whether a merger or acquisition should be blocked.
 */
export class RegulatorSystem {
  /**
   * Calculates the current market share of a studio.
   * Market share is a weighted average of prestige and subscriber counts.
   */
  static getMarketShare(state: GameState, studioId: string | "player"): number {
    const playerStudioId = state.studio.id;
    const isTargetPlayer = studioId === "player" || studioId === playerStudioId;

    let totalPrestige = state.studio.prestige;
    const rivals = state.entities.rivals || {};
    for (const rId in rivals) {
      totalPrestige += rivals[rId].prestige || 0;
    }

    const studioPrestige = isTargetPlayer
      ? state.studio.prestige
      : state.entities.rivals[studioId]?.prestige || 0;

    const totalSubs = state.market.buyers
      .filter((b) => b.archetype === "streamer")
      .reduce(
        (acc, b) =>
          acc +
          ((b as unknown as import("../../types/studio.types").StreamerPlatform).subscribers || 0),
        0
      );

    const studioSubs = state.market.buyers
      .filter(
        (b) =>
          b.archetype === "streamer" && b.ownerId === (isTargetPlayer ? playerStudioId : studioId)
      )
      .reduce(
        (acc, b) =>
          acc +
          ((b as unknown as import("../../types/studio.types").StreamerPlatform).subscribers || 0),
        0
      );

    const prestigeShare = (studioPrestige / totalPrestige) * 100;
    const subShare = totalSubs > 0 ? (studioSubs / totalSubs) * 100 : 0;

    // Weighted share: 60% prestige, 40% audience reach
    return prestigeShare * 0.6 + subShare * 0.4;
  }

  /**
   * Evaluates if a merger between an acquirer and a target should be blocked.
   * Returns true if the merger is BLOCKED.
   */
  static isBlocked(
    state: GameState,
    acquirerId: string | "player",
    targetId: string
  ): { blocked: boolean; sharePreview: number; reason?: string } {
    const currentShare = this.getMarketShare(state, acquirerId);
    const targetShare = this.getMarketShare(state, targetId);
    const combinedShare = currentShare + targetShare;

    // Regulators become concerned at > 25% share, and aggressively block at > 35%.
    let blockChance = 0;
    if (combinedShare > 35) {
      blockChance = 0.9; // 90% chance of blockage
    } else if (combinedShare > 25) {
      blockChance = 0.4 + (combinedShare - 25) * 0.05; // Sliding scale
    }

    if (rand() < blockChance) {
      return {
        blocked: true,
        sharePreview: combinedShare,
        reason: combinedShare > 35 ? "Severe Concentration of Media Power" : "Competition Concerns",
      };
    }

    return { blocked: false, sharePreview: combinedShare };
  }

  /**
   * Weekly Tick: Evaluates market conditions and potential anti-trust warnings.
   */
  static tick(
    state: GameState,
    rng: import("../../utils/rng").RandomGenerator
  ): import("../../types/state.types").StateImpact[] {
    const impacts: import("../../types/state.types").StateImpact[] = [];
    const playerShare = this.getMarketShare(state, "player");

    // If player is too powerful, regulators issue a headline
    if (playerShare > 30 && rng.next() < 0.05) {
      // 5% chance if > 30% share
      impacts.push({
        type: "HEADLINE_POSTED",
        payload: {
          id: `HL-${state.week}-REG`,
          week: state.week,
          category: "industry",
          text: `REGULATORY WATCH: Regulators express concern over ${state.studio.name}'s growing market dominance.`,
        },
      } as unknown as StateImpact);
    }

    return impacts;
  }
}

import type { CastingConstraintOption } from "./casting.types";
import type { WeekSummary } from "./engine.types";
import type { Award } from "./project.types";
import type { RebootProposal } from "../systems/ip/ipRebootEngine";
import type { FestivalAuctionResult } from "../systems/festivals/festivalAuctionEngine";

export type ModalType =
  | "CRISIS"
  | "AWARDS"
  | "SUMMARY"
  | "GAME_OVER"
  | "RELEASE_STRATEGY"
  | "POST_PRODUCTION"
  | "ACHIEVEMENT_UNLOCKED"
  | "FESTIVAL_MARKET"
  | "PACKAGE_DEAL_OFFERED"
  | "DIRECTORS_CUT_AVAILABLE"
  | "UPFRONTS"
  | "BIDDING_WAR"
  | "BREAKOUT_BIDDING_WAR"
  | "REBOOT_OPPORTUNITY"
  | "DISTRESSED_ASSET_OFFER"
  | "GREENLIGHT_DECISION"
  | "CASTING_CONSTRAINT"
  | "ACQUISITION_CONFIRM";

/**
 * Payload shapes emitted for each modal type. Modal components narrow these
 * further with local casts where the payload carries engine entities.
 */
export interface ModalPayloadMap {
  CRISIS: { projectId?: string; crisis?: import("./engine.types").ActiveCrisis; id?: string };
  AWARDS: { week?: number; year?: number; awards: Award[]; body?: string };
  SUMMARY: WeekSummary;
  GAME_OVER: { reason?: string; cashDeficit?: number };
  RELEASE_STRATEGY: { projectId: string; projectTitle?: string };
  POST_PRODUCTION: { projectId?: string; projectTitle?: string };
  ACHIEVEMENT_UNLOCKED: {
    achievementId: string;
    name: string;
    description: string;
    week: number;
  };
  FESTIVAL_MARKET: { results: FestivalAuctionResult[]; festivalBody?: string; week?: number };
  PACKAGE_DEAL_OFFERED: {
    agencyId: string;
    agencyName: string;
    agencyArchetype: string;
    agencyDescription: string;
    leadTalentId: string;
    leadTalentName: string;
    bundledTalentId: string;
    bundledTalentName: string;
    packageDiscount: number;
    reason: string;
  };
  DIRECTORS_CUT_AVAILABLE: { projectId: string; projectTitle?: string };
  UPFRONTS: { results: unknown[]; week?: number };
  BIDDING_WAR: {
    attackerId?: string;
    attackerName?: string;
    targetId?: string;
    targetName?: string;
    offerAmount?: number;
    week?: number;
  };
  BREAKOUT_BIDDING_WAR: {
    talentId: string;
    currentFee?: number;
    competingStudios?: string[];
  };
  REBOOT_OPPORTUNITY: RebootProposal;
  DISTRESSED_ASSET_OFFER: { offerId: string };
  GREENLIGHT_DECISION: { projectId: string };
  CASTING_CONSTRAINT: {
    violationId: string;
    projectId: string;
    talentId: string;
    options: CastingConstraintOption[];
  };
  ACQUISITION_CONFIRM: { targetId: string };
}

export type ModalPayload = ModalPayloadMap[ModalType];

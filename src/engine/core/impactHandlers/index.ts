import { GameState, StateImpact } from '@/engine/types';

// Import all handler modules
import * as financeHandlers from './financeHandlers';
import * as projectHandlers from './projectHandlers';
import * as talentHandlers from './talentHandlers';
import * as relationshipHandlers from './relationshipHandlers';
import * as marketHandlers from './marketHandlers';
import * as industryHandlers from './industryHandlers';
import * as studioHandlers from './studioHandlers';
import * as ipHandlers from './ipHandlers';
import * as tvHandlers from './tvHandlers';
import * as dealHandlers from './dealHandlers';
import * as noopHandlers from './noopHandlers';

/**
 * Handler registry mapping impact types to their handler functions
 */
const handlerRegistry: Record<string, (state: GameState, impact: StateImpact) => GameState> = {
  // Finance handlers
  'FUNDS_CHANGED': financeHandlers.handleFundsChanged,
  'LEDGER_UPDATED': financeHandlers.handleLedgerUpdated,
  'FINANCE_SNAPSHOT_ADDED': financeHandlers.handleFinanceSnapshotAdded,
  'SYNC_M_A_FUNDS': financeHandlers.handleSyncMAFunds,
  'FUNDS_DEDUCTED': financeHandlers.handleFundsDeducted,
  'FINANCE_TRANSACTION': financeHandlers.handleFinanceTransaction,
  'MARKET_EVENT_UPDATED': financeHandlers.handleMarketEventUpdated,

  // Project handlers
  'PROJECT_UPDATED': projectHandlers.handleProjectUpdated,
  'PROJECT_REMOVED': projectHandlers.handleProjectRemoved,
  'AWARD_WON': projectHandlers.handleAwardWon,
  'PILOT_GRADUATED': projectHandlers.handlePilotGraduated,

  // Talent handlers
  'TALENT_UPDATED': talentHandlers.handleTalentUpdated,
  'TALENT_ADDED': talentHandlers.handleTalentAdded,
  'TALENT_REMOVED': talentHandlers.handleTalentRemoved,
  'CASTING_CONSTRAINT_CHECKED': talentHandlers.handleCastingConstraintChecked,
  'MEDICAL_LEAVE_TRIGGERED': talentHandlers.handleMedicalLeaveTriggered,

  // Relationship handlers
  'RELATIONSHIP_FORMED': relationshipHandlers.handleRelationshipFormed,
  'RELATIONSHIP_UPDATED': relationshipHandlers.handleRelationshipUpdated,
  'CLIQUE_FORMED': relationshipHandlers.handleCliqueFormed,
  'CLIQUE_UPDATED': relationshipHandlers.handleCliqueUpdated,
  'SCREENPLAY_NOTE_CREATED': relationshipHandlers.handleScreenplayNoteCreated,
  'SCREENPLAY_NOTE_IMPLEMENTED': relationshipHandlers.handleScreenplayNoteImplemented,
  'PRODUCTION_ADDITION_CREATED': relationshipHandlers.handleProductionAdditionCreated,
  'CREDIT_SCENE_CREATED': relationshipHandlers.handleCreditSceneCreatedOrUpdated,
  'CREDIT_SCENE_UPDATED': relationshipHandlers.handleCreditSceneCreatedOrUpdated,
  'TALK_SHOW_APPEARANCE_CREATED': relationshipHandlers.handleTalkShowAppearanceCreated,
  'PHOTOSHOOT_CREATED': relationshipHandlers.handlePhotoshootCreated,
  'PRESS_TOUR_CREATED': relationshipHandlers.handlePressTourCreated,
  'BREAKOUT_STAR_CREATED': relationshipHandlers.handleBreakoutStarCreatedOrUpdated,
  'BREAKOUT_STAR_UPDATED': relationshipHandlers.handleBreakoutStarCreatedOrUpdated,
  'GUEST_STAR_OPPORTUNITY': relationshipHandlers.handleGuestStarOpportunityOrBooked,
  'GUEST_STAR_BOOKED': relationshipHandlers.handleGuestStarOpportunityOrBooked,
  'DISCOVERY_STATE_UPDATED': relationshipHandlers.handleDiscoveryStateUpdated,

  // Market handlers
  'BUYER_UPDATED': marketHandlers.handleBuyerUpdated,
  'OPPORTUNITY_UPDATED': marketHandlers.handleOpportunityUpdated,
  'TRENDS_UPDATED': marketHandlers.handleTrendsUpdated,

  // Industry handlers
  'INDUSTRY_UPDATE': industryHandlers.handleIndustryUpdate,
  'SCANDAL_ADDED': industryHandlers.handleScandalAdded,
  'SCANDAL_REMOVED': industryHandlers.handleScandalRemoved,
  'RIVAL_UPDATED': industryHandlers.handleRivalUpdated,

  // Studio handlers
  'PRESTIGE_CHANGED': studioHandlers.handlePrestigeChanged,
  'NEWS_ADDED': studioHandlers.handleNewsAdded,
  'SYSTEM_TICK': studioHandlers.handleSystemTick,

  // IP handlers
  'FRANCHISE_UPDATED': ipHandlers.handleFranchiseUpdated,
  'VAULT_ASSET_UPDATED': ipHandlers.handleVaultAssetUpdated,
  'FORMAT_LICENSED': ipHandlers.handleFormatLicensed,

  // TV handlers
  'TV_RECOMMENDATION_CREATED': tvHandlers.handleTVRecommendationCreated,
  'TV_RECOMMENDATION_ACCEPTED': tvHandlers.handleTVRecommendationAccepted,
  'TV_RECOMMENDATION_STATE_UPDATED': tvHandlers.handleTVRecommendationStateUpdated,

  // Deal handlers
  'DEAL_UPDATED': dealHandlers.handleDealUpdated,

  // No-op handlers (trigger UI modals/notifications)
  'CASTING_CONSTRAINT_VIOLATION': noopHandlers.handleCastingConstraintViolation,
  'CASTING_PREMIUM_DEMAND': noopHandlers.handleCastingPremiumDemand,
  'CASTING_ALTERNATIVE_SUGGESTED': noopHandlers.handleCastingAlternativeSuggested,
};

/**
 * Apply a single StateImpact to the GameState using the handler registry
 * This replaces the massive switch statement in the original impactReducer
 */
export function applySingleImpact(state: GameState, impact: StateImpact): GameState {
  // Apply validation/sanitization for specific impact types
  if (impact.type === 'FUNDS_CHANGED') {
    let amount = impact.payload.amount;
    if (isNaN(amount) || amount === null) amount = 0;
    if (Math.abs(amount) > 10_000_000_000) amount = Math.sign(amount) * 10_000_000_000;
    impact.payload.amount = amount;
  }

  if (impact.type === 'RIVAL_UPDATED' && impact.payload.update?.cash !== undefined) {
    let val = impact.payload.update.cash;
    if (isNaN(val) || val === null) val = 0;
    if (Math.abs(val) > 1_000_000_000_000) val = Math.sign(val) * 1_000_000_000_000;
    impact.payload.update.cash = val;
  }

  // Look up handler and apply
  const handler = handlerRegistry[impact.type as keyof typeof handlerRegistry];
  if (handler) {
    return handler(state, impact);
  }

  // If no handler found, return state unchanged
  return state;
}

// Re-export all handlers for testing purposes
export * from './financeHandlers';
export * from './projectHandlers';
export * from './talentHandlers';
export * from './relationshipHandlers';
export * from './marketHandlers';
export * from './industryHandlers';
export * from './studioHandlers';
export * from './ipHandlers';
export * from './tvHandlers';
export * from './dealHandlers';
export * from './noopHandlers';

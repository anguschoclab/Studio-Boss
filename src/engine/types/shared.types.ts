/**
 * Shared Type Utilities for Branded IDs
 */

/**
 * Brand type utility to create opaque types for IDs.
 * Use this to distinguish between different types of strings (e.g. TalentId vs ProjectId).
 */
export type Brand<T, TBrand> = T & { __brand: TBrand };

// --- ID Brands ---
export type TalentId = Brand<string, 'TalentId'>;
export type StudioId = Brand<string, 'StudioId'>;
export type ProjectId = Brand<string, 'ProjectId'>;
export type ContractId = Brand<string, 'ContractId'>;
export type AgencyId = Brand<string, 'AgencyId'>;
export type AgentId = Brand<string, 'AgentId'>;
export type FamilyId = Brand<string, 'FamilyId'>;
export type FranchiseId = Brand<string, 'FranchiseId'>;
export type BuyerId = Brand<string, 'BuyerId'>;
export type AssetId = Brand<string, 'AssetId'>;
export type OpportunityId = Brand<string, 'OpportunityId'>;
export type ScandalId = Brand<string, 'ScandalId'>;
export type PactId = Brand<string, 'PactId'>;
export type RelationshipId = Brand<string, 'RelationshipId'>;
export type CliqueId = Brand<string, 'CliqueId'>;
export type HeadlineId = Brand<string, 'HeadlineId'>;
export type NewsId = Brand<string, 'NewsId'>;
export type MarketEventId = Brand<string, 'MarketEventId'>;
export type AwardId = Brand<string, 'AwardId'>;
export type SimulationReportId = Brand<string, 'SimulationReportId'>;
export type DiscoveryId = Brand<string, 'DiscoveryId'>;
export type CastingId = Brand<string, 'CastingId'>;

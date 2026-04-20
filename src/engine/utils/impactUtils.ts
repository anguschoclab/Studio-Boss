import { StateImpact } from '../types/state.types';
import { CRISIS_POOLS, CrisisTemplate } from '../data/crises.data';

export function getCrisisData(id: string): CrisisTemplate | undefined {
    return CRISIS_POOLS.find(c => c.id === id);
}

/**
 * Merges multiple StateImpact objects into a single result.
 * Arrays are concatenated, numbers are summed, and other fields are prioritized by the last non-undefined value.
 */
export function mergeImpacts(...impacts: (StateImpact | undefined)[]): StateImpact {
    const result: StateImpact = {
        type: 'SYSTEM_TICK' as any // Initial type cast for merging
    } as BaseImpact;

    for (const impact of impacts) {
        if (!impact) continue;

        // Cash & Prestige
        if (impact.cashChange !== undefined) {
            result.cashChange = (result.cashChange || 0) + impact.cashChange;
        }
        if (impact.prestigeChange !== undefined) {
            result.prestigeChange = (result.prestigeChange || 0) + impact.prestigeChange;
        }

        // Concatenate arrays
        if (impact.projectUpdates) {
            result.projectUpdates = [...(result.projectUpdates || []), ...impact.projectUpdates];
        }
        if (impact.talentUpdates) {
            result.talentUpdates = [...(result.talentUpdates || []), ...impact.talentUpdates];
        }
        if (impact.rivalUpdates) {
            result.rivalUpdates = [...(result.rivalUpdates || []), ...impact.rivalUpdates];
        }
        if (impact.buyerUpdates) {
            result.buyerUpdates = [...(result.buyerUpdates || []), ...impact.buyerUpdates];
        }
        if (impact.removeContracts) {
            result.removeContracts = [...(result.removeContracts || []), ...impact.removeContracts];
        }
        if (impact.newHeadlines) {
            result.newHeadlines = [...(result.newHeadlines || []), ...impact.newHeadlines];
        }
        if (impact.newsEvents) {
            result.newsEvents = [...(result.newsEvents || []), ...impact.newsEvents];
        }
        if (impact.newOpportunities) {
            result.newOpportunities = [...(result.newOpportunities || []), ...impact.newOpportunities];
        }
        if (impact.newScandals) {
            result.newScandals = [...(result.newScandals || []), ...impact.newScandals];
        }
        if (impact.scandalUpdates) {
            result.scandalUpdates = [...(result.scandalUpdates || []), ...impact.scandalUpdates];
        }
        if (impact.uiNotifications) {
            result.uiNotifications = [...(result.uiNotifications || []), ...impact.uiNotifications];
        }

        // Replaceable latest-wins fields
        if (impact.newTrends) result.newTrends = impact.newTrends;
        if (impact.newMarketEvents) result.newMarketEvents = impact.newMarketEvents;
        if (impact.newRumors) result.newRumors = impact.newRumors;
    }

    return result;
}

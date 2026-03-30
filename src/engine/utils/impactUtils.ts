import { StateImpact } from '../types/state.types';

/**
 * Merges multiple StateImpact objects into a single result.
 * Arrays are concatenated, numbers are summed, and other fields are prioritized by the last non-undefined value.
 */
export function mergeImpacts(...impacts: (StateImpact | undefined)[]): StateImpact {
    const result: StateImpact = {};

    for (const impact of impacts) {
        if (!impact) continue;

        // Cash & Prestige
        if (impact.cashChange !== undefined) result.cashChange = (result.cashChange || 0) + impact.cashChange;
        if (impact.prestigeChange !== undefined) result.prestigeChange = (result.prestigeChange || 0) + impact.prestigeChange;

        // Concatenate arrays
        if (impact.projectUpdates) result.projectUpdates = [...(result.projectUpdates || []), ...impact.projectUpdates];
        if (impact.talentUpdates) result.talentUpdates = [...(result.talentUpdates || []), ...impact.talentUpdates];
        if (impact.rivalUpdates) result.rivalUpdates = [...(result.rivalUpdates || []), ...impact.rivalUpdates];
        if (impact.buyerUpdates) result.buyerUpdates = [...(result.buyerUpdates || []), ...impact.buyerUpdates];
        if (impact.removeContracts) result.removeContracts = [...(result.removeContracts || []), ...impact.removeContracts];
        if (impact.newHeadlines) result.newHeadlines = [...(result.newHeadlines || []), ...impact.newHeadlines];
        if (impact.newsEvents) result.newsEvents = [...(result.newsEvents || []), ...impact.newsEvents];
        if (impact.newAwards) result.newAwards = [...(result.newAwards || []), ...impact.newAwards];
        if (impact.newScandals) result.newScandals = [...(result.newScandals || []), ...impact.newScandals];
        if (impact.scandalUpdates) result.scandalUpdates = [...(result.scandalUpdates || []), ...impact.scandalUpdates];
        if (impact.cultClassicProjectIds) result.cultClassicProjectIds = [...(result.cultClassicProjectIds || []), ...impact.cultClassicProjectIds];
        if (impact.razzieWinnerTalents) result.razzieWinnerTalents = [...(result.razzieWinnerTalents || []), ...impact.razzieWinnerTalents];
        if (impact.uiNotifications) result.uiNotifications = [...(result.uiNotifications || []), ...impact.uiNotifications];

        // Replaceable arrays (Latest one wins if we have multiple, but usually we only have one system managing these)
        if (impact.newOpportunities) result.newOpportunities = impact.newOpportunities;
        if (impact.newTrends) result.newTrends = impact.newTrends;
        if (impact.newMarketEvents) result.newMarketEvents = impact.newMarketEvents;
        if (impact.newRumors) result.newRumors = impact.newRumors;
        if (impact.newFestivalSubmissions) result.newFestivalSubmissions = impact.newFestivalSubmissions;
        if (impact.newFinanceHistory) result.newFinanceHistory = impact.newFinanceHistory;

        // Legacy / Singular fields
        if (impact.removeContract) result.removeContract = impact.removeContract;
    }

    return result;
}

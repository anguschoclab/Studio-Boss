import { GameState, IPAsset, Franchise } from '../../types';
import { calculateWeeklyIPRevenue } from '../ip/merchandisingEngine';
import { applyIPDecay } from '../ip/ipValuation';
import { calculateFranchiseEquity } from '../ip/franchiseCoordinator';

/**
 * IP Coordinator.
 * Handles the persistent merchandising revenue, cultural decay, and Shared Universe management.
 */
export function processIPVault(state: GameState): GameState {
  let totalPassiveRevenue = 0;
  
  // 1. Process Individual Assets (Decay & Revenue)
  const updatedVault = state.ip.vault.map((asset: IPAsset) => {
    // Collect Passive Revenue (Merch & Syndication)
    const revenue = calculateWeeklyIPRevenue(asset);
    totalPassiveRevenue += revenue;
    
    // Cultural Relevance Decay
    let updatedAsset = applyIPDecay(asset);
    
    // Evaluate Rights Expiration
    if (state.game.currentWeek >= updatedAsset.rightsExpirationWeek && updatedAsset.rightsOwner === 'STUDIO') {
        updatedAsset = { 
            ...updatedAsset, 
            rightsOwner: 'MARKET',
            decayRate: Math.max(0.1, updatedAsset.decayRate - 0.2) // Loss of active marketing
        };
    }
    
    return updatedAsset;
  });

  // 2. Process Franchise Hubs (Equity & Synergy)
  const updatedFranchises: Record<string, Franchise> = {};
  Object.values(state.ip.franchises).forEach((franchise: Franchise) => {
    const relatedAssets = updatedVault.filter(a => a.franchiseId === franchise.id);
    
    // Refresh the "Enterprise Value" of the brand
    const totalEquity = calculateFranchiseEquity(franchise, relatedAssets);
    
    // Decay Brand Fatigue over time if no projects are active
    const fatigueDecay = franchise.activeProjectIds.length === 0 ? 0.05 : 0;
    const newFatigue = Math.max(0, franchise.fatigueLevel - fatigueDecay);

    updatedFranchises[franchise.id] = {
      ...franchise,
      totalEquity,
      fatigueLevel: newFatigue,
      relevanceScore: Math.floor(relatedAssets.reduce((sum, a) => sum + (a.decayRate * 100), 0) / (relatedAssets.length || 1))
    };
  });

  return { 
    ...state, 
    ip: { 
      vault: updatedVault,
      franchises: updatedFranchises
    },
    finance: { 
      ...state.finance, 
      cash: state.finance.cash + totalPassiveRevenue 
    } 
  };
}

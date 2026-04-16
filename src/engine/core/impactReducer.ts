import { GameState, StateImpact } from '@/engine/types';
import { applySingleImpact as applySingleImpactHandler } from './impactHandlers';

/**
 * Pure function to apply a single StateImpact to the GameState.
 * Delegates to the handler registry in impactHandlers/index.ts
 */
function applySingleImpact(state: GameState, impact: StateImpact): GameState {
  let newState = applySingleImpactHandler(state, impact);
  newState = processRootLevelFields(newState, impact);
  return newState;
}

/**
 * Internal helper to process root-level field impacts
 * These are convenience fields that map to typed impacts
 */
function processRootLevelFields(state: GameState, impact: StateImpact): GameState {
  let newState = state;
  
  if (impact.cashChange !== undefined) {
    newState = applySingleImpact(newState, { type: 'FUNDS_CHANGED', payload: { amount: impact.cashChange } });
  }
  if (impact.prestigeChange !== undefined) {
    newState = applySingleImpact(newState, { type: 'PRESTIGE_CHANGED', payload: { amount: impact.prestigeChange } });
  }
  if (impact.projectUpdates) {
    impact.projectUpdates.forEach(u => {
      newState = applySingleImpact(newState, { type: 'PROJECT_UPDATED', payload: u });
    });
  }
  if (impact.rivalUpdates) {
    impact.rivalUpdates.forEach(u => {
      newState = applySingleImpact(newState, { type: 'RIVAL_UPDATED', payload: u });
    });
  }
  if (impact.newHeadlines) {
    impact.newHeadlines.forEach(h => {
      newState = applySingleImpact(newState, { 
        type: 'NEWS_ADDED', 
        payload: { id: h.id, headline: h.text, description: '', category: h.category, publication: h.publication } 
      });
    });
  }
  if (impact.newsEvents) {
    impact.newsEvents.forEach(e => {
      newState = applySingleImpact(newState, { 
        type: 'NEWS_ADDED', 
        payload: { id: e.id, headline: e.headline, description: e.description, publication: e.publication } 
      });
    });
  }
  if (impact.newAwards) {
    impact.newAwards.forEach(award => {
      newState = applySingleImpact(newState, { type: 'AWARD_WON', payload: { projectId: award.projectId, award } });
    });
  }
  if (impact.cultClassicProjectIds) {
    impact.cultClassicProjectIds.forEach(id => {
      const projects = { ...newState.entities.projects };
      const project = projects[id];
      if (project) {
        projects[id] = { ...project, isCultClassic: true };
      }
      newState = { ...newState, entities: { ...newState.entities, projects } };
    });
  }
  if (impact.razzieWinnerTalents) {
    impact.razzieWinnerTalents.forEach(id => {
      const talents = { ...newState.entities.talents };
      const talent = talents[id];
      if (talent) {
        talents[id] = { ...talent, razzieWinner: true };
      }
      newState = { ...newState, entities: { ...newState.entities, talents } };
    });
  }
  if (impact.newProjects) {
    newState = {
      ...newState,
      entities: {
        ...newState.entities,
        projects: { ...newState.entities.projects, ...Object.fromEntries(impact.newProjects.map(p => [p.id, p])) }
      }
    };
  }
  if (impact.newContracts) {
    newState = {
      ...newState,
      entities: {
        ...newState.entities,
        contracts: { ...newState.entities.contracts, ...Object.fromEntries(impact.newContracts.map(c => [c.id, c])) }
      }
    };
  }
  if (impact.newScandals) {
    impact.newScandals.forEach(scandal => {
      newState = applySingleImpact(newState, { type: 'SCANDAL_ADDED', payload: { scandal } });
    });
  }
  if (impact.newTalents) {
    const talents = { ...newState.entities.talents };
    impact.newTalents.forEach(t => {
      talents[t.id] = t;
    });
    newState = { ...newState, entities: { ...newState.entities, talents } };
  }

  return newState;
}

/**
 * Pure reducer that processes an array of impacts without mutating original state.
 */
export function applyImpacts(state: GameState, impacts: StateImpact[]): GameState {
  let newState = impacts.reduce((currentState, impact) => applySingleImpact(currentState, impact), state);

  // Process all new IP assets efficiently in one pass
  const allNewIPs = impacts.flatMap(i => i.newIPAssets || []);
  if (allNewIPs.length > 0) {
    // Keep only the latest version of each IP asset
    const latestNewIPsMap = new Map();
    for (const asset of allNewIPs) {
      latestNewIPsMap.set(asset.id, asset);
    }

    const newAssetIds = new Set(latestNewIPsMap.keys());
    const latestNewIPs = Array.from(latestNewIPsMap.values());

    // O(N) single-pass filter instead of using the spread operator
    const vault = [];
    const currentVault = newState.ip.vault || [];
    for (let i = 0; i < currentVault.length; i++) {
      if (!newAssetIds.has(currentVault[i].id)) {
        vault.push(currentVault[i]);
      }
    }
    for (let i = 0; i < latestNewIPs.length; i++) {
      vault.push(latestNewIPs[i]);
    }

    newState = { ...newState, ip: { ...newState.ip, vault } };
  }

  return newState;
}

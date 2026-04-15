import { GameState } from '../../types';
import { TickContext } from './types';

// System Imports
import { detectCultClassic } from '../../systems/ip/ipValuation';
import { shouldAttemptHostileTakeover } from '../../systems/ai/AgentBrain';

/**
 * Annual Scans
 * Handles annual events like IP scans and M&A activity
 */
export class AnnualScans {
  static execute(state: GameState, context: TickContext): void {
    const weekOfYear = context.week % 52 || 52;

    // Annual IP Scan — Week 1
    if (weekOfYear === 1) {
      this.runAnnualIPScan(state, context);
    }

    // Annual M&A hostile takeover scan
    if (weekOfYear === 52) {
      this.runAnnualMAScan(state, context);
    }
  }

  /**
   * Annual scan for hostile takeover attempts between rivals.
   * Fires once per year (week % 52 === 0).
   */
  private static runAnnualMAScan(state: GameState, context: TickContext) {
    const rivalsObj = state.entities.rivals || {};
    const rivalKeys = Object.keys(rivalsObj);
    for (let i = 0; i < rivalKeys.length; i++) {
      for (let j = 0; j < rivalKeys.length; j++) {
        if (i === j) continue;
        const attacker = rivalsObj[rivalKeys[i]];
        const target = rivalsObj[rivalKeys[j]];
        if (!target.isAcquirable) continue;
        if (shouldAttemptHostileTakeover(attacker, target, state)) {
          context.impacts.push({
            type: 'MODAL_TRIGGERED',
            payload: {
              modalType: 'BIDDING_WAR',
              priority: 60,
              payload: {
                attackerId: attacker.id,
                attackerName: attacker.name,
                targetId: target.id,
                targetName: target.name,
                offerAmount: Math.round(target.cash * 2 + target.strength * 1_000_000),
                week: context.week
              }
            }
          });
          context.impacts.push({
            type: 'NEWS_ADDED',
            payload: {
              id: `ma-${attacker.id}-${target.id}-${context.week}`,
              headline: `${attacker.name} makes hostile bid for ${target.name}`,
              description: `Industry insiders confirm an unsolicited acquisition offer has been made.`,
              category: 'acquisition',
              publication: 'The Hollywood Reporter'
            }
          });
          break; // one hostile move per attacker per year
        }
      }
    }
  }

  /**
   * Annual scan for Cult Classics and Reboot opportunities.
   */
  private static runAnnualIPScan(state: GameState, context: TickContext) {
    // 1. Cult Classic Scan
    const vault = state.ip.vault || [];

    // ⚡ The Framerate Fanatic: Refactored array .find() inside map to a Map lookup, improving performance from O(n^2) to O(n).
    const projectHistoryMap = new Map();
    const history = state.studio.internal.projectHistory || [];
    for (let i = 0; i < history.length; i++) {
       projectHistoryMap.set(history[i].id, history[i]);
    }

    vault.forEach(asset => {
       const project = projectHistoryMap.get(asset.originalProjectId);
       if (project && !project.isCultClassic && detectCultClassic(project, context.week)) {
          context.impacts.push({
             type: 'VAULT_ASSET_UPDATED',
             payload: { assetId: asset.id, update: { tier: 'CULT_CLASSIC' } }
          });
          context.impacts.push({
             type: 'NEWS_ADDED',
             payload: {
                id: context.rng.uuid('NWS'),
                headline: `"${project.title}" achieves cult status!`,
                description: `Years later, fans have rediscovered this hidden gem. Catalog value is surging.`,
                category: 'general'
             }
          });
       }
    });

    // 2. Reboot Proposal
    const internalIP = vault.filter(v => v.rightsOwner === 'STUDIO');
    if (internalIP.length > 0 && context.rng.next() < 0.2) {
       const proposal = null; // generateRebootProposal(context.rng);
       if (proposal) {
          context.impacts.push({
             type: 'MODAL_TRIGGERED',
             payload: {
                modalType: 'REBOOT_OPPORTUNITY',
                priority: 30,
                payload: proposal
             }
          });
       }
    }
  }
}

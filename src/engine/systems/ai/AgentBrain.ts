import { Agency, Agent, TalentProfile, Project, GameState } from '@/engine/types';
import { StateImpact } from '../../types/state.types';
import { pick, secureRandom } from '../../utils';

export class AgentBrain {
  /**
   * Evaluates if an agency should offer a "Package Deal" when a studio is interested in a lead client.
   * A package deal usually bundles a director or writer with the lead actor.
   */
  static getPackageOffer(agent: Agent, agency: Agency, leadTalent: TalentProfile, talentPool: TalentProfile[]): { 
     requiredTalentId?: string; 
     packageDiscount?: number; 
     reason: string 
  } {
    const motivation = agency.currentMotivation || 'VOLUME_RETAIL';
    
    if (motivation === 'THE_PACKAGER' || secureRandom() < 0.15) {
      // Find another client from the same agency to package
      const otherClients = talentPool.filter(t => t.agencyId === agency.id && t.id !== leadTalent.id);
      
      if (otherClients.length > 0) {
        const bundled = pick(otherClients);
        const roles = bundled.roles.join('/');
        return {
          requiredTalentId: bundled.id,
          packageDiscount: 0.1, // 10% off total fees if you take both
          reason: `Agency policy: To secure ${leadTalent.name}, we require you to also consider ${bundled.name} for a ${roles} role on this project.`
        };
      }
    }

    return { reason: 'No package deal offered.' };
  }

  /**
   * Processes weekly agent/agency actions: sabotage, poaching, and rumor leaks.
   */
  static processAgencyWeekly(state: GameState): StateImpact {
    const impact: StateImpact = {
      newHeadlines: [],
      newRumors: []
    };

    for (const agency of state.industry.agencies) {
       // Aggressive agencies (Sharks) leak rumors or sabotage rivals
       if (agency.culture === 'shark' || agency.currentMotivation === 'THE_SHARK') {
          if (secureRandom() < 0.1) {
             const rivals = state.industry.rivals;
             if (rivals.length > 0) {
                const target = pick(rivals);
                impact.newHeadlines!.push({
                   week: state.week,
                   category: 'rival' as const,
                   text: `RUMOR: ${agency.name} is looking to hostilely poach the top talent roster from ${target.name}.`
                });
                impact.newRumors!.push({
                  id: `rumor-${crypto.randomUUID()}`,
                  week: state.week,
                  category: 'rival' as const,
                  text: `Financial reports suggest ${target.name} is losing its grip on key talent contracts.`,
                  truthful: secureRandom() < 0.5,
                  resolved: false
                });
             }
          }
       }
    }

    return impact;
  }
}

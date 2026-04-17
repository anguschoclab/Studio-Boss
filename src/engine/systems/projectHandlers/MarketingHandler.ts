import { Project, Contract, Talent, StateImpact, MarketingCampaign } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';

export function handleMarketingPhase(p: Project, talentPool: Record<string, Talent>, projectContracts: Contract[], rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  let newBuzz = p.buzz;
  
  // Auteur Friction Logic
  if (p.activeCut === 'sanitized') {
    const directorContract = projectContracts.find(c => c.role === 'director');
    if (directorContract) {
      const director = talentPool[directorContract.talentId];
      if (director && director.directorArchetype === 'auteur') {
        // 80% chance of a scandal if an auteur is sanitized
        if (rng.next() < 0.8) {
          impacts.push({
            type: 'SCANDAL_ADDED',
            payload: {
              scandal: {
                id: rng.uuid('SND'),
                type: 'director_speaks_out' as any,
                talentId: director.id,
                severity: 70,
                description: `Renowned director ${director.name} has publically disowned the studio's "sanitized" cut of "${p.title}", claiming their creative vision was compromised for commercial gain.`,
                isPublic: true,
                weekDiscovered: 0
              }
            }
          });
          newBuzz = Math.max(0, p.buzz - 15);
        }
      }
    }
  }

  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: p.id,
      update: {
        state: 'marketing',
        weeksInPhase: 0,
        buzz: newBuzz
      }
    }
  });

  return impacts;
}

export function executeMarketing(
  project: Project,
  campaign: MarketingCampaign
): { project: Project } {
  const p = { 
    ...project, 
    marketingCampaign: {
      ...campaign,
      weeksInMarketing: 1
    } 
  };
  return { project: p };
}

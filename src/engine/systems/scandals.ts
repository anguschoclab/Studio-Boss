import { pick } from '../utils';
import { GameState, Scandal, ScandalType } from '@/engine/types';
import { StateImpact } from '../types/state.types';
import { RandomGenerator } from '../utils/rng';
import { RatingMarket } from '../types/project.types';
import { MARKET_CONFIGS } from '../data/ratingMarkets';
import { Project } from '../types/project.types';
import { BardResolver } from './bardResolver';

/**
 * Randomly spawns a scandal for a talent in the pool based on their controversy risk.
 * If the talent is attached to an active studio project, it triggers a Project Crisis.
 */
export function generateScandals(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impactsToReturn: StateImpact[] = [];
  const impact: StateImpact = {
    newScandals: [],
    newHeadlines: [],
    newsEvents: [],
    projectUpdates: [],
    uiNotifications: []
  };
  
  const contractsList = Object.values(state.entities.contracts || {});
  const talentToProjectMap = new Map<string, string>();
  for (const c of contractsList) {
    talentToProjectMap.set(c.talentId, c.projectId);
  }
  
  const studioProjects = state.entities.projects || {};

  const numContracts = contractsList.length;
  const studioProjectsCount = Object.keys(studioProjects).length;
  // A mega-studio has more leaks than an indie darling. Increased scaling impact.
  // The PR Spin Doctor: Heavily scale scandals with studio size (more contracts/projects = much higher risk)
  // Adjusted: significantly higher multiplier for mega-studios
  const sizeModifier = 1.0 + (numContracts * 0.25) + (studioProjectsCount * 0.40);

  const talentPool = state.entities.talents || {};
  for (const talentId in talentPool) {
    const talent = talentPool[talentId];
    const risk = talent.psychology?.scandalRisk || 5; 
    if (rng.next() * 1000 < (risk * sizeModifier)) {
       const types: ScandalType[] = ['financial', 'personal', 'onset_behavior', 'legal', 'feud'];
       const type = pick(types, rng);
       
       const s: Scandal = {
         id: rng.uuid('SND'),
         talentId: talent.id,
         severity: 20 + Math.floor(rng.next() * 80), // 20-100
         type,
         weeksRemaining: 4 + Math.floor(rng.next() * 8)
       };

       impact.newScandals!.push(s);

       impact.newsEvents!.push({
         id: rng.uuid('NWS'),
         week: state.week,
         type: 'CRISIS',
         headline: BardResolver.resolve({
            domain: 'Industry',
            subDomain: 'Scandal',
            intensity: s.severity,
            tone: 'Trade',
            context: { actor: talent.name, type }
         }),
         description: BardResolver.resolve({
            domain: 'Industry',
            subDomain: 'Scandal',
            intensity: s.severity,
            tone: 'Tabloid',
            context: { actor: talent.name, type }
         }),
       });

       const projectId = talentToProjectMap.get(talent.id);
       if (projectId && studioProjects[projectId]) {
         const project = studioProjects[projectId];
         const crisisId = rng.uuid('CRS');
         
         const crisisPayload = {
            id: crisisId,
            crisisId,
            triggeredWeek: state.week,
            haltedProduction: false,
            description: BardResolver.resolve({
               domain: 'Crisis',
               subDomain: 'PR',
               intensity: s.severity,
               context: { actor: talent.name, project: project.title, type }
            }),
            resolved: false,
            severity: s.severity > 75 ? 'high' as const : 'medium' as const,
            options: [
              {
                text: "Fire Them",
                effectDescription: "Remove talent from project, +2 week delay, preserve reputation.",
                weeksDelay: 2,
                removeTalentId: talent.id,
              },
              {
                text: "Pay off the Press",
                effectDescription: `Deduct $${(s.severity * 10000).toLocaleString()} to bury the story. Keep talent.`,
                cashPenalty: s.severity * 10000,
                reputationPenalty: 2
              },
              {
                text: "Double Down",
                effectDescription: "Cost nothing, but lose 10% reputation and tank project buzz.",
                reputationPenalty: 10,
                buzzPenalty: 30
              }
            ]
         };

         impact.projectUpdates!.push({
            projectId,
            update: {
               activeCrisis: crisisPayload
            }
         });

         impact.uiNotifications!.push(`A crisis has hit "${project.title}"!`);

         impactsToReturn.push({
           type: 'MODAL_TRIGGERED',
           payload: {
             modalType: 'CRISIS',
             priority: 100,
             payload: {
               projectId,
               crisis: crisisPayload
             }
           }
         });
       }
    }
  }
  
  impactsToReturn.push(impact);
  return impactsToReturn;
}



/**
 * Processes weekly decay of scandals and applies their penalties to projects.
 */
export function advanceScandals(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  const currentScandals = state.industry.scandals || [];
  const activeScandalTalent = new Set<string>();

  for (const s of currentScandals) {
    if (s.weeksRemaining > 1) {
      activeScandalTalent.add(s.talentId);
    } else {
      impacts.push({
        type: 'SCANDAL_REMOVED',
        payload: { scandalId: s.id }
      });
    }
  }
  
  const contractsList = Object.values(state.entities.contracts || {});
  const penalizedProjectIds = new Set<string>();
  for (const c of contractsList) {
    if (activeScandalTalent.has(c.talentId)) {
      penalizedProjectIds.add(c.projectId);
    }
  }
  
  for (const projectId of penalizedProjectIds) {
      const p = state.entities.projects[projectId];
      if (p) {
          impacts.push({
              type: 'PROJECT_UPDATED',
              payload: {
                  projectId,
                  update: { buzz: Math.max(0, p.buzz - 2) }
              }
          });
      }
  }
  
  return impacts;
}

/**
 * Generates a studio-level rating event as news + prestige change.
 */
export function generateStudioRatingEvent(
  type: RatingEventType,
  context: { projectTitle: string; marketName?: string; week: number },
  rng: RandomGenerator
): StateImpact {
  const prestigeLoss = type === 'banned_in_market' ? -10
    : type === 'rating_controversy' ? -5
    : -3;

  const headline = type === 'banned_in_market'
    ? `"${context.projectTitle}" BANNED in ${context.marketName ?? 'foreign market'}`
    : type === 'rating_controversy'
    ? `Rating controversy surrounds "${context.projectTitle}"`
    : `Content cut for foreign release of "${context.projectTitle}"`;

  const description = BardResolver.resolve({
    domain: 'Industry',
    subDomain: 'Scandal',
    intensity: prestigeLoss < -5 ? 20 : 50,
    tone: 'Trade',
    context: { project: context.projectTitle, market: context.marketName }
  });

  const publication = type === 'banned_in_market' ? 'The Hollywood Reporter' as const
    : 'Variety' as const;

  return {
    prestigeChange: prestigeLoss,
    newsEvents: [{
      id: rng.uuid('NWS'),
      week: context.week,
      type: 'SCANDAL',
      headline,
      description,
      publication
    }],
    newHeadlines: [{
      id: rng.uuid('NWS'),
      text: headline,
      week: context.week,
      category: 'scandal',
      publication
    }]
  };
}

export type RatingEventType = 'rating_controversy' | 'foreign_market_cut' | 'banned_in_market';

/**
 * Checks if a project has banned markets and generates a one-time headline event.
 */
export function generateMarketBanScandal(
  project: Project,
  bannedMarkets: RatingMarket[],
  week: number,
  state: GameState,
  rng: RandomGenerator
): StateImpact | null {
  if (bannedMarkets.length === 0) return null;

  // Deduplication: check if we already generated a ban headline for this project
  const alreadyReported = state.industry.newsHistory.some(e =>
    e.headline.includes(project.title) && e.headline.includes('BANNED')
  );
  if (alreadyReported) return null;

  const primaryBan = bannedMarkets[0];
  const marketName = MARKET_CONFIGS[primaryBan]?.displayName ?? primaryBan;
  const extraCount = bannedMarkets.length - 1;

  const suffix = extraCount > 0 ? ` (and ${extraCount} other market${extraCount > 1 ? 's' : ''})` : '';
  const headline = `"${project.title}" BANNED in ${marketName}${suffix}`;

  const prestigeLoss = Math.min(15, bannedMarkets.length * 3);

  return {
    prestigeChange: -prestigeLoss,
    newsEvents: [{
      id: rng.uuid('NWS'),
      week,
      type: 'SCANDAL',
      headline,
      description: BardResolver.resolve({
        domain: 'Industry',
        subDomain: 'Scandal',
        intensity: 20,
        tone: 'Trade',
        context: { project: project.title, market: marketName }
      }),
      publication: 'The Hollywood Reporter'
    }],
    newHeadlines: [{
      id: rng.uuid('NWS'),
      text: headline,
      week,
      category: 'scandal',
      publication: 'The Hollywood Reporter'
    }]
  };
}

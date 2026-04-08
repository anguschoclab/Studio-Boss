import { AwardBody, AwardCategory, GameState, Project, RivalStudio, StateImpact, Talent, Contract } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';
import { BardResolver } from './bardResolver';
import { 
  AWARDS_CALENDAR, 
  AWARD_CONFIGS, 
  CANNES_EQUIVALENTS, 
  SUNDANCE_EQUIVALENTS 
} from '../data/awards.data';

export function isCannesEquivalentFestival(body: AwardBody | string): boolean {
  return CANNES_EQUIVALENTS.includes(body as AwardBody);
}

export function isSundanceEquivalentFestival(body: AwardBody | string): boolean {
  return SUNDANCE_EQUIVALENTS.includes(body as AwardBody);
}

export function isMajorCategoryNomination(category: AwardCategory | string): boolean {
  const majorCategories = [
    'Best Picture', 'Best Series', 'Best Drama Series', 'Best Comedy Series', 'Best Limited Series',
    'Best Director', 'Best Actor', 'Best Actress', 'Best Actor (Drama)', 'Best Actress (Drama)', 
    'Best Actor (Comedy)', 'Best Actress (Comedy)',
    'Palme d\'Or', 'Golden Lion', 'Golden Bear', 'Grand Jury Prize'
  ];
  return majorCategories.includes(category as string);
}

export function isSupportingCategoryNomination(category: AwardCategory | string): boolean {
  return (['Best Supporting Actor', 'Best Supporting Actress', 'Best Supporting Actor (TV)', 'Best Supporting Actress (TV)'] as string[]).includes(category as string);
}

/**
 * The Probability Engine: Calculates the absolute weight of a project for award consideration.
 */
export function calculateNominationWeight(
  project: Project, 
  talent: Talent[], 
  campaignBuzz: number = 0
): number {
  const metaScore = project.reception?.metaScore || project.reviewScore || 0;

  // Gatekeeper: If metaScore < 65, return 0 (Disqualified).
  if (metaScore < 65) return 0;

  // Base Weight: (metaScore - 60) * 1.5.
  let weight = (metaScore - 60) * 1.5;

  // The "Veteran" Bias: Find max prestige among lead actors and director.
  const maxPrestige = talent.length > 0 
    ? Math.max(...talent.map(t => t.prestige)) 
    : 0;
  
  // If maxPrestige > 80, add (maxPrestige - 80) * 2.
  if (maxPrestige > 80) {
    weight += (maxPrestige - 80) * 2;
  }

  // Campaign Influence: Add campaignBuzz (derived from active state).
  weight += campaignBuzz;

  // Genre Adjustments: +10 if 'Drama', -15 if 'Horror'.
  const genre = (project.genre || '').toLowerCase();
  if (genre.includes('drama')) {
    weight += 10;
  } else if (genre.includes('horror')) {
    weight -= 15;
  }

  return Math.max(0, Math.round(weight));
}

/**
 * Checks for PR disasters caused by aggressive campaigning.
 */
export function checkCampaignBacklash(
  metaScore: number, 
  campaignTier: 'Grassroots' | 'Trade' | 'Blitz',
  rng: RandomGenerator
): boolean {
  // If campaignTier === 'Blitz' AND metaScore < 70: Trigger a 20% RNG check.
  if (campaignTier === 'Blitz' && metaScore < 70) {
    return rng.next() < 0.20;
  }
  return false;
}

/**
 * Universal Awards Ceremony Resolver
 */
export function runAwardsCeremony(state: GameState, currentWeek: number, year: number, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  const weekOfYear = currentWeek % 52 === 0 ? 52 : currentWeek % 52;
  const bodiesThisWeek = AWARDS_CALENDAR[weekOfYear] || [];
  if (bodiesThisWeek.length === 0) return [];

  const configsThisWeek = AWARD_CONFIGS.filter(config => bodiesThisWeek.includes(config.body));
  if (configsThisWeek.length === 0) return [];

  const eligibleFilm: Project[] = [];
  const eligibleTv: Project[] = [];
  const projectToRivalMap = new Map<string, RivalStudio>();
  const projectToContractsMap = new Map<string, Contract[]>();

  const contractsList = Object.values(state.entities.contracts || {});
  for (const c of contractsList) {
    const list = projectToContractsMap.get(c.projectId) || [];
    list.push(c);
    projectToContractsMap.set(c.projectId, list);
  }

  // Add player projects
  const playerProjects = Object.values(state.entities.projects || {});
  for (const p of playerProjects) {
    if ((p.state === 'released' || p.state === 'post_release' || p.state === 'archived') &&
        p.releaseWeek !== null &&
        p.releaseWeek > currentWeek - 52) {
      
      const formatMatch = (p.format || '').toLowerCase();
      if (formatMatch === 'film') eligibleFilm.push(p);
      else if (formatMatch === 'tv' || formatMatch === 'series') eligibleTv.push(p);
    }
  }

  // Add rival projects
  const rivalsList = Object.values(state.entities.rivals || {});
  for (const rival of rivalsList) {
    const rivalProjects = Object.values(rival.projects || {});
    for (const p of rivalProjects) {
      if ((p.state === 'released' || p.state === 'post_release' || p.state === 'archived') &&
          p.releaseWeek !== null &&
          p.releaseWeek > currentWeek - 52) {
        
        projectToRivalMap.set(p.id, rival);
        
        const formatMatch = (p.format || '').toLowerCase();
        if (formatMatch === 'film') eligibleFilm.push(p);
        else if (formatMatch === 'tv' || formatMatch === 'series') eligibleTv.push(p);

        // Rivals occasionally have internal contracts not in the global record
        if (rival.contracts && rival.contracts.length > 0) {
            const list = projectToContractsMap.get(p.id) || [];
            rival.contracts.forEach(rc => {
                if (rc.projectId === p.id) list.push(rc);
            });
            projectToContractsMap.set(p.id, list);
        }
      }
    }
  }

  if (eligibleFilm.length === 0 && eligibleTv.length === 0) return [];

  for (const config of configsThisWeek) {
    let candidates: Project[];
    const isTvCategory = (config.category.toLowerCase().includes('tv') || config.category.toLowerCase().includes('series'));
    
    if (isTvCategory) candidates = eligibleTv;
    else candidates = eligibleFilm;

    if (candidates.length === 0) continue;

    let bestProject = candidates[0];
    let bestScore = -1;

    for (let i = 0; i < candidates.length; i++) {
      const p = candidates[i];
      
      // Weighting system
      // Campaign data might be in different places depending on implementation, 
      // but let's assume it's moved to the projects themselves or a specific registry.
      // For now, checks buzz directly if active state campaign is missing.
      const weight = calculateNominationWeight(p, [], p.buzz * 0.1); 
      
      // Add talent data if available
      const projectContracts = projectToContractsMap.get(p.id) || [];
      const attachedTalent = projectContracts
        .map(c => state.entities.talents[c.talentId])
        .filter(Boolean);
      
      const refinedWeight = calculateNominationWeight(p, attachedTalent, p.buzz * 0.1);

      const randomFactor = rng.range(0.8, 1.2);
      const score = refinedWeight * randomFactor;

      if (score > bestScore) {
        bestScore = score;
        bestProject = p;
      }
    }

    if (bestScore > 0) {
      // Threshold for a win vs nomination
      const isWin = bestScore > 50; 
      const prestigeGain = isWin ? 15 : 3;
      
      const isPlayer = !!state.entities.projects[bestProject.id];
      const rival = isPlayer ? null : projectToRivalMap.get(bestProject.id);

      impacts.push({
        type: 'INDUSTRY_UPDATE',
        payload: {
          [`industry.awards.${rng.uuid('AWD')}`]: {
            id: rng.uuid('AWD'),
            projectId: bestProject.id,
            name: config.category,
            category: config.category,
            body: config.body,
            status: isWin ? 'won' : 'nominated',
            year
          }
        }
      });

      if (isPlayer) {
        impacts.push({ type: 'PRESTIGE_CHANGED', payload: prestigeGain });
      } else if (rival) {
        impacts.push({ 
          type: 'RIVAL_UPDATED', 
          payload: { 
            rivalId: rival.id, 
            update: { prestige: Math.min(100, rival.prestige + prestigeGain) } 
          } 
        });
      }

      if (isWin) {
        impacts.push({
            type: 'NEWS_ADDED',
            payload: {
                id: rng.uuid('NWS'),
                week: currentWeek,
            headline: `AWARDS: ${bestProject.title}`,
            description: BardResolver.resolve({
                domain: 'Industry',
                subDomain: 'Award',
                intensity: isWin ? 90 : 30,
                context: { project: bestProject.title, body: config.body, category: config.category },
                rng
            }),
            category: 'awards'
            }
        });
      }
    }
  }

  return impacts;
}

export function processRazzies(state: GameState, week: number, rng: RandomGenerator): StateImpact[] {
  return [];
}

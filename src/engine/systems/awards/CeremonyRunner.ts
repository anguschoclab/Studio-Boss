import { GameState, Project, RivalStudio, StateImpact, Contract } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { BardResolver } from '../bardResolver';
import { 
  AWARDS_CALENDAR, 
  AWARD_CONFIGS
} from '../../data/awards.data';
import { calculateNominationWeight } from './NominationCalculator';

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

  const rivalsMap = state.entities.rivals || {};
  const allProjects = Object.values(state.entities.projects || {});

  const rivalProjects: Project[] = [];
  for (const p of allProjects) {
    if (p.ownerId && rivalsMap[p.ownerId]) {
      rivalProjects.push(p);
    }
  }

  for (const project of rivalProjects) {
    if ((project.state === 'released' || project.state === 'post_release' || project.state === 'archived') &&
        project.releaseWeek !== null &&
        project.releaseWeek > currentWeek - 52) {

      const rival = rivalsMap[project.ownerId];
      if (rival) {
        projectToRivalMap.set(project.id, rival);

        const formatMatch = (project.format || '').toLowerCase();
        if (formatMatch === 'film') eligibleFilm.push(project);
        else if (formatMatch === 'tv' || formatMatch === 'series') eligibleTv.push(project);
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
      
      if (config.evaluator && !config.evaluator(p)) continue;
      
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

import { AwardBody, AwardCategory, AwardsProfile, GameState, Project, SeriesProject, StateImpact } from '@/engine/types';
import { RandomGenerator } from '../utils/rng';
import { 
  AWARDS_CALENDAR, 
  AWARD_CONFIGS, 
  CANNES_EQUIVALENTS, 
  SUNDANCE_EQUIVALENTS 
} from '../data/awards.data';
import { TV_FORMAT_TAXONOMY } from '../data/tvFormats';

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

export function generateAwardsProfile(project: Project, rng: RandomGenerator): AwardsProfile {
  const basePrestige = (rng.next() * 50) + (project.budget / 1000000) * 0.5;
  const baseCritic = rng.next() * 100;

  return {
    criticScore: Math.min(100, Math.max(0, baseCritic)),
    audienceScore: Math.min(100, Math.max(0, rng.next() * 100)),
    prestigeScore: Math.min(100, Math.max(0, basePrestige)),
    craftScore: Math.min(100, Math.max(0, rng.next() * 100)),
    culturalHeat: Math.min(100, Math.max(0, rng.next() * 100)),
    campaignStrength: 10,
    controversyRisk: Math.min(100, Math.max(0, rng.next() * 30)),
    festivalBuzz: Math.min(100, Math.max(0, rng.next() * 100)),
    academyAppeal: Math.min(100, Math.max(0, basePrestige * 0.8 + rng.next() * 40)),
    guildAppeal: Math.min(100, Math.max(0, baseCritic * 0.7 + rng.next() * 40)),
    populistAppeal: Math.min(100, Math.max(0, rng.next() * 100)),
    indieCredibility: Math.min(100, Math.max(0, project.budgetTier === 'low' ? rng.next() * 80 + 20 : rng.next() * 30)),
    industryNarrativeScore: Math.min(100, Math.max(0, rng.next() * 100))
  };
}

/**
 * Universal Awards Ceremony Resolver
 * Handles winners from all studios (Player & Rivals).
 */
export function runAwardsCeremony(state: GameState, currentWeek: number, year: number, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  const weekOfYear = currentWeek % 52 === 0 ? 52 : currentWeek % 52;
  const bodiesThisWeek = AWARDS_CALENDAR[weekOfYear] || [];
  if (bodiesThisWeek.length === 0) return [];

  const configsThisWeek = AWARD_CONFIGS.filter(config => bodiesThisWeek.includes(config.body));
  if (configsThisWeek.length === 0) return [];

  // 1. Collect ALL projects from ALL studios
  // ⚡ Bolt: Replaced high-allocation .map() / .forEach() and Object.values with direct for...in loops.
  const eligibleFilm: Project[] = [];
  const eligibleTv: Project[] = [];

  // ⚡ Bolt: Pre-compute project ownership map to eliminate O(N) array scans during award checks
  const projectToRivalMap: Record<string, import('@/engine/types').RivalStudio> = {};

  const processProject = (p: Project, rival?: import('@/engine/types').RivalStudio) => {
    if ((p.state === 'released' || p.state === 'post_release' || p.state === 'archived') &&
        p.releaseWeek !== null &&
        p.releaseWeek > currentWeek - 52 &&
        p.awardsProfile !== undefined) {

      const formatMatch = (p.format || '').toLowerCase();
      if (formatMatch === 'film') eligibleFilm.push(p);
      else if (formatMatch === 'tv' || formatMatch === 'series') eligibleTv.push(p);

      if (rival) projectToRivalMap[p.id] = rival;
    }
  };

  for (const key in state.studio.internal.projects) {
    processProject(state.studio.internal.projects[key]);
  }

  const rivals = state.industry.rivals;
  for (let i = 0; i < rivals.length; i++) {
    const rival = rivals[i];
    if (rival.projects) {
      for (const key in rival.projects) {
        processProject(rival.projects[key], rival);
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
      const score = (config.evaluator(p) || 0) * (1 + (p.awardsProfile?.campaignStrength || 0) / 25);
      if (score > bestScore) {
        bestScore = score;
        bestProject = p;
      }
    }

    if (bestScore > 100) {
      const isWin = bestScore > 150;
      const prestigeGain = isWin ? 15 : 3;
      
      const isPlayer = !!state.studio.internal.projects[bestProject.id];
      // ⚡ Bolt: Fast O(1) lookup replaced O(N) array .find()
      const rival = projectToRivalMap[bestProject.id];
      const winnerId = isPlayer ? 'PLAYER' : (rival?.id || 'RIVAL');

      // Add Award Record (Global)
      impacts.push({
        type: 'INDUSTRY_UPDATE',
        payload: {
            update: {
                [`industry.awards.${rng.uuid('aw')}`]: {
                    id: rng.uuid('award'),
                    projectId: bestProject.id,
                    name: config.category,
                    category: config.category,
                    body: config.body,
                    status: isWin ? 'won' : 'nominated',
                    year
                }
            }
        }
      });

      // Update Owner Prestige
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
                headline: `AWARDS: "${bestProject.title}" wins ${config.category}`,
                description: `A triumphant victory at the ${config.body} for the entire team behind "${bestProject.title}".`,
                category: 'awards'
            }
        });
      }
    }
  }

  return impacts;
}

export function processRazzies(state: GameState, week: number, rng: RandomGenerator): StateImpact[] {
  // Razzies are currently player-only for crisis generation, this is acceptable for v1 gold
  return [];
}

/**
 * Strategy: Increases a project's awards profile strength via targeted spending.
 */
export function launchAwardsCampaign(
    state: GameState, 
    projectId: string, 
    budget: number, 
    rng: RandomGenerator
): StateImpact[] | null {
    const project = state.studio.internal.projects[projectId];
    if (!project || state.finance.cash < budget) return null;

    const campaignStrengthGain = Math.floor(budget / 1_000_000); // 1 point per $1M

    const impacts: StateImpact[] = [
        {
            type: 'FUNDS_DEDUCTED',
            payload: { amount: budget }
        },
        {
            type: 'PROJECT_UPDATED',
            payload: {
                projectId,
                update: {
                    awardsProfile: {
                        ...(project.awardsProfile || { 
                            criticScore: 50, 
                            audienceScore: 50, 
                            prestigeScore: 30, 
                            craftScore: 50, 
                            culturalHeat: 40,
                            controversyRisk: 0,
                            festivalBuzz: 0,
                            academyAppeal: 50,
                            guildAppeal: 50,
                            populistAppeal: 50,
                            indieCredibility: 50,
                            industryNarrativeScore: 20
                        }),
                        campaignStrength: (project.awardsProfile?.campaignStrength || 0) + campaignStrengthGain
                    }
                }
            }
        },
        {
            type: 'NEWS_ADDED',
            payload: {
                id: rng.uuid('news-aw-camp'),
                headline: `Academy Alert: "${project.title}" Campaign Intensifies`,
                description: `Industry analysts note a massive marketing offensive as the studio pushes for honors.`,
                category: 'awards'
            }
        }
    ];

    return impacts;
}

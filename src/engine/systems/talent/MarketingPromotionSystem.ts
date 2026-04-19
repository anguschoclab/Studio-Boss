import { GameState, StateImpact, Talent, Project } from '../../types';
import { RandomGenerator } from '../../utils/rng';
import {
  TalkShowAppearance,
  TalkShowType,
  MagazinePhotoshoot,
  PhotoshootType,
  PressTour,
  FAMOUS_TALK_SHOWS,
  PRESTIGIOUS_MAGAZINES,
} from '../../types/marketing.types';
import { areRomantic, areFriends, getTalentRelationships } from './RelationshipSystem';
import { getCliqueFameBonus } from './CliqueSystem';

/**
 * Marketing & Promotion System
 * Manages talk show appearances, magazine photoshoots, and press tours.
 * These boost Star Meter and can create viral moments or scandals.
 */

// Appearance generation thresholds
const TALK_SHOW_CHANCE = 0.08; // 8% per week per talent
const PHOTOSHOOT_CHANCE = 0.05; // 5% per week per talent
const PRESS_TOUR_CHANCE = 0.15; // 15% chance when releasing major film

// Performance factors
const BASE_PERFORMANCE = 50;
const CHARISMA_BONUS = 15;
const SCANDAL_RISK_BASE = 5;

/**
 * Generate talk show appearance for a talent
 */
function generateTalkShowAppearance(
  talent: Talent,
  state: GameState,
  rng: RandomGenerator,
  project?: Project
): TalkShowAppearance | null {
  // Check if talent is available (not on medical leave, etc)
  if (talent.onMedicalLeave) return null;

  const showTypes: TalkShowType[] = [
    'late_night', 'morning_show', 'podcast', 'variety', 'comedy_central', 'serious_interview'
  ];

  // Match show type to talent personality
  let preferredTypes = showTypes;
  if (talent.personality === 'charismatic') {
    preferredTypes = ['late_night', 'variety', 'comedy_central'];
  } else if (talent.prestige > 80) {
    preferredTypes = ['serious_interview', 'morning_show'];
  }

  const showType = rng.pick(preferredTypes);
  const showName = rng.pick(FAMOUS_TALK_SHOWS[showType]);

  // Calculate performance
  let performance = BASE_PERFORMANCE;
  if (talent.personality === 'charismatic') performance += CHARISMA_BONUS;
  if (talent.personality === 'difficult') performance -= 10;
  performance += rng.rangeInt(-15, 25);
  performance = Math.max(0, Math.min(100, performance));

  // Viral moment chance (higher for high performance)
  const viralThreshold = 85;
  const viralMoment = performance > viralThreshold && rng.next() < 0.3;

  // Scandal risk (difficult personalities + live TV = risk)
  let scandalChance = SCANDAL_RISK_BASE;
  if (talent.personality === 'difficult') scandalChance += 20;
  if (showType === 'comedy_central') scandalChance += 10;
  if (showType === 'variety') scandalChance += 5;
  const scandalGenerated = rng.next() < (scandalChance / 100);

  // Calculate reach based on show type and talent fame
  const baseReach: Record<TalkShowType, number> = {
    'late_night': 2000000,
    'morning_show': 3500000,
    'podcast': 500000,
    'variety': 1500000,
    'comedy_central': 800000,
    'serious_interview': 1200000,
  };
  const reach = Math.floor(baseReach[showType] * (talent.starMeter || 50) / 50);

  // Calculate boosts
  const prestigeChange = performance > 70 ? 1 : (performance < 40 ? -1 : 0);
  const starMeterBoost = Math.floor((performance - 50) / 10) + (viralMoment ? 10 : 0);

  return {
    id: rng.uuid('TSH'),
    talentId: talent.id,
    projectId: project?.id,
    showName,
    showType,
    week: state.week,
    performance,
    viralMoment,
    scandalGenerated,
    audienceReach: reach,
    prestigeChange,
    starMeterBoost,
    chemistryBonus: 0, // Could be calculated if we track host relationships
  };
}

/**
 * Generate magazine photoshoot for a talent
 */
function generatePhotoshoot(
  talent: Talent,
  state: GameState,
  rng: RandomGenerator,
  coTalent?: Talent // For couple/clique shoots
): MagazinePhotoshoot | null {
  const shootTypes: PhotoshootType[] = [
    'magazine_cover', 'fashion_editorial', 'promotional', 'candid', 'red_carpet', 'controversial'
  ];

  // Choose shoot type based on talent
  let preferredTypes = shootTypes;
  if (talent.accessLevel === 'dynasty' || talent.tier === 1) {
    preferredTypes = ['magazine_cover', 'fashion_editorial'];
  } else if (talent.psychology?.scandalRisk && talent.psychology.scandalRisk > 60) {
    preferredTypes = ['controversial', 'candid'];
  }

  const shootType = rng.pick(preferredTypes);
  const magazineName = rng.pick(PRESTIGIOUS_MAGAZINES);

  // Quality based on talent prestige + photographer skill (random)
  let quality = (talent.prestige || 50) * 0.5 + rng.rangeInt(20, 50);
  if (shootType === 'controversial') quality += 10; // Edgy shoots get attention
  quality = Math.min(100, quality);

  // Controversy level
  let controversy = 0;
  if (shootType === 'controversial') controversy = rng.rangeInt(40, 80);
  else if (shootType === 'candid') controversy = rng.rangeInt(10, 30);
  else if (talent.psychology?.scandalRisk && talent.psychology.scandalRisk > 60) {
    controversy = rng.rangeInt(20, 50);
  }

  // Publication happens 1-3 weeks after shoot
  const publicationWeek = state.week + rng.rangeInt(1, 3);

  // Calculate boosts
  const starMeterBoost = Math.floor(quality / 10) + (controversy > 50 ? 5 : 0);
  const prestigeChange = shootType === 'magazine_cover' && quality > 80 ? 2 :
                         shootType === 'controversial' ? -1 : 0;

  const coTalentIds = coTalent ? [coTalent.id] : [];
  const isCoupleShoot = coTalent ? areRomantic(talent.id, coTalent.id, state) : false;

  return {
    id: rng.uuid('PHS'),
    talentId: talent.id,
    magazineName,
    shootType,
    week: state.week,
    quality,
    controversy,
    publicationWeek,
    starMeterBoost,
    prestigeChange,
    coTalentIds,
    isCoupleShoot,
  };
}

/**
 * Generate press tour for major release
 */
function generatePressTour(
  project: Project,
  talents: Talent[],
  state: GameState,
  rng: RandomGenerator
): PressTour | null {
  if (talents.length === 0) return null;

  const duration = rng.rangeInt(2, 4); // 2-4 weeks

  const tour: PressTour = {
    id: rng.uuid('PRT'),
    projectId: project.id,
    talentIds: talents.map(t => t.id),
    startWeek: state.week,
    endWeek: state.week + duration,
    appearances: [],
    photoshoots: [],
    totalCost: talents.length * duration * 50000, // $50k per talent per week
    effectiveness: 0, // Calculated after generation
  };

  // Generate appearances for each week
  for (let week = 0; week < duration; week++) {
    for (const talent of talents) {
      // 70% chance of appearance per talent per week
      if (rng.next() < 0.7) {
        const appearance = generateTalkShowAppearance(talent, state, rng, project);
        if (appearance) {
          appearance.week = state.week + week;
          tour.appearances.push(appearance);
        }
      }

      // 40% chance of photoshoot per talent
      if (rng.next() < 0.4) {
        const photoshoot = generatePhotoshoot(talent, state, rng);
        if (photoshoot) {
          photoshoot.week = state.week + week;
          tour.photoshoots.push(photoshoot);
        }
      }
    }

    // Couple shoots for romantic partners on same tour
    for (let i = 0; i < talents.length; i++) {
      for (let j = i + 1; j < talents.length; j++) {
        if (areRomantic(talents[i].id, talents[j].id, state) && rng.next() < 0.3) {
          const coupleShoot = generatePhotoshoot(talents[i], state, rng, talents[j]);
          if (coupleShoot) {
            coupleShoot.week = state.week + week;
            tour.photoshoots.push(coupleShoot);
          }
        }
      }
    }
  }

  // Calculate effectiveness
  const avgPerformance = tour.appearances.length > 0
    ? tour.appearances.reduce((sum, a) => sum + a.performance, 0) / tour.appearances.length
    : 50;
  tour.effectiveness = Math.floor(avgPerformance);

  return tour;
}

/**
 * Main marketing promotion tick
 */
export function tickMarketingPromotionSystem(
  state: GameState,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const talents = Object.values(state.entities.talents || {});

  // 1. Individual talk show appearances
  for (const talent of talents) {
    if (rng.next() < TALK_SHOW_CHANCE * (talent.starMeter || 50) / 50) {
      const appearance = generateTalkShowAppearance(talent, state, rng);

      if (appearance) {
        impacts.push({
          type: 'TALK_SHOW_APPEARANCE_CREATED',
          payload: {
            talentId: talent.id,
            appearance,
          },
        } as any);

        // Apply star meter boost
        if (appearance.starMeterBoost !== 0) {
          impacts.push({
            type: 'TALENT_UPDATED',
            payload: {
              talentId: talent.id,
              update: {
                starMeter: Math.max(0, Math.min(100, (talent.starMeter || 50) + appearance.starMeterBoost)),
              },
            },
          });
        }

        // Viral moment news
        if (appearance.viralMoment) {
          impacts.push({
            type: 'NEWS_ADDED',
            payload: {
              id: rng.uuid('NWS'),
              headline: `${talent.name} Goes Viral on ${appearance.showName}`,
              description: `A clip from the appearance has taken over social media, boosting their profile significantly.`,
              category: 'talent',
              publication: 'Entertainment Weekly',
            },
          });
        }

        // Scandal from appearance
        if (appearance.scandalGenerated) {
          impacts.push({
            type: 'SCANDAL_ADDED',
            payload: {
              scandal: {
                id: rng.uuid('SCD'),
                talentId: talent.id,
                week: state.week,
                type: 'CONTROVERSY',
                description: `${talent.name} made controversial remarks during their ${appearance.showName} appearance`,
                severity: 'medium',
                publicAwareness: 60,
                careerImpact: -5,
              },
            },
          });
        }
      }
    }
  }

  // 2. Individual photoshoots
  for (const talent of talents) {
    // Higher chance for top-tier talent
    const photoshootChance = PHOTOSHOOT_CHANCE * (talent.tier === 1 ? 2 : 1);

    if (rng.next() < photoshootChance) {
      const photoshoot = generatePhotoshoot(talent, state, rng);

      if (photoshoot) {
        impacts.push({
          type: 'PHOTOSHOOT_CREATED',
          payload: {
            talentId: talent.id,
            photoshoot,
          },
        });

        // Apply boosts when published
        if (photoshoot.publicationWeek === state.week) {
          impacts.push({
            type: 'TALENT_UPDATED',
            payload: {
              talentId: talent.id,
              update: {
                starMeter: Math.max(0, Math.min(100, (talent.starMeter || 50) + photoshoot.starMeterBoost)),
                prestige: talent.prestige + photoshoot.prestigeChange,
              },
            },
          });

          // News about cover
          if (photoshoot.shootType === 'magazine_cover') {
            impacts.push({
              type: 'NEWS_ADDED',
              payload: {
                id: rng.uuid('NWS'),
                headline: `${talent.name} Graces Cover of ${photoshoot.magazineName}`,
                description: `The stunning cover shoot is generating major buzz in the industry.`,
                category: 'talent',
                publication: photoshoot.magazineName,
              },
            });
          }

          // News about controversy
          if (photoshoot.controversy > 60) {
            impacts.push({
              type: 'NEWS_ADDED',
              payload: {
                id: rng.uuid('NWS'),
                headline: `${photoshoot.magazineName} ${photoshoot.magazineName} Shoot Sparks Controversy`,
                description: `${talent.name}'s edgy photoshoot is dividing fans and critics alike.`,
                category: 'talent',
                publication: 'Page Six',
              },
            });
          }

          // Couple shoot news
          if (photoshoot.isCoupleShoot && photoshoot.coTalentIds.length > 0) {
            const coTalent = state.entities.talents?.[photoshoot.coTalentIds[0]];
            impacts.push({
              type: 'NEWS_ADDED',
              payload: {
                id: rng.uuid('NWS'),
                headline: `Power Couple: ${talent.name} and ${coTalent?.name} on ${photoshoot.magazineName}`,
                description: `Hollywood's hottest couple poses together in an exclusive shoot.`,
                category: 'talent',
                publication: photoshoot.magazineName,
              },
            });
          }
        }
      }
    }
  }

  // 3. Press tours for upcoming releases
  const upcomingReleases = Object.values(state.entities.projects || {})
    .filter(p => {
      const releaseWeek = p.releaseWeek;
      return releaseWeek && releaseWeek - state.week >= 2 && releaseWeek - state.week <= 6;
    });

  for (const project of upcomingReleases) {
    if (rng.next() < PRESS_TOUR_CHANCE) {
      // Get attached talent
      const projectContracts = Object.values(state.entities.contracts || {})
        .filter(c => c.projectId === project.id);
      const talentIds = projectContracts.map(c => c.talentId);
      const talents = talentIds
        .map(id => state.entities.talents?.[id])
        .filter((t): t is Talent => !!t);

      if (talents.length > 0) {
        const tour = generatePressTour(project, talents, state, rng);

        if (tour) {
          impacts.push({
            type: 'PRESS_TOUR_CREATED',
            payload: {
              projectId: project.id,
              tour,
              notification: `Press tour launched for "${project.title}" with ${talents.length} talents`,
            },
          } as any);

          // Deduct cost
          impacts.push({
            type: 'FUNDS_DEDUCTED',
            cashChange: -tour.totalCost,
          });

          // News about tour
          impacts.push({
            type: 'NEWS_ADDED',
            payload: {
              id: rng.uuid('NWS'),
              headline: `"${project.title}" Press Tour Kicks Off`,
              description: `The cast is hitting all the major talk shows and magazines to promote the upcoming release.`,
              category: 'industry',
              publication: 'Variety',
            },
          });
        }
      }
    }
  }

  return impacts;
}

/**
 * Get active press tours for a project
 */
export function getActivePressTours(projectId: string, state: GameState): import('../../types/marketing.types').PressTour[] {
  const marketing = state.relationships?.marketingPromotions || {};
  return Object.values(marketing.activePressTours || {})
    .filter((t) => t.projectId === projectId);
}

/**
 * Calculate buzz bonus from marketing activities
 */
export function calculateMarketingBuzz(
  projectId: string,
  state: GameState
): { buzzScore: number; viralMoments: number } {
  const marketing = state.relationships?.marketingPromotions || {};

  const appearances = Object.values(marketing.talkShowAppearances || {});
  const relevantAppearances = appearances.filter(a => a.projectId === projectId);

  const viralMoments = relevantAppearances.filter(a => a.viralMoment).length;
  const buzzScore = relevantAppearances.reduce((sum, a) => sum + (a.performance / 10), 0);

  return { buzzScore, viralMoments };
}

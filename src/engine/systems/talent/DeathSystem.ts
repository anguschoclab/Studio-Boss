import { GameState, StateImpact, Talent, Project, Contract } from '../../types';
import { RandomGenerator } from '../../utils/rng';

/**
 * Death System
 * Handles talent mortality including natural death, accidents, overdoses, and other causes.
 * Integrates with production to handle active projects and co-star grief.
 */

export type DeathType =
  | 'natural'           // Age-related
  | 'accident'          // On-set accident or general accident
  | 'overdose'          // Substance-related
  | 'suicide'           // Mental health
  | 'violence'          // Crime/murder
  | 'illness';          // Disease during filming

export interface DeathEvent {
  id: string;
  talentId: string;
  week: number;
  type: DeathType;
  cause: string;
  location: string;
  isPublic: boolean;
  impactsProduction: boolean;
  griefLevel: number; // 0-100, affects co-stars
  isDuringProduction: boolean;
  projectId?: string; // If died during production
}

interface DeathProbability {
  baseChance: number;
  ageMultiplier: number;
  type: DeathType;
  minAge: number;
}

// Death probabilities by age and type
const DEATH_PROBABILITIES: DeathProbability[] = [
  // Natural causes - increases exponentially with age
  { type: 'natural', baseChance: 0.0001, ageMultiplier: 1.15, minAge: 50 },
  // Accidents - constant low chance, slightly higher for action performers
  { type: 'accident', baseChance: 0.0002, ageMultiplier: 1.0, minAge: 18 },
  // Overdose - higher for younger, decreases with age
  { type: 'overdose', baseChance: 0.0003, ageMultiplier: 0.95, minAge: 18 },
  // Suicide - peaks in middle age
  { type: 'suicide', baseChance: 0.00015, ageMultiplier: 1.02, minAge: 25 },
  // Violence - rare, affects all ages
  { type: 'violence', baseChance: 0.00005, ageMultiplier: 1.0, minAge: 18 },
  // Illness - increases with age
  { type: 'illness', baseChance: 0.0002, ageMultiplier: 1.1, minAge: 40 },
];

// Death descriptions by type
const DEATH_CAUSES: Record<DeathType, string[]> = {
  natural: [
    'passed away peacefully in their sleep',
    'died of natural causes at their home',
    'succumbed to age-related complications',
    'passed away surrounded by family',
  ],
  accident: [
    'died in a tragic car accident',
    'passed away following a fall at their residence',
    'died in a plane crash',
    'passed away after a tragic accident on set',
    'died in a drowning accident',
  ],
  overdose: [
    'passed away from an accidental drug overdose',
    'died from prescription medication complications',
    'succumbed to a suspected overdose',
    'passed away after battling substance abuse',
  ],
  suicide: [
    'died by suicide',
    'passed away from self-inflicted injuries',
    'succumbed to mental health struggles',
    'died after a long battle with depression',
  ],
  violence: [
    'died in a violent attack',
    'passed away following a home invasion',
    'was tragically murdered',
    'died from injuries sustained in an assault',
  ],
  illness: [
    'passed away after a battle with cancer',
    'succumbed to complications from heart disease',
    'died from complications of pneumonia',
    'passed away after a brief illness',
    'succumbed to a rare autoimmune disorder',
  ],
};

const DEATH_LOCATIONS = [
  'Los Angeles', 'New York', 'London', 'Paris', 'Tokyo',
  'Malibu', 'Beverly Hills', 'Manhattan', 'Miami', 'Vancouver',
  'on set', 'at home', 'in hospital', 'on location',
];

/**
 * Calculate death probability for a talent based on age and type
 */
function calculateDeathProbability(age: number, prob: DeathProbability): number {
  if (age < prob.minAge) return 0;

  let chance = prob.baseChance;

  // Apply age multiplier for each year over minimum
  const yearsOverMin = age - prob.minAge;
  chance *= Math.pow(prob.ageMultiplier, yearsOverMin);

  return chance;
}

/**
 * Determine if death occurs during active production
 */
function isDeathDuringProduction(talent: Talent, state: GameState): { isDuring: boolean; projectId?: string } {
  const activeCommitments = talent.commitments?.filter(
    c => c.startWeek <= state.week && c.endWeek >= state.week
  ) || [];

  if (activeCommitments.length === 0) {
    return { isDuring: false };
  }

  // Get the most significant project (prefer film over TV, higher budget)
  const projects = activeCommitments.map(c => ({
    commitment: c,
    project: state.entities.projects?.[c.projectId],
  })).filter(p => p.project);

  if (projects.length === 0) {
    return { isDuring: false };
  }

  // Sort by significance (film > TV, higher budget)
  projects.sort((a, b) => {
    const formatA = a.project?.format === 'film' ? 2 : 1;
    const formatB = b.project?.format === 'film' ? 2 : 1;
    if (formatA !== formatB) return formatB - formatA;

    const budgetA = a.project?.budget || 0;
    const budgetB = b.project?.budget || 0;
    return budgetB - budgetA;
  });

  return {
    isDuring: true,
    projectId: projects[0].project.id,
  };
}

/**
 * Calculate grief impact on co-stars
 */
function calculateGriefImpact(deadTalent: Talent, state: GameState): { coStarIds: string[]; griefLevel: number } {
  // Find all talents who worked with the deceased
  const coStarIds: string[] = [];

  // Check current projects
  const activeProjects = Object.values(state.entities.projects || {})
    .filter(p => p.state === 'production' || p.state === 'marketing');

  for (const project of activeProjects) {
    const contracts = Object.values(state.entities.contracts || {})
      .filter(c => c.projectId === project.id);

    const isDeadTalentInProject = contracts.some(c => c.talentId === deadTalent.id);
    if (isDeadTalentInProject) {
      // Add all other talents in this project as co-stars
      contracts.forEach(c => {
        if (c.talentId !== deadTalent.id && !coStarIds.includes(c.talentId)) {
          coStarIds.push(c.talentId);
        }
      });
    }
  }

  // Calculate grief level based on relationship and talent tier
  // Higher tier talent = more grief industry-wide
  const tierGrief = deadTalent.tier === 1 ? 80 : deadTalent.tier === 2 ? 60 : 40;

  return { coStarIds, griefLevel: tierGrief };
}

/**
 * Generate a death event for a talent
 */
function generateDeathEvent(
  talent: Talent,
  deathType: DeathType,
  state: GameState,
  rng: RandomGenerator
): DeathEvent {
  const { isDuring, projectId } = isDeathDuringProduction(talent, state);
  const { griefLevel } = calculateGriefImpact(talent, state);

  const causes = DEATH_CAUSES[deathType];
  const cause = rng.pick(causes);
  const location = rng.pick(DEATH_LOCATIONS);

  // Deaths during production of major films are always public
  // Some other deaths might be kept quiet initially
  const isPublic = isDuring || rng.next() < 0.9; // 90% of deaths become public

  return {
    id: rng.uuid('DTH'),
    talentId: talent.id,
    week: state.week,
    type: deathType,
    cause,
    location,
    isPublic,
    impactsProduction: isDuring,
    griefLevel,
    isDuringProduction: isDuring,
    projectId,
  };
}

/**
 * Process death impacts on active projects
 */
function processProjectImpacts(
  deathEvent: DeathEvent,
  state: GameState,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];

  if (!deathEvent.isDuringProduction || !deathEvent.projectId) {
    return impacts;
  }

  const project = state.entities.projects?.[deathEvent.projectId];
  if (!project) return impacts;

  // Project enters crisis mode
  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: {
      projectId: project.id,
      update: {
        activeCrisis: {
          id: rng.uuid('CRS'),
          templateId: 'TALENT_DEATH',
          description: `${state.entities.talents?.[deathEvent.talentId]?.name} tragically died during production`,
          triggeredWeek: state.week,
          options: [
            {
              text: 'Recast Role',
              effectDescription: 'Find a replacement actor. Adds 4 weeks delay and $2M in additional costs.',
              cashPenalty: 2_000_000,
              weeksDelay: 4,
            },
            {
              text: 'Rewrite to Remove Character',
              effectDescription: 'Rewrite script to remove the character. May affect story quality.',
              buzzPenalty: 15,
            },
            {
              text: 'Use CGI and Body Double',
              effectDescription: 'Complete remaining scenes digitally. Adds $5M in CGI costs.',
              cashPenalty: 5_000_000,
            },
          ],
        },
      },
    },
  });

  // Add news about production halt
  impacts.push({
    type: 'NEWS_ADDED',
    payload: {
      id: rng.uuid('NWS'),
      headline: `Production on "${project.title}" Halted After Cast Member Death`,
      description: `Filming has been suspended following the tragic passing of ${state.entities.talents?.[deathEvent.talentId]?.name}. The studio is evaluating options to complete the project.`,
      category: 'talent',
      publication: 'Variety',
    },
  });

  return impacts;
}

/**
 * Process grief impacts on co-stars
 */
function processGriefImpacts(
  deathEvent: DeathEvent,
  state: GameState,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const { coStarIds, griefLevel } = calculateGriefImpact(
    state.entities.talents?.[deathEvent.talentId]!,
    state
  );

  for (const coStarId of coStarIds) {
    const coStar = state.entities.talents?.[coStarId];
    if (!coStar) continue;

    // Co-stars may request time off
    if (rng.next() < griefLevel / 200) { // Up to 40% chance for high grief
      impacts.push({
        type: 'TALENT_UPDATED',
        payload: {
          talentId: coStarId,
          update: {
            onMedicalLeave: true,
            medicalLeaveEndsWeek: state.week + rng.rangeInt(2, 6),
          },
        },
      });

      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          id: rng.uuid('NWS'),
          headline: `${coStar.name} Steps Away From Production to Grieve`,
          description: `Following the death of their co-star, ${coStar.name} has temporarily left the production to process their grief.`,
          category: 'talent',
          publication: 'The Hollywood Reporter',
        },
      });
    }
  }

  return impacts;
}

/**
 * Determine if talent is owned by player or a rival studio
 */
function getTalentOwner(talent: Talent, state: GameState): string | null {
  // Check contracts
  const contracts = Object.values(state.entities.contracts || {})
    .filter(c => c.talentId === talent.id);

  for (const contract of contracts) {
    if (contract.ownerId === state.studio.id) {
      return 'player';
    }
    // Check if ownerId is a rival
    if (state.entities.rivals?.[contract.ownerId]) {
      return contract.ownerId;
    }
  }

  // Check pacts
  const pact = state.deals?.activeDeals?.find(d => d.talentId === talent.id);
  if (pact) {
    if (pact.studioId === state.studio.id) {
      return 'player';
    }
    if (state.entities.rivals?.[pact.studioId]) {
      return pact.studioId;
    }
  }

  return null;
}

/**
 * Main death system tick function
 * Called weekly to check for talent deaths
 */
export function tickDeathSystem(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  const deathEvents: DeathEvent[] = [];

  const talents = Object.values(state.entities.talents || {});

  for (const talent of talents) {
    // Skip if already on medical leave (hospitalized, protected)
    if (talent.onMedicalLeave) continue;

    const age = talent.demographics?.age || 40;

    // Check each death type
    for (const prob of DEATH_PROBABILITIES) {
      const deathChance = calculateDeathProbability(age, prob);

      if (rng.next() < deathChance) {
        // Death occurs
        const deathEvent = generateDeathEvent(talent, prob.type, state, rng);
        deathEvents.push(deathEvent);

        // Create death news
        const headline = deathEvent.isDuringProduction
          ? `${talent.name} Dies Tragically During Production`
          : `${talent.name} Passes Away at ${age}`;

        impacts.push({
          type: 'NEWS_ADDED',
          payload: {
            id: rng.uuid('NWS'),
            headline,
            description: `${talent.name}, ${age}, ${deathEvent.cause} ${deathEvent.location}. The industry mourns the loss of this ${talent.tier === 1 ? 'legendary' : talent.tier === 2 ? 'acclaimed' : 'beloved'} ${talent.role}.`,
            category: 'talent',
            publication: deathEvent.isPublic ? 'Variety' : 'Industry Insider',
          },
        });

        // Remove talent from pool
        impacts.push({
          type: 'TALENT_REMOVED',
          payload: {
            talentId: talent.id,
            causeOfRemoval: 'death',
            deathType: deathEvent.type,
            deathWeek: state.week,
          },
        });

        // Check if talent was owned by AI studio
        const owner = getTalentOwner(talent, state);
        if (owner && owner !== 'player') {
          impacts.push({
            type: 'RIVAL_UPDATED',
            payload: {
              rivalId: owner,
              update: {
                // AI studio loses strength/prestige from talent death
                strength: Math.max(0, (state.entities.rivals?.[owner]?.strength || 50) - 2),
                recentActivity: `Mourning the loss of ${talent.name}`,
              },
            },
          });
        }

        // Process project impacts
        impacts.push(...processProjectImpacts(deathEvent, state, rng));

        // Process grief impacts
        impacts.push(...processGriefImpacts(deathEvent, state, rng));

        // Only one death per talent per week (obviously)
        break;
      }
    }
  }

  // Store death events in state for historical tracking
  if (deathEvents.length > 0) {
    impacts.push({
      type: 'SYSTEM_TICK',
      payload: {
        deathEvents,
        deathCount: deathEvents.length,
      },
    } as any);
  }

  return impacts;
}

/**
 * Get death statistics for a given time period
 */
export function getDeathStatistics(state: GameState, weeks: number = 52): {
  totalDeaths: number;
  byType: Record<DeathType, number>;
  duringProduction: number;
} {
  // This would access stored death events from state
  // For now, return placeholder
  return {
    totalDeaths: 0,
    byType: { natural: 0, accident: 0, overdose: 0, suicide: 0, violence: 0, illness: 0 },
    duringProduction: 0,
  };
}

import { GameState, StateImpact, Talent, Project, Contract } from '../../types';
import { RandomGenerator } from '../../utils/rng';
import {
  ScreenplayNote,
  ScreenplayNoteType,
  ProductionAddition,
  ProductionAdditionType,
  CreditScene,
  CreditSceneType,
} from '../../types/production.types';
import { getTalentRelationships, areFriends } from './RelationshipSystem';

/**
 * Production Enhancement System
 * Manages screenplay notes from talent, production additions during filming,
 * and credit scenes (mid/post credits).
 */

// Note generation chance per week during pre-production
const NOTE_GENERATION_CHANCE = 0.15;
const ADDITION_GENERATION_CHANCE = 0.1;

// Quality bonus from implementing notes
const NOTE_QUALITY_BONUSES: Record<ScreenplayNoteType, number> = {
  'character_arc': 8,
  'plot_twist': 6,
  'dialogue_rewrite': 5,
  'pacing_fix': 7,
  'emotional_beat': 6,
  'thematic_deepening': 9,
};

// Cost multipliers for note implementation
const NOTE_COST_MULTIPLIERS: Record<ScreenplayNoteType, number> = {
  'character_arc': 1.2,
  'plot_twist': 0.8,
  'dialogue_rewrite': 0.3,
  'pacing_fix': 0.5,
  'emotional_beat': 0.4,
  'thematic_deepening': 0.6,
};

// Addition bonuses
const ADDITION_BONUSES: Record<ProductionAdditionType, { quality: number; risk: number; marketing: number }> = {
  'stunt_sequence': { quality: 7, risk: 15, marketing: 10 },
  'practical_effects': { quality: 8, risk: 8, marketing: 6 },
  'musical_number': { quality: 6, risk: 3, marketing: 12 },
  'location_shoot': { quality: 5, risk: 10, marketing: 8 },
  'period_costumes': { quality: 6, risk: 2, marketing: 4 },
  'cameo': { quality: 3, risk: 0, marketing: 15 },
  'extended_runtime': { quality: 4, risk: 5, marketing: 5 },
};

/**
 * Generate screenplay notes from talent on a project
 */
function generateScreenplayNotes(
  project: Project,
  state: GameState,
  rng: RandomGenerator
): ScreenplayNote[] {
  const notes: ScreenplayNote[] = [];

  // Get talent attached to project
  const projectContracts = Object.values(state.entities.contracts || {})
    .filter(c => c.projectId === project.id);

  const talentIds = projectContracts.map(c => c.talentId);
  const talents = talentIds
    .map(id => state.entities.talents?.[id])
    .filter((t): t is Talent => !!t);

  // Each talent has a chance to provide notes
  for (const talent of talents) {
    if (rng.next() < NOTE_GENERATION_CHANCE) {
      const noteTypes: ScreenplayNoteType[] = [
        'character_arc', 'plot_twist', 'dialogue_rewrite',
        'pacing_fix', 'emotional_beat', 'thematic_deepening'
      ];
      const type = rng.pick(noteTypes);

      // Quality based on talent skill and prestige
      const baseQuality = (talent.prestige || 50) * 0.4 + (rng.next() * 30);
      const quality = Math.floor(baseQuality);

      // Cost based on note type and project budget
      const costMultiplier = NOTE_COST_MULTIPLIERS[type];
      const cost = Math.floor(project.budget * 0.05 * costMultiplier * (quality / 100));

      const note: ScreenplayNote = {
        id: rng.uuid('SCP'),
        projectId: project.id,
        authorId: talent.id,
        type,
        description: generateNoteDescription(type, talent, rng),
        quality,
        implemented: false,
        qualityBonus: Math.floor(NOTE_QUALITY_BONUSES[type] * (quality / 100)),
        cost,
      };

      notes.push(note);
    }
  }

  return notes;
}

/**
 * Generate description for a screenplay note
 */
function generateNoteDescription(
  type: ScreenplayNoteType,
  talent: Talent,
  rng: RandomGenerator
): string {
  const descriptions: Record<ScreenplayNoteType, string[]> = {
    'character_arc': [
      `${talent.name} suggests a deeper character transformation in the second act`,
      `${talent.name} wants to explore the protagonist's vulnerability more`,
      `Character should have a clearer arc from weakness to strength`,
    ],
    'plot_twist': [
      `${talent.name} proposes an unexpected twist for the finale`,
      `What if the villain isn't who we think?`,
      `A shocking reveal would elevate the third act`,
    ],
    'dialogue_rewrite': [
      `${talent.name} has ideas for sharper dialogue in key scenes`,
      `The banter between leads could be more natural`,
      `Some lines feel too exposition-heavy`,
    ],
    'pacing_fix': [
      `${talent.name} suggests trimming the middle section`,
      `The first act could move faster`,
      `The ending feels rushed - needs more breathing room`,
    ],
    'emotional_beat': [
      `${talent.name} wants to add a powerful emotional moment`,
      `The relationship needs one more beat before the climax`,
      `A quiet moment here would land the theme better`,
    ],
    'thematic_deepening': [
      `${talent.name} suggests exploring the core theme more deeply`,
      `The film could say something more meaningful about [theme]`,
      `Subtext could be richer without hitting the audience over the head`,
    ],
  };

  return rng.pick(descriptions[type]);
}

/**
 * Generate production additions during filming
 */
function generateProductionAdditions(
  project: Project,
  state: GameState,
  rng: RandomGenerator
): ProductionAddition[] {
  const additions: ProductionAddition[] = [];

  if (rng.next() > ADDITION_GENERATION_CHANCE) return additions;

  const additionTypes: ProductionAdditionType[] = [
    'stunt_sequence', 'practical_effects', 'musical_number',
    'location_shoot', 'period_costumes', 'cameo', 'extended_runtime'
  ];
  const type = rng.pick(additionTypes);
  const bonuses = ADDITION_BONUSES[type];

  const addition: ProductionAddition = {
    id: rng.uuid('PRD'),
    projectId: project.id,
    type,
    description: generateAdditionDescription(type, rng),
    addedWeek: state.week,
    cost: Math.floor(project.budget * 0.08 * (rng.next() * 0.5 + 0.75)),
    qualityBonus: bonuses.quality + rng.rangeInt(-2, 3),
    riskIncrease: bonuses.risk,
    marketingValue: bonuses.marketing,
  };

  additions.push(addition);

  return additions;
}

/**
 * Generate description for production addition
 */
function generateAdditionDescription(type: ProductionAdditionType, rng: RandomGenerator): string {
  const descriptions: Record<ProductionAdditionType, string[]> = {
    'stunt_sequence': [
      'Add an elaborate practical stunt sequence',
      'Car chase needs more spectacle',
      'Hero deserves one unforgettable stunt',
    ],
    'practical_effects': [
      'Use practical effects instead of CGI for key shots',
      'Build a full-scale set piece',
      'Practical creature effects will look more authentic',
    ],
    'musical_number': [
      'Add a surprise musical number',
      'The scene needs a song to sell the emotion',
      'Cameo musical performance by famous artist',
    ],
    'location_shoot': [
      'Scout international location for authenticity',
      'Key scenes need real-world backdrop',
      'Exotic location shoot will elevate production value',
    ],
    'period_costumes': [
      'Upgrade to custom period-accurate costumes',
      'Wardrobe needs more authenticity for era',
      'Higher-end costume department budget',
    ],
    'cameo': [
      'Secure surprise celebrity cameo',
      'Famous face in background shot',
      'One-scene appearance by A-lister',
    ],
    'extended_runtime': [
      'Fight for longer runtime - story needs room',
      'Director needs 15 more minutes',
      'Extended cut will be better received',
    ],
  };

  return rng.pick(descriptions[type]);
}

/**
 * Generate credit scenes for franchise/sequel potential
 */
function generateCreditScenes(
  project: Project,
  state: GameState,
  rng: RandomGenerator
): CreditScene[] {
  const scenes: CreditScene[] = [];

  // Only for films with franchise potential
  const isFranchiseProject = project.type === 'FILM' && project.budget > 50000000;
  if (!isFranchiseProject) return scenes;

  // 40% chance to have credit scenes
  if (rng.next() > 0.4) return scenes;

  const types: CreditSceneType[] = ['mid_credits', 'post_credits', 'teaser', 'joke', 'emotional_button'];
  const type = rng.pick(types);

  const unlockConditions: Array<'franchise_member' | 'boxoffice_threshold' | 'sequels' | 'standalone'> = ['franchise_member', 'boxoffice_threshold', 'sequels', 'standalone'];
  const unlockCondition = rng.pick(unlockConditions);

  const scene: CreditScene = {
    id: rng.uuid('CRD'),
    projectId: project.id,
    type,
    description: generateCreditSceneDescription(type, rng),
    unlockCondition,
    cost: Math.floor(project.budget * 0.02),
    audienceBonus: type === 'emotional_button' ? 15 : (type === 'joke' ? 8 : 5),
    franchiseValue: type === 'teaser' ? 20 : (type === 'mid_credits' ? 15 : 10),
    surpriseFactor: rng.rangeInt(40, 80),
    spoiledByRumors: false, // Will be determined by rumor system
  };

  scenes.push(scene);

  // Maybe add a second scene (mid + post credits)
  if (rng.next() < 0.3 && type === 'mid_credits') {
    const secondTypes: CreditSceneType[] = ['post_credits', 'joke', 'emotional_button'];
    const secondType = rng.pick(secondTypes);
    const secondScene: CreditScene = {
      id: rng.uuid('CRD'),
      projectId: project.id,
      type: secondType,
      description: generateCreditSceneDescription(secondType, rng),
      unlockCondition,
      cost: Math.floor(project.budget * 0.01),
      audienceBonus: secondType === 'emotional_button' ? 12 : 6,
      franchiseValue: 8,
      surpriseFactor: rng.rangeInt(30, 60),
      spoiledByRumors: false,
    };
    scenes.push(secondScene);
  }

  return scenes;
}

/**
 * Generate description for credit scene
 */
function generateCreditSceneDescription(type: CreditSceneType, rng: RandomGenerator): string {
  const descriptions: Record<CreditSceneType, string[]> = {
    'mid_credits': [
      'Tease the next installment with a mysterious reveal',
      'New character introduction for sequel setup',
      'Major plot twist revelation',
    ],
    'post_credits': [
      'Final stinger for dedicated fans',
      'Comic relief moment after heavy ending',
      'Sequel hook with major implications',
    ],
    'teaser': [
      'First look at sequel villain',
      'Spin-off character introduction',
      'New team formation reveal',
    ],
    'joke': [
      'Comedic button on the story',
      'Funny outtake moment',
      'Meta-commentary on the film',
    ],
    'emotional_button': [
      'Quiet emotional resolution',
      'Character closure moment',
      'Tribute to cast/crew',
    ],
  };

  return rng.pick(descriptions[type]);
}

/**
 * Calculate total quality bonus from implemented notes
 */
export function getProjectQualityBonus(
  projectId: string,
  state: GameState
): { screenplayBonus: number; additionBonus: number; creditSceneBonus: number } {
  const enhancements = (state as any).productionEnhancements || {};

  const screenplayBonus = (Object.values(enhancements.screenplayNotes || {}) as ScreenplayNote[])
    .filter(n => n.projectId === projectId && n.implemented)
    .reduce((sum, n) => sum + n.qualityBonus, 0);

  const additionBonus = (Object.values(enhancements.productionAdditions || {}) as ProductionAddition[])
    .filter(a => a.projectId === projectId)
    .reduce((sum, a) => sum + a.qualityBonus, 0);

  const creditSceneBonus = (Object.values(enhancements.creditScenes || {}) as CreditScene[])
    .filter(c => c.projectId === projectId)
    .reduce((sum, c) => sum + c.audienceBonus, 0);

  return { screenplayBonus, additionBonus, creditSceneBonus };
}

/**
 * Main production enhancement tick
 */
export function tickProductionEnhancementSystem(
  state: GameState,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];

  // Get active projects in production or pre-production
  const activeProjects = Object.values(state.entities.projects || {})
    .filter(p => (p as any).status === 'PRE_PRODUCTION' || (p as any).status === 'IN_PRODUCTION');

  for (const project of activeProjects) {
    const projectStatus = (project as any).status;

    // Generate screenplay notes during pre-production
    if (projectStatus === 'PRE_PRODUCTION') {
      const notes = generateScreenplayNotes(project, state, rng);
      for (const note of notes) {
        impacts.push({
          type: 'SCREENPLAY_NOTE_CREATED',
          payload: {
            projectId: project.id,
            note,
            notification: `${state.entities.talents?.[note.authorId]?.name} has provided screenplay notes for "${project.title}"`,
          },
        } as any);
      }
    }

    // Generate production additions during production
    if (projectStatus === 'IN_PRODUCTION') {
      const additions = generateProductionAdditions(project, state, rng);
      for (const addition of additions) {
        impacts.push({
          type: 'PRODUCTION_ADDITION_CREATED',
          payload: {
            projectId: project.id,
            addition,
            notification: `New production addition for "${project.title}": ${addition.description}`,
          },
        } as any);

        // Add cost to project
        impacts.push({
          type: 'PROJECT_UPDATED',
          payload: {
            projectId: project.id,
            update: {
              budget: project.budget + addition.cost,
              weeklyCost: (project.weeklyCost || 0) + Math.floor(addition.cost / 10),
            },
          },
        });
      }
    }

    // Generate credit scenes during production
    if (projectStatus === 'IN_PRODUCTION' && project.type === 'FILM') {
      const scenes = generateCreditScenes(project, state, rng);
      for (const scene of scenes) {
        impacts.push({
          type: 'CREDIT_SCENE_CREATED',
          payload: {
            projectId: project.id,
            scene,
            notification: `Credit scene planned for "${project.title}"`,
          },
        } as any);
      }
    }
  }

  return impacts;
}

/**
 * Apply an unimplemented screenplay note
 */
export function implementScreenplayNote(
  noteId: string,
  state: GameState,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const enhancements = (state as any).productionEnhancements || {};
  const note = enhancements.screenplayNotes?.[noteId] as ScreenplayNote | undefined;

  if (!note || note.implemented) return impacts;

  // Deduct cost
  impacts.push({
    type: 'FUNDS_DEDUCTED',
    cashChange: -note.cost,
  });

  // Mark as implemented
  impacts.push({
    type: 'SCREENPLAY_NOTE_IMPLEMENTED',
    payload: {
      noteId,
      note: { ...note, implemented: true, implementedWeek: state.week },
    },
  } as any);

  // Apply quality bonus to project
  const project = state.entities.projects?.[note.projectId];
  if (project) {
    // Quality will be calculated from notes in production system
    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        id: rng.uuid('NWS'),
        headline: `"${project.title}" Incorporates Talent Feedback`,
        description: `The production team has implemented screenplay suggestions from the cast, potentially improving the final product.`,
        category: 'industry',
        publication: 'Deadline',
      },
    });
  }

  return impacts;
}

/**
 * Spoil a credit scene via rumors (affects surprise value)
 */
export function spoilCreditScene(
  sceneId: string,
  state: GameState,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const enhancements = (state as any).productionEnhancements || {};
  const scene = enhancements.creditScenes?.[sceneId] as CreditScene | undefined;

  if (!scene || scene.spoiledByRumors) return impacts;

  const updatedScene: CreditScene = {
    ...scene,
    spoiledByRumors: true,
  };

  impacts.push({
    type: 'CREDIT_SCENE_UPDATED',
    payload: {
      sceneId,
      scene: updatedScene,
    },
  } as any);

  // News about leak
  const project = state.entities.projects?.[scene.projectId];
  if (project) {
    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        id: rng.uuid('NWS'),
        headline: `"${project.title}" Credit Scene Leaked`,
        description: `Spoilers are circulating about the film's post-credits content. The studio is scrambling to control the narrative.`,
        category: 'industry',
        publication: 'The Hollywood Reporter',
      },
    });
  }

  return impacts;
}

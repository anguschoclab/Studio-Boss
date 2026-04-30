import { GameState, StateImpact, Talent, Project } from '../../types';
import { RandomGenerator } from '../../utils/rng';
import {
  TalentComfortLevel,
  ComfortPremiumRates,
  ScriptRequirement,
  ScriptRequirementType,
  ScriptRequirementLevel,
  CastingConstraintCheck,
  CastingConstraintViolation,
  CastingConstraintOption,
  REQUIREMENT_COMFORT_MAPPING,
  NUDITY_PREMIUM_RATES,
  STUNT_PREMIUM_RATES,
  INTIMACY_PREMIUM_RATES,
  RISK_PREMIUM_RATES,
  ComfortLevelNudity,
  ComfortLevelStunts,
  ComfortLevelIntimacy,
  ComfortLevelRisk,
} from '../../types/casting.types';
import { getTalentRelationships, areRomantic } from './RelationshipSystem';

/**
 * Casting Constraint System
 * Manages script requirements (nudity, stunts, intimacy) and checks talent willingness.
 * Handles premium negotiations and suggests alternatives.
 */

// Base comfort levels by personality
const PERSONALITY_COMFORT_BASE: Record<string, Partial<TalentComfortLevel>> = {
  'charismatic': { intimacy: 'passionate', risk: 'adventurous' },
  'difficult': { nudity: 'none', risk: 'conservative' },
  'perfectionist': { stunts: 'moderate', risk: 'moderate' },
  'collaborative': { nudity: 'tasteful', intimacy: 'tasteful' },
};

// Prestige affects comfort (higher prestige = more selective)
const PRESTIGE_COMFORT_MODIFIER = (prestige: number): Partial<TalentComfortLevel> => {
  if (prestige > 80) return { nudity: 'tasteful', risk: 'conservative' };
  if (prestige > 60) return { nudity: 'partial' };
  return {};
};

/**
 * Generate comfort levels for a talent based on personality and prestige
 */
export function generateTalentComfortLevel(
  talent: Talent,
  rng: RandomGenerator
): { comfort: TalentComfortLevel; rates: ComfortPremiumRates } {
  const baseComfort: TalentComfortLevel = {
    nudity: 'tasteful',
    stunts: 'minor',
    intimacy: 'tasteful',
    risk: 'moderate',
  };

  // Apply personality modifiers
  const personalityMods = talent.personality ? PERSONALITY_COMFORT_BASE[talent.personality] : {};
  const prestigeMods = PRESTIGE_COMFORT_MODIFIER(talent.prestige || 50);

  // Merge modifiers
  const comfort: TalentComfortLevel = {
    nudity: personalityMods?.nudity || prestigeMods?.nudity || baseComfort.nudity,
    stunts: personalityMods?.stunts || baseComfort.stunts,
    intimacy: personalityMods?.intimacy || prestigeMods?.intimacy || baseComfort.intimacy,
    risk: personalityMods?.risk || prestigeMods?.risk || baseComfort.risk,
  };

  // Random variation
  if (rng.next() < 0.2) {
    const nudityLevels: Array<'none' | 'tasteful' | 'partial' | 'full'> = ['none', 'tasteful', 'partial', 'full'];
    const currentIdx = nudityLevels.indexOf(comfort.nudity);
    const shift = rng.next() < 0.5 ? -1 : 1;
    const newIdx = Math.max(0, Math.min(nudityLevels.length - 1, currentIdx + shift));
    comfort.nudity = nudityLevels[newIdx];
  }

  // Calculate premium rates based on comfort
  const rates: ComfortPremiumRates = {
    nudityMultiplier: NUDITY_PREMIUM_RATES[comfort.nudity as keyof typeof NUDITY_PREMIUM_RATES] || 1.5,
    stuntMultiplier: STUNT_PREMIUM_RATES[comfort.stunts as keyof typeof STUNT_PREMIUM_RATES] || 1.2,
    intimacyMultiplier: INTIMACY_PREMIUM_RATES[comfort.intimacy as keyof typeof INTIMACY_PREMIUM_RATES] || 1.3,
  };

  return { comfort, rates };
}

/**
 * Check if talent is willing to fulfill a requirement
 */
export function checkTalentWillingness(
  talent: Talent,
  requirement: ScriptRequirement,
  state: GameState,
  rng: RandomGenerator
): CastingConstraintCheck {
  // Get or generate comfort level
  let comfort = talent.comfortLevel;
  let rates = talent.comfortPremiumRates;

  if (!comfort || !rates) {
    const generated = generateTalentComfortLevel(talent, rng);
    comfort = generated.comfort;
    rates = generated.rates;
  }

  const acceptableLevels = REQUIREMENT_COMFORT_MAPPING[requirement.level];
  let willing = false;
  let requiresPremium = false;
  let requestedPremium = 0;
  let refusalReason: string | undefined;

  // Check willingness based on requirement type
  switch (requirement.type) {
    case 'nudity':
      willing = acceptableLevels.includes(comfort.nudity);
      if (!willing) {
        refusalReason = `${talent.name} is not comfortable with ${requirement.level} nudity scenes`;
      } else if (comfort.nudity === 'tasteful' && requirement.level === 'extreme') {
        requiresPremium = true;
        requestedPremium = Math.floor(talent.fee * (rates.nudityMultiplier - 1));
      }
      break;

    case 'stunts':
      willing = acceptableLevels.includes(comfort.stunts);
      if (!willing) {
        refusalReason = `${talent.name} refuses to perform ${requirement.level} stunt work`;
      } else if (rates.stuntMultiplier > 1.2) {
        requiresPremium = true;
        requestedPremium = Math.floor(talent.fee * (rates.stuntMultiplier - 1));
      }
      break;

    case 'intimacy':
      willing = acceptableLevels.includes(comfort.intimacy);
      if (!willing) {
        refusalReason = `${talent.name} is not comfortable with ${requirement.level} intimacy scenes`;
      } else if (rates.intimacyMultiplier > 1.3) {
        requiresPremium = true;
        requestedPremium = Math.floor(talent.fee * (rates.intimacyMultiplier - 1));
      }
      break;

    case 'physical_risk':
    case 'emotionally_intense':
      willing = comfort.risk !== 'conservative' || requirement.level === 'mild';
      if (!willing) {
        refusalReason = `${talent.name} prefers to avoid high-risk or emotionally intense content`;
      }
      break;
  }

  // Find alternative talent if not willing
  const alternativeTalentIds: string[] = [];
  if (!willing) {
    const allTalents = Object.values(state.entities.talents || {});
    for (const other of allTalents) {
      if (other.id === talent.id) continue;

      const otherComfort = other.comfortLevel || generateTalentComfortLevel(other, rng).comfort;
      const otherAcceptable = REQUIREMENT_COMFORT_MAPPING[requirement.level];

      let otherWilling = false;
      switch (requirement.type) {
        case 'nudity': otherWilling = otherAcceptable.includes(otherComfort.nudity); break;
        case 'stunts': otherWilling = otherAcceptable.includes(otherComfort.stunts); break;
        case 'intimacy': otherWilling = otherAcceptable.includes(otherComfort.intimacy); break;
        case 'physical_risk':
        case 'emotionally_intense': otherWilling = otherComfort.risk !== 'conservative'; break;
      }

      if (otherWilling && other.tier <= talent.tier + 1) {
        alternativeTalentIds.push(other.id);
        if (alternativeTalentIds.length >= 3) break;
      }
    }
  }

  return {
    talentId: talent.id,
    requirement,
    willing,
    requiresPremium,
    requestedPremium,
    refusalReason,
    alternativeTalentIds,
  };
}

/**
 * Generate script requirements from screenplay notes
 */
export function generateRequirementsFromNotes(
  project: Project,
  state: GameState,
  rng: RandomGenerator
): ScriptRequirement[] {
  const requirements: ScriptRequirement[] = [];
  const notes = state.relationships.productionEnhancements?.screenplayNotes || {};

  for (const note of Object.values(notes)) {
    const n = note as import('../../types/state.types').ScreenplayNote;
    if (n.projectId !== project.id || n.status !== 'implemented') continue;

    // Check note type for requirements
    if (n.type === 'emotional_beat' && n.intensity === 'high') {
      requirements.push({
        id: rng.uuid('REQ'),
        projectId: project.id,
        type: 'emotionally_intense',
        level: 'extreme',
        description: `Intense emotional scene requiring deep vulnerability`,
        requiredTalentIds: n.suggestedTalentIds || [],
        premiumBonus: 50000,
        screenplayNoteId: n.id,
      });
    }

    if (n.type === 'plot_twist' && n.description?.toLowerCase().includes('intimate')) {
      requirements.push({
        id: rng.uuid('REQ'),
        projectId: project.id,
        type: 'intimacy',
        level: 'moderate',
        description: `Intimate scene as part of plot twist`,
        requiredTalentIds: n.suggestedTalentIds || [],
        premiumBonus: 75000,
        screenplayNoteId: n.id,
      });
    }
  }

  // Add requirements based on project genre
  if (project.genre?.toLowerCase().includes('action')) {
    requirements.push({
      id: rng.uuid('REQ'),
      projectId: project.id,
      type: 'stunts',
      level: 'moderate',
      description: 'Action sequences requiring physical performance',
      requiredTalentIds: [],
      premiumBonus: 100000,
    });
  }

  return requirements;
}

/**
 * Create a casting constraint violation event
 */
export function createConstraintViolation(
  check: CastingConstraintCheck,
  project: Project,
  state: GameState,
  rng: RandomGenerator
): CastingConstraintViolation {
  const options: CastingConstraintOption[] = [
    {
      id: 'negotiate',
      label: 'Negotiate Premium',
      description: `Pay $${check.requestedPremium.toLocaleString()} to convince them`,
      cashCost: check.requestedPremium,
    },
    {
      id: 'rewrite',
      label: 'Rewrite Scene',
      description: 'Remove the requirement (may reduce quality)',
      removeRequirement: true,
      prestigeCost: 5,
    },
    {
      id: 'delay',
      label: 'Find Replacement',
      description: 'Delay production by 2 weeks to recast',
      weeksDelay: 2,
    },
  ];

  // Add replacement option if alternatives exist
  if (check.alternativeTalentIds.length > 0) {
    const altTalent = state.entities.talents?.[check.alternativeTalentIds[0]];
    options.push({
      id: 'replace',
      label: `Replace with ${altTalent?.name}`,
      description: `Swap talent for someone more comfortable`,
      replaceTalentId: altTalent?.id,
      weeksDelay: 1,
    });
  }

  return {
    id: rng.uuid('VIO'),
    week: state.week,
    projectId: project.id,
    talentId: check.talentId,
    requirement: check.requirement,
    severity: check.requirement.level === 'extreme' ? 'dealbreaker' : 'major',
    options,
  };
}

/**
 * Main casting constraint tick
 */
export function tickCastingConstraintSystem(
  state: GameState,
  rng: RandomGenerator
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const projects = Object.values(state.entities.projects || {});

  for (const project of projects) {
    // Only check projects in pre-production or production
    const projectState = project.state;
    if (!['PRE_PRODUCTION', 'IN_PRODUCTION', 'scripting', 'casting', 'production'].some(s =>
      projectState?.toLowerCase().includes(s.toLowerCase())
    )) {
      continue;
    }

    // Generate requirements from notes
    const requirements = generateRequirementsFromNotes(project, state, rng);

    // Get attached talent
    const contracts = Object.values(state.entities.contracts || {})
      .filter(c => c.projectId === project.id);
    const talentIds = contracts.map(c => c.talentId);

    for (const requirement of requirements) {
      // Check which talent are required for this requirement
      const targetTalentIds = requirement.requiredTalentIds.length > 0
        ? requirement.requiredTalentIds
        : talentIds;

      for (const talentId of targetTalentIds) {
        const talent = state.entities.talents?.[talentId];
        if (!talent) continue;

        const check = checkTalentWillingness(talent, requirement, state, rng);

        // Store the check
        impacts.push({
          type: 'CASTING_CONSTRAINT_CHECKED',
          payload: {
            check,
            comfortLevel: talent.comfortLevel || generateTalentComfortLevel(talent, rng).comfort,
            premiumRates: talent.comfortPremiumRates || generateTalentComfortLevel(talent, rng).rates,
          },
        });

        // If not willing, create violation
        if (!check.willing) {
          const violation = createConstraintViolation(check, project, state, rng);

          impacts.push({
            type: 'CASTING_CONSTRAINT_VIOLATION',
            payload: {
              violation,
              notification: `Casting Issue: ${talent.name} refuses ${requirement.type} requirement in "${project.title}"`,
            },
          });

          // Modal for player decision
          impacts.push({
            type: 'MODAL_TRIGGERED',
            payload: {
              modalType: 'CASTING_CONSTRAINT',
              violationId: violation.id,
              projectId: project.id,
              talentId: talent.id,
              options: violation.options,
            },
          });
        }

        // If willing but wants premium
        if (check.willing && check.requiresPremium) {
          impacts.push({
            type: 'CASTING_PREMIUM_DEMAND',
            payload: {
              talentId: talent.id,
              projectId: project.id,
              requirement,
              requestedPremium: check.requestedPremium,
              notification: `${talent.name} requests $${check.requestedPremium.toLocaleString()} premium for ${requirement.type} scenes`,
            },
          });
        }

        // Suggest alternatives if not willing
        if (!check.willing && check.alternativeTalentIds.length > 0) {
          impacts.push({
            type: 'CASTING_ALTERNATIVE_SUGGESTED',
            payload: {
              projectId: project.id,
              originalTalentId: talent.id,
              alternativeTalentIds: check.alternativeTalentIds,
              requirement,
            },
          });
        }
      }
    }
  }

  return impacts;
}

/**
 * Apply comfort level to a talent (called on talent creation)
 */
export function applyComfortLevelToTalent(
  talent: Talent,
  rng: RandomGenerator
): Partial<Talent> {
  const { comfort, rates } = generateTalentComfortLevel(talent, rng);

  return {
    comfortLevel: comfort,
    comfortPremiumRates: rates,
  };
}

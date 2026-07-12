import { GameState, StateImpact, Talent, Project } from "../../types";
import { RandomGenerator } from "../../utils/rng";
import { getContractsByProjectId } from "../../utils";
import {
  TalentComfortLevel,
  ComfortPremiumRates,
  ScriptRequirement,
  ScriptRequirementType,
  CastingConstraintCheck,
  CastingConstraintViolation,
  CastingConstraintOption,
  REQUIREMENT_COMFORT_MAPPING,
  NUDITY_PREMIUM_RATES,
  STUNT_PREMIUM_RATES,
  INTIMACY_PREMIUM_RATES,
} from "../../types/casting.types";

const PERSONALITY_COMFORT_BASE: Record<string, Partial<TalentComfortLevel>> = {
  charismatic: { intimacy: "passionate", risk: "adventurous" },
  difficult: { nudity: "none", risk: "conservative" },
  perfectionist: { stunts: "moderate", risk: "moderate" },
  collaborative: { nudity: "tasteful", intimacy: "tasteful" },
};

const PRESTIGE_COMFORT_MODIFIER = (prestige: number): Partial<TalentComfortLevel> => {
  if (prestige > 80) return { nudity: "tasteful", risk: "conservative" };
  if (prestige > 60) return { nudity: "partial" };
  return {};
};

export function generateTalentComfortLevel(
  talent: Talent,
  rng: RandomGenerator
): { comfort: TalentComfortLevel; rates: ComfortPremiumRates } {
  const baseComfort: TalentComfortLevel = {
    nudity: "tasteful",
    stunts: "minor",
    intimacy: "tasteful",
    risk: "moderate",
  };

  const personalityMods = talent.personality ? PERSONALITY_COMFORT_BASE[talent.personality] : {};
  const prestigeMods = PRESTIGE_COMFORT_MODIFIER(talent.prestige || 50);

  const comfort: TalentComfortLevel = {
    nudity: personalityMods?.nudity || prestigeMods?.nudity || baseComfort.nudity,
    stunts: personalityMods?.stunts || baseComfort.stunts,
    intimacy: personalityMods?.intimacy || prestigeMods?.intimacy || baseComfort.intimacy,
    risk: personalityMods?.risk || prestigeMods?.risk || baseComfort.risk,
  };

  if (rng.next() < 0.2) {
    const nudityLevels: Array<"none" | "tasteful" | "partial" | "full"> = [
      "none",
      "tasteful",
      "partial",
      "full",
    ];
    const currentIdx = nudityLevels.indexOf(comfort.nudity);
    const shift = rng.next() < 0.5 ? -1 : 1;
    const newIdx = Math.max(0, Math.min(nudityLevels.length - 1, currentIdx + shift));
    comfort.nudity = nudityLevels[newIdx];
  }

  const rates: ComfortPremiumRates = {
    nudityMultiplier:
      NUDITY_PREMIUM_RATES[comfort.nudity as keyof typeof NUDITY_PREMIUM_RATES] || 1.5,
    stuntMultiplier: STUNT_PREMIUM_RATES[comfort.stunts as keyof typeof STUNT_PREMIUM_RATES] || 1.2,
    intimacyMultiplier:
      INTIMACY_PREMIUM_RATES[comfort.intimacy as keyof typeof INTIMACY_PREMIUM_RATES] || 1.3,
  };

  return { comfort, rates };
}

type WillingnessResult = {
  willing: boolean;
  requiresPremium?: boolean;
  premium?: number;
  reason?: string;
};

const WILLINGNESS_HANDLERS: Record<
  ScriptRequirementType,
  (
    talent: Talent,
    req: ScriptRequirement,
    comfort: TalentComfortLevel,
    rates: ComfortPremiumRates
  ) => WillingnessResult
> = {
  nudity: (talent, req, comfort, rates) => {
    const acceptable = REQUIREMENT_COMFORT_MAPPING[req.level];
    const willing = acceptable.includes(comfort.nudity);
    if (!willing)
      return {
        willing: false,
        reason: `${talent.name} is not comfortable with ${req.level} nudity scenes`,
      };
    if (comfort.nudity === "tasteful" && req.level === "extreme") {
      return {
        willing: true,
        requiresPremium: true,
        premium: Math.floor(talent.fee * (rates.nudityMultiplier - 1)),
      };
    }
    return { willing: true };
  },
  stunts: (talent, req, comfort, rates) => {
    const acceptable = REQUIREMENT_COMFORT_MAPPING[req.level];
    const willing = acceptable.includes(comfort.stunts);
    if (!willing)
      return {
        willing: false,
        reason: `${talent.name} refuses to perform ${req.level} stunt work`,
      };
    if (rates.stuntMultiplier > 1.2) {
      return {
        willing: true,
        requiresPremium: true,
        premium: Math.floor(talent.fee * (rates.stuntMultiplier - 1)),
      };
    }
    return { willing: true };
  },
  intimacy: (talent, req, comfort, rates) => {
    const acceptable = REQUIREMENT_COMFORT_MAPPING[req.level];
    const willing = acceptable.includes(comfort.intimacy);
    if (!willing)
      return {
        willing: false,
        reason: `${talent.name} is not comfortable with ${req.level} intimacy scenes`,
      };
    if (rates.intimacyMultiplier > 1.3) {
      return {
        willing: true,
        requiresPremium: true,
        premium: Math.floor(talent.fee * (rates.intimacyMultiplier - 1)),
      };
    }
    return { willing: true };
  },
  physical_risk: (talent, req, comfort) => {
    const willing = comfort.risk !== "conservative" || req.level === "mild";
    return {
      willing,
      reason: willing
        ? undefined
        : `${talent.name} prefers to avoid high-risk or emotionally intense content`,
    };
  },
  emotionally_intense: (talent, req, comfort) => {
    const willing = comfort.risk !== "conservative" || req.level === "mild";
    return {
      willing,
      reason: willing
        ? undefined
        : `${talent.name} prefers to avoid high-risk or emotionally intense content`,
    };
  },
};

export function checkTalentWillingness(
  talent: Talent,
  requirement: ScriptRequirement,
  state: GameState,
  rng: RandomGenerator
): CastingConstraintCheck {
  let comfort = talent.comfortLevel;
  let rates = talent.comfortPremiumRates;

  if (!comfort || !rates) {
    const generated = generateTalentComfortLevel(talent, rng);
    comfort = generated.comfort;
    rates = generated.rates;
  }

  const handler = WILLINGNESS_HANDLERS[requirement.type];
  const result = handler ? handler(talent, requirement, comfort, rates) : { willing: true };

  const alternativeTalentIds: string[] = [];
  if (!result.willing) {
    // ⚡ Bolt Optimization: Replaced Object.values() array allocation with direct for...in loop
    for (const id in state.entities.talents || {}) {
      const other = state.entities.talents![id];
      if (other.id === talent.id) continue;
      const otherComfort = other.comfortLevel || generateTalentComfortLevel(other, rng).comfort;
      const otherRates = other.comfortPremiumRates || generateTalentComfortLevel(other, rng).rates;
      const otherHandler = WILLINGNESS_HANDLERS[requirement.type];
      const otherResult = otherHandler
        ? otherHandler(other, requirement, otherComfort, otherRates)
        : { willing: true };

      if (otherResult.willing && other.tier <= talent.tier + 1) {
        alternativeTalentIds.push(other.id);
        if (alternativeTalentIds.length >= 3) break;
      }
    }
  }

  return {
    talentId: talent.id,
    requirement,
    willing: result.willing,
    requiresPremium: !!result.requiresPremium,
    requestedPremium: result.premium || 0,
    refusalReason: result.reason,
    alternativeTalentIds,
  };
}

export function generateRequirementsFromNotes(
  project: Project,
  state: GameState,
  rng: RandomGenerator
): ScriptRequirement[] {
  const requirements: ScriptRequirement[] = [];
  const notes = state.relationships.productionEnhancements?.screenplayNotes || {};

  // ⚡ Bolt Optimization: Replaced Object.values() array allocation with direct for...in loop
  for (const id in notes) {
    const n = notes[id] as import("../../types/state.types").ScreenplayNote;
    if (n.projectId !== project.id || n.status !== "implemented") continue;

    if (n.type === "emotional_beat" && n.intensity === "high") {
      requirements.push({
        id: rng.uuid("REQ"),
        projectId: project.id,
        type: "emotionally_intense",
        level: "extreme",
        description: `Intense emotional scene requiring deep vulnerability`,
        requiredTalentIds: n.suggestedTalentIds || [],
        premiumBonus: 50000,
        screenplayNoteId: n.id,
      });
    }

    if (n.type === "plot_twist" && n.description?.toLowerCase().includes("intimate")) {
      requirements.push({
        id: rng.uuid("REQ"),
        projectId: project.id,
        type: "intimacy",
        level: "moderate",
        description: `Intimate scene as part of plot twist`,
        requiredTalentIds: n.suggestedTalentIds || [],
        premiumBonus: 75000,
        screenplayNoteId: n.id,
      });
    }
  }

  if (project.genre?.toLowerCase().includes("action")) {
    requirements.push({
      id: rng.uuid("REQ"),
      projectId: project.id,
      type: "stunts",
      level: "moderate",
      description: "Action sequences requiring physical performance",
      requiredTalentIds: [],
      premiumBonus: 100000,
    });
  }

  return requirements;
}

export function createConstraintViolation(
  check: CastingConstraintCheck,
  project: Project,
  state: GameState,
  rng: RandomGenerator
): CastingConstraintViolation {
  const options: CastingConstraintOption[] = [
    {
      id: "negotiate",
      label: "Negotiate Premium",
      description: `Pay $${check.requestedPremium.toLocaleString()} to convince them`,
      cashCost: check.requestedPremium,
    },
    {
      id: "rewrite",
      label: "Rewrite Scene",
      description: "Remove the requirement (may reduce quality)",
      removeRequirement: true,
      prestigeCost: 5,
    },
    {
      id: "delay",
      label: "Find Replacement",
      description: "Delay production by 2 weeks to recast",
      weeksDelay: 2,
    },
  ];

  if (check.alternativeTalentIds.length > 0) {
    const altTalent = state.entities.talents?.[check.alternativeTalentIds[0]];
    options.push({
      id: "replace",
      label: `Replace with ${altTalent?.name}`,
      description: `Swap talent for someone more comfortable`,
      replaceTalentId: altTalent?.id,
      weeksDelay: 1,
    });
  }

  return {
    id: rng.uuid("VIO"),
    week: state.week,
    projectId: project.id,
    talentId: check.talentId,
    requirement: check.requirement,
    severity: check.requirement.level === "extreme" ? "dealbreaker" : "major",
    options,
  };
}

export function tickCastingConstraintSystem(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];

  // ⚡ Bolt Optimization: Replaced Object.values() array allocation with direct for...in loop
  for (const projectId in state.entities.projects || {}) {
    const project = state.entities.projects![projectId];
    const projectState = project.state;
    if (
      !["PRE_PRODUCTION", "IN_PRODUCTION", "scripting", "casting", "production"].some((s) =>
        projectState?.toLowerCase().includes(s.toLowerCase())
      )
    ) {
      continue;
    }

    const requirements = generateRequirementsFromNotes(project, state, rng);
    const contracts = getContractsByProjectId(
      state.entities.contractsByProjectId,
      state.entities.contracts,
      project.id
    );
    const talentIds = contracts.map((c) => c.talentId);

    for (const requirement of requirements) {
      const targetTalentIds =
        requirement.requiredTalentIds.length > 0 ? requirement.requiredTalentIds : talentIds;

      for (const talentId of targetTalentIds) {
        const talent = state.entities.talents?.[talentId];
        if (!talent) continue;

        const check = checkTalentWillingness(talent, requirement, state, rng);

        impacts.push({
          type: "CASTING_CONSTRAINT_CHECKED",
          payload: {
            check,
            comfortLevel: talent.comfortLevel || generateTalentComfortLevel(talent, rng).comfort,
            premiumRates:
              talent.comfortPremiumRates || generateTalentComfortLevel(talent, rng).rates,
          },
        });

        if (!check.willing) {
          const violation = createConstraintViolation(check, project, state, rng);
          impacts.push({
            type: "CASTING_CONSTRAINT_VIOLATION",
            payload: {
              violation,
              notification: `Casting Issue: ${talent.name} refuses ${requirement.type} requirement in "${project.title}"`,
            },
          });
          impacts.push({
            type: "MODAL_TRIGGERED",
            payload: {
              modalType: "CASTING_CONSTRAINT",
              violationId: violation.id,
              projectId: project.id,
              talentId: talent.id,
              options: violation.options,
            },
          });
        }

        if (check.willing && check.requiresPremium) {
          impacts.push({
            type: "CASTING_PREMIUM_DEMAND",
            payload: {
              talentId: talent.id,
              projectId: project.id,
              requirement,
              requestedPremium: check.requestedPremium,
              notification: `${talent.name} requests $${check.requestedPremium.toLocaleString()} premium for ${requirement.type} scenes`,
            },
          });
        }

        if (!check.willing && check.alternativeTalentIds.length > 0) {
          impacts.push({
            type: "CASTING_ALTERNATIVE_SUGGESTED",
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

export function applyComfortLevelToTalent(talent: Talent, rng: RandomGenerator): Partial<Talent> {
  const { comfort, rates } = generateTalentComfortLevel(talent, rng);
  return {
    comfortLevel: comfort,
    comfortPremiumRates: rates,
  };
}

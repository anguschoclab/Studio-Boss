import { Project, ActiveCrisis, GameState, StateImpact, CrisisOption } from '@/engine/types';
import { pick } from '../utils';
import { CRISIS_POOLS } from '../data/crises.data';

type CrisisSeverity = 'low' | 'medium' | 'high' | 'catastrophic';

interface PrecalculatedCrisisPool {
  description: string;
  options: CrisisOption[];
  severity: CrisisSeverity;
}

const CACHED_CRISIS_POOLS: PrecalculatedCrisisPool[] = CRISIS_POOLS.map(template => {
  let maxDelay = 0;
  let maxCash = 0;
  let maxBuzz = 0;

  for (const option of template.options) {
      if (option.weeksDelay && option.weeksDelay > maxDelay) maxDelay = option.weeksDelay;
      if (option.cashPenalty && option.cashPenalty > maxCash) maxCash = option.cashPenalty;
      if (option.buzzPenalty && option.buzzPenalty > maxBuzz) maxBuzz = option.buzzPenalty;
  }

  let severity: CrisisSeverity = 'low';
  if (maxCash >= 2_000_000 || maxDelay >= 5 || maxBuzz >= 40) {
      severity = 'catastrophic';
  } else if (maxCash >= 800_000 || maxDelay >= 3 || maxBuzz >= 25) {
      severity = 'high';
  } else if (maxCash >= 300_000 || maxDelay >= 1 || maxBuzz >= 10) {
      severity = 'medium';
  }

  return {
    description: template.description,
    options: template.options,
    severity
  };
});

export function checkAndTriggerCrisis(project: Project): ActiveCrisis | undefined {
  if (project.status !== 'production') return undefined;

  if (Math.random() < 0.05) {
    const crisisTemplate = pick(CACHED_CRISIS_POOLS);

    return {
      description: crisisTemplate.description,
      options: [...crisisTemplate.options],
      resolved: false,
      severity: crisisTemplate.severity
    };
  }

  return undefined;
}

export function resolveCrisis(project: Project, optionIndex: number): StateImpact {
  if (!project.activeCrisis || project.activeCrisis.resolved) return {};

  const option = project.activeCrisis.options[optionIndex];
  if (!option) return {};

  const impact: StateImpact = {
    cashChange: option.cashPenalty ? -option.cashPenalty : 0,
    prestigeChange: option.reputationPenalty ? -option.reputationPenalty : 0,
    projectUpdates: [
      {
        projectId: project.id,
        update: {
          productionWeeks: project.productionWeeks + (option.weeksDelay || 0),
          buzz: Math.max(0, project.buzz - (option.buzzPenalty || 0)),
          activeCrisis: {
            ...project.activeCrisis,
            resolved: true
          }
        }
      }
    ],
    newHeadlines: [
      {
        id: `crisis-${crypto.randomUUID()}`,
        text: `Crisis resolved for "${project.title}": ${option.text}`,
        week: 0, // Will be set by store
        category: 'general'
      }
    ],
    newsEvents: [
      {
        type: 'CRISIS',
        headline: `Crisis at ${project.title}`,
        description: `The production faced a major setback: ${project.activeCrisis.description.slice(0, 100)}... Studio resolved it by: ${option.text}`,
        impact: option.effectDescription
      }
    ]
  };

  if (option.removeTalentId) {
    impact.removeContract = {
      talentId: option.removeTalentId,
      projectId: project.id
    };
  }

  return impact;
}

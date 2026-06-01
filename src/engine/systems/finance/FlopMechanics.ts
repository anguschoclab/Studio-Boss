import { GameState, Project, StateImpact } from '@/engine/types';
import { clamp } from '../../utils';

/**
 * Flop Mechanics System
 */

export enum FlopSeverity {
  NONE = 'none',
  MINOR = 'minor',
  MAJOR = 'major',
  CATASTROPHIC = 'catastrophic'
}

export interface FlopResult {
  severity: FlopSeverity;
  writeOffCost: number;
  prestigePenalty: number;
  ipDevaluation: number;
  shouldRestructure: boolean;
}

const FLOP_PENALTY_CONFIGS: Record<Exclude<FlopSeverity, FlopSeverity.NONE>, {
  writeOffPct: number;
  prestigePenalty: number;
  ipDevaluation: number;
  shouldRestructure: boolean;
}> = {
  [FlopSeverity.MINOR]: {
    writeOffPct: 0.3,
    prestigePenalty: -5,
    ipDevaluation: 0.2,
    shouldRestructure: false
  },
  [FlopSeverity.MAJOR]: {
    writeOffPct: 0.5,
    prestigePenalty: -10,
    ipDevaluation: 0.4,
    shouldRestructure: false
  },
  [FlopSeverity.CATASTROPHIC]: {
    writeOffPct: 0.7,
    prestigePenalty: -20,
    ipDevaluation: 0.6,
    shouldRestructure: true
  }
};

/**
 * Calculate flop severity based on revenue vs budget
 */
export function calculateFlopSeverity(project: Project): FlopSeverity {
  const revenue = project.revenue || 0;
  const budget = project.budget || 1;
  const ratio = revenue / budget;

  if (ratio >= 0.8) return FlopSeverity.NONE;
  if (ratio >= 0.5) return FlopSeverity.MINOR;
  if (ratio >= 0.25) return FlopSeverity.MAJOR;
  return FlopSeverity.CATASTROPHIC;
}

/**
 * Calculate flop penalties
 */
export function calculateFlopPenalties(project: Project, severity: FlopSeverity): FlopResult {
  const budget = project.budget || 1;
  const marketingBudget = (project as any).marketingBudget || 0;
  const totalCost = budget + marketingBudget;

  const config = severity !== FlopSeverity.NONE ? FLOP_PENALTY_CONFIGS[severity] : null;

  if (!config) {
    return {
      severity: FlopSeverity.NONE,
      writeOffCost: 0,
      prestigePenalty: 0,
      ipDevaluation: 0,
      shouldRestructure: false
    };
  }

  return {
    severity,
    writeOffCost: Math.floor(totalCost * config.writeOffPct),
    prestigePenalty: config.prestigePenalty,
    ipDevaluation: config.ipDevaluation,
    shouldRestructure: config.shouldRestructure
  };
}

export interface StudioFlopHistory {
  rivalId: string;
  majorFlops: number;
  catastrophicFlops: number;
  flopWeeks: number[];
}

const flopHistory: Map<string, StudioFlopHistory> = new Map();

export function shouldRestructureStudio(rivalId: string, currentWeek: number): boolean {
  const history = flopHistory.get(rivalId);
  if (!history) return false;

  const oneYearAgo = currentWeek - 52;
  const twoYearsAgo = currentWeek - 104;

  const majorFlopsLastYear = history.flopWeeks.filter(w => w >= oneYearAgo).length;
  if (majorFlopsLastYear >= 3) return true;

  const majorFlopsLastTwoYears = history.flopWeeks.filter(w => w >= twoYearsAgo).length;
  if (majorFlopsLastTwoYears >= 5) return true;

  if (history.catastrophicFlops > 0) return true;

  return false;
}

export function applyFlopPenalties(
  state: GameState,
  project: Project,
  ownerId: string
): StateImpact[] {
  const impacts: StateImpact[] = [];
  const severity = calculateFlopSeverity(project);

  if (severity === FlopSeverity.NONE) return impacts;

  const penalties = calculateFlopPenalties(project, severity);
  const isRival = state.entities.rivals[ownerId];

  if (isRival) {
    let history = flopHistory.get(ownerId);
    if (!history) {
      history = { rivalId: ownerId, majorFlops: 0, catastrophicFlops: 0, flopWeeks: [] };
      flopHistory.set(ownerId, history);
    }

    if (severity === FlopSeverity.MAJOR) {
      history.majorFlops++;
      history.flopWeeks.push(state.week);
    } else if (severity === FlopSeverity.CATASTROPHIC) {
      history.catastrophicFlops++;
      history.flopWeeks.push(state.week);
    }

    if (shouldRestructureStudio(ownerId, state.week)) {
      impacts.push({
        type: 'RIVAL_UPDATED',
        payload: {
          rivalId: ownerId,
          update: {
            strategy: 'prestige_chaser',
            recentActivity: 'Executive shakeup after series of flops'
          }
        }
      });

      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          headline: `${isRival.name} restructures after flop streak`,
          description: `After multiple failed releases, ${isRival.name} has shaken up its executive team and reset its strategy.`,
          category: 'rival' as any
        }
      });
    }
  }

  if (penalties.writeOffCost > 0) {
    if (isRival) {
      impacts.push({
        type: 'RIVAL_UPDATED',
        payload: {
          rivalId: ownerId,
          update: {
            cash: Math.max(0, isRival.cash - penalties.writeOffCost)
          }
        }
      });
    } else if (ownerId === 'PLAYER') {
      impacts.push({
        type: 'FUNDS_DEDUCTED',
        payload: {
          amount: penalties.writeOffCost
        }
      });
    }
  }

  if (penalties.prestigePenalty !== 0) {
    if (isRival) {
      impacts.push({
        type: 'RIVAL_UPDATED',
        payload: {
          rivalId: ownerId,
          update: {
            prestige: clamp(isRival.prestige + penalties.prestigePenalty, 0, 100)
          }
        }
      });
    } else if (ownerId === 'PLAYER') {
      impacts.push({
        type: 'PRESTIGE_CHANGED',
        payload: {
          amount: penalties.prestigePenalty
        }
      });
    }
  }

  if (severity === FlopSeverity.MAJOR || severity === FlopSeverity.CATASTROPHIC) {
    const ownerName = isRival ? isRival.name : state.studio.name;
    const severityText = severity === FlopSeverity.CATASTROPHIC ? 'catastrophic' : 'major';
    const costText = `$${(penalties.writeOffCost / 1_000_000).toFixed(1)}M`;

    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        headline: `${ownerName} writes off ${costText} after ${severityText} flop`,
        description: `${project.title} failed to perform, forcing ${ownerName} to take a significant write-off.`,
        category: 'general' as any
      }
    });
  }

  return impacts;
}

export function processFlops(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  const projectsMap = state.entities.projects || {};

  for (const projId in projectsMap) {
    const project = projectsMap[projId];
    if (project.state === 'released' && (project.releaseWeek || 0) === state.week && project.ownerId) {
      const flopImpacts = applyFlopPenalties(state, project, project.ownerId);
      impacts.push(...flopImpacts);
    }
  }

  return impacts;
}

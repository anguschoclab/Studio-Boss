import { GameState, Project, StateImpact, RivalStudio } from '@/engine/types';
import { generateId, clamp } from '../../utils';

/**
 * Flop Mechanics System
 * Detects financial failures and applies penalties to studios.
 * Applies to both Film and TV projects.
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
  const revenue = project.revenue || 0;
  const budget = project.budget || 1;
  
  let writeOffCost = 0;
  let prestigePenalty = 0;
  let ipDevaluation = 0;
  let shouldRestructure = false;

  switch (severity) {
    case FlopSeverity.MINOR:
      writeOffCost = Math.floor((budget - revenue) * 0.3);
      prestigePenalty = -5;
      ipDevaluation = 0.2; // 20% IP devaluation
      break;
    case FlopSeverity.MAJOR:
      writeOffCost = Math.floor((budget - revenue) * 0.5);
      prestigePenalty = -10;
      ipDevaluation = 0.4; // 40% IP devaluation
      break;
    case FlopSeverity.CATASTROPHIC:
      writeOffCost = Math.floor((budget - revenue) * 0.7);
      prestigePenalty = -20;
      ipDevaluation = 0.6; // 60% IP devaluation
      shouldRestructure = true;
      break;
  }

  return {
    severity,
    writeOffCost,
    prestigePenalty,
    ipDevaluation,
    shouldRestructure
  };
}

/**
 * Track flop history for a studio
 */
export interface StudioFlopHistory {
  rivalId: string;
  majorFlops: number;
  catastrophicFlops: number;
  flopWeeks: number[];
}

const flopHistory: Map<string, StudioFlopHistory> = new Map();

/**
 * Check if studio needs restructuring due to multiple flops
 */
export function shouldRestructureStudio(rivalId: string, currentWeek: number): boolean {
  const history = flopHistory.get(rivalId);
  if (!history) return false;

  const oneYearAgo = currentWeek - 52;
  const twoYearsAgo = currentWeek - 104;

  // 3 major flops in 1 year: executive shakeup
  const majorFlopsLastYear = history.flopWeeks.filter(w => w >= oneYearAgo).length;
  if (majorFlopsLastYear >= 3) return true;

  // 5 major flops in 2 years: bankruptcy risk
  const majorFlopsLastTwoYears = history.flopWeeks.filter(w => w >= twoYearsAgo).length;
  if (majorFlopsLastTwoYears >= 5) return true;

  // 1 catastrophic flop always triggers restructuring
  if (history.catastrophicFlops > 0) return true;

  return false;
}

/**
 * Apply flop penalties to a project
 */
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

  // Update flop history
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

    // Check for restructuring
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
          category: 'rival'
        }
      });
    }
  }

  // Deduct write-off cost from owner
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

  // Apply prestige penalty
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

  // Devalue IP asset - using INDUSTRY_UPDATE since there's no specific VAULT impact type
  if (penalties.ipDevaluation > 0) {
    const ipAsset = state.ip.vault.find(a => a.originalProjectId === project.id);
    if (ipAsset) {
      // We'll handle IP devaluation in a separate system or through INDUSTRY_UPDATE
      // For now, we'll skip this as it requires a proper vault update mechanism
    }
  }

  // Generate news for major/catastrophic flops
  if (severity === FlopSeverity.MAJOR || severity === FlopSeverity.CATASTROPHIC) {
    const ownerName = isRival ? isRival.name : state.studio.name;
    const severityText = severity === FlopSeverity.CATASTROPHIC ? 'catastrophic' : 'major';
    const costText = `$${(penalties.writeOffCost / 1_000_000).toFixed(1)}M`;

    impacts.push({
      type: 'NEWS_ADDED',
      payload: {
        headline: `${ownerName} writes off ${costText} after ${severityText} flop`,
        description: `${project.title} failed to perform, forcing ${ownerName} to take a significant write-off.`,
        category: 'general'
      }
    });
  }

  return impacts;
}

/**
 * Process all released projects for flop detection
 * Called weekly after project releases
 */
export function processFlops(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  const projects = Object.values(state.entities.projects);

  // Only process projects released in the current week
  for (const project of projects) {
    if (project.state === 'released' && (project.releaseWeek || 0) === state.week && project.ownerId) {
      const flopImpacts = applyFlopPenalties(state, project, project.ownerId);
      impacts.push(...flopImpacts);
    }
  }

  return impacts;
}

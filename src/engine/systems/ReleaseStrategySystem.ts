import { GameState, StateImpact } from '@/engine/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReleaseStrategy =
  | 'theatrical'
  | 'streaming'
  | 'platform_exclusive'
  | 'limited_prestige';

export interface ReleaseStrategyEffect {
  revenueMultiplier: number;
  prestigeBonus: number;
  buzzBonus: number;
  platformBias: 'theatrical' | 'streaming' | 'platform';
  description: string;
}

// ─── Strategy definitions ─────────────────────────────────────────────────────

const STRATEGY_DEFS: Record<
  ReleaseStrategy,
  {
    name: string;
    baseMultiplier: number;
    prestigeBonus: number;
    buzzBonus: number;
    platformBias: ReleaseStrategyEffect['platformBias'];
    description: string;
  }
> = {
  theatrical: {
    name: 'Theatrical Release',
    baseMultiplier: 1.0,
    prestigeBonus: 5,
    buzzBonus: 10,
    platformBias: 'theatrical',
    description:
      'Maximum upside via wide theatrical release. Requires strong marketing spend — low budgets face a 30% revenue penalty.',
  },
  streaming: {
    name: 'Streaming Deal',
    baseMultiplier: 0.7,
    prestigeBonus: 3,
    buzzBonus: 5,
    platformBias: 'streaming',
    description:
      'Guaranteed income with no box office risk. Prestige dramas earn a bonus on streaming platforms.',
  },
  platform_exclusive: {
    name: 'Platform Exclusive',
    baseMultiplier: 0.85,
    prestigeBonus: 2,
    buzzBonus: 8,
    platformBias: 'platform',
    description:
      'Secure a $5M platform fee upfront and bypass theatrical competition — but ties your buyer relationships.',
  },
  limited_prestige: {
    name: 'Limited Prestige Run',
    baseMultiplier: 0.6,
    prestigeBonus: 30,
    buzzBonus: 15,
    platformBias: 'theatrical',
    description:
      '500-screen limited run. Lower revenue ceiling but maximum prestige — the awards-season play.',
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Called weekly by WeekCoordinator.
 * Finds projects in 'marketing' with no release strategy set and emits
 * MODAL_TRIGGERED impacts so the player can make a decision.
 */
export function tickReleaseStrategy(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];

  // ⚡ The Framerate Fanatic: Replaced Object.values() with a direct for...in loop
  // to avoid O(N) array allocation overhead every tick for high-frequency state records.
  for (const projectId in state.entities.projects) {
    const project = state.entities.projects[projectId];
    if (
      project.state === 'marketing' &&
      !(project as Project & { releaseStrategy?: string }).releaseStrategy
    ) {
      impacts.push({
        type: 'MODAL_TRIGGERED' as unknown as StateImpact['type'],
        payload: {
          modalType: 'RELEASE_STRATEGY',
          priority: 90,
          payload: { projectId: project.id, projectTitle: project.title },
        },
      });
    }
  }

  return impacts;
}

/**
 * Returns the mechanical effects of a chosen strategy for the given project.
 * Applies conditional modifiers (low marketing budget penalty, prestige drama bonus, etc.)
 */
export function getReleaseStrategyEffect(
  strategy: ReleaseStrategy,
  project: Project
): ReleaseStrategyEffect {
  const def = STRATEGY_DEFS[strategy];
  let revenueMultiplier = def.baseMultiplier;
  let prestigeBonus = def.prestigeBonus;

  // Theatrical: penalise projects with a low marketing budget
  if (strategy === 'theatrical') {
    const marketingBudget: number = project.marketingBudget ?? 0;
    if (marketingBudget < 5_000_000) {
      revenueMultiplier *= 0.7; // -30%
    }
  }

  // Streaming: bonus for prestige dramas
  if (strategy === 'streaming') {
    const genre: string = (project.genre ?? '').toUpperCase();
    const tvFormat: string = (project.tvFormat ?? '').toLowerCase();
    const isPrestigeDrama =
      genre.includes('DRAMA') ||
      tvFormat === 'prestige_drama' ||
      tvFormat === 'prestige_limited_series';
    if (isPrestigeDrama) {
      revenueMultiplier += 0.1;
      prestigeBonus += 5;
    }
  }

  return {
    revenueMultiplier,
    prestigeBonus,
    buzzBonus: def.buzzBonus,
    platformBias: def.platformBias,
    description: def.description,
  };
}

/**
 * Player action: apply a chosen strategy to a project.
 * Returns StateImpact[] containing the project update plus any immediate cash/prestige effects.
 */
export function applyReleaseStrategy(
  state: GameState,
  projectId: string,
  strategy: ReleaseStrategy
): StateImpact[] {
  const impacts: StateImpact[] = [];

  const project = state.entities.projects[projectId];
  if (!project) return impacts;

  const effect = getReleaseStrategyEffect(strategy, project);

  // Base project update – record chosen strategy + derived multiplier
  impacts.push({
    type: 'PROJECT_UPDATED',
    payload: {
      projectId,
      update: {
        releaseStrategy: strategy,
        // Store the revenue multiplier on the project so the release system can read it
        releaseStrategyMultiplier: effect.revenueMultiplier,
      } as unknown as Partial<Project>,
    },
  });

  // Platform exclusive: immediate $5M platform fee
  if (strategy === 'platform_exclusive') {
    impacts.push({
      type: 'FUNDS_CHANGED',
      payload: { amount: 5_000_000 },
    });
  }

  // Limited prestige: immediate prestige grant
  if (strategy === 'limited_prestige') {
    impacts.push({
      type: 'PRESTIGE_CHANGED',
      payload: { amount: effect.prestigeBonus },
    });
  }

  return impacts;
}

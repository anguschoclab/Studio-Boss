import { GameState, Talent, Project } from '../../../types';
import { RandomGenerator } from '../../../utils/rng';
import {
  BreakoutStar,
  BreakoutTrigger,
} from '../../../types/discovery.types';

// Base breakout chances
const INDIE_HIT_CHANCE = 0.05;
const VIRAL_SCENE_CHANCE = 0.08;
const CAMEO_STEAL_CHANCE = 0.03;
const TV_PERFORMANCE_CHANCE = 0.06;

export function checkForBreakout(
  talent: Talent,
  project: Project,
  state: GameState,
  rng: RandomGenerator
): BreakoutStar | null {
  // Skip if already a breakout or top tier
  if ((talent as any).isBreakout) return null;
  if (talent.tier === 1) return null;

  const currentStarMeter = talent.starMeter || 50;

  // Indie film breakout
  if (project.type === 'FILM' && project.budget < 5000000 && rng.next() < INDIE_HIT_CHANCE) {
    const starMeterJump = rng.rangeInt(25, 45);
    return createBreakoutStar(talent, project, 'indie_hit', starMeterJump, state.week, rng);
  }

  // Viral scene breakout
  if (rng.next() < VIRAL_SCENE_CHANCE && currentStarMeter < 70) {
    const starMeterJump = rng.rangeInt(20, 35);
    return createBreakoutStar(talent, project, 'viral_scene', starMeterJump, state.week, rng);
  }

  // Cameo steal breakout (small role, big impact)
  if (project.type === 'FILM' && rng.next() < CAMEO_STEAL_CHANCE) {
    const starMeterJump = rng.rangeInt(15, 30);
    return createBreakoutStar(talent, project, 'cameo_steal', starMeterJump, state.week, rng);
  }

  // TV performance breakout
  if (project.type === 'SERIES' && rng.next() < TV_PERFORMANCE_CHANCE) {
    const starMeterJump = rng.rangeInt(15, 25);
    return createBreakoutStar(talent, project, 'tv_performance', starMeterJump, state.week, rng);
  }

  return null;
}

function createBreakoutStar(
  talent: Talent,
  project: Project,
  trigger: BreakoutTrigger,
  starMeterJump: number,
  week: number,
  rng: RandomGenerator
): BreakoutStar {
  const previousStarMeter = talent.starMeter || 50;
  const newStarMeter = Math.min(100, previousStarMeter + starMeterJump);

  // Calculate new tier based on star meter
  let newTier = talent.tier;
  if (newStarMeter > 80) newTier = 1;
  else if (newStarMeter > 60) newTier = 2;
  else if (newStarMeter > 40) newTier = 3;

  // Fee multiplier based on jump size
  const feeMultiplier = 1 + (starMeterJump / 20);

  // Hype duration (longer for bigger jumps)
  const hypeWeeksRemaining = rng.rangeInt(12, 52);

  // 70% chance of sustained success (not one-hit-wonder)
  const sustainedSuccess = rng.next() < 0.7;
  const oneHitWonder = !sustainedSuccess;

  return {
    id: rng.uuid('BRK'),
    talentId: talent.id,
    trigger,
    projectId: project.id,
    week,
    previousStarMeter,
    previousTier: talent.tier,
    starMeterJump,
    newTier,
    feeMultiplier,
    hypeWeeksRemaining,
    biddingWarActive: true,
    sustainedSuccess,
    oneHitWonder,
  };
}

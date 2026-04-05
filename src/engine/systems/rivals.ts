import { pick } from '../utils';
import { RivalStudio, GameState, Talent, NewsEvent } from '@/engine/types';
import { StateImpact, RivalUpdate } from '../types/state.types';
import { RandomGenerator } from '../utils/rng';

const INDIE_ACTIVITIES = [
  'Quietly developing a prestige drama slate',
  'Launched an ambitious awards campaign',
  'Prepping a major film festival submission',
  'Scouting new arthouse auteur directors'
];

const MAJOR_ACTIVITIES = [
  'Aggressively acquiring IP rights',
  'Riding high on a recent blockbuster success',
  'Doubling down on franchise expansion',
  'Courting A-list talent with lucrative deals',
  'Pivoting strategy after executive shakeup'
];

const MID_ACTIVITIES = [
  'Expanding into international co-productions',
  'Focusing on streaming-first genre releases',
  'Restructuring after a box office disappointment',
  'Betting heavily on a buzzy spec script'
];

export function rivalPoachTalent(rng: RandomGenerator, rival: RivalStudio, talentPool: Talent[]): string | null {
  if (rival.strategy === 'acquirer' || rival.cash > 100_000_000) {
    if (rng.next() < 0.05) {
      // Find a highly prestigious talent
      const stars = talentPool.filter(t => t.prestige > 80);
      if (stars.length > 0) {
        const star = pick(stars, rng);
        return `${rival.name} just poached ${star.name} with a massive overall deal!`;
      }
    }
  }
  return null;
}

export function updateRival(rng: RandomGenerator, rival: RivalStudio): Partial<RivalStudio> {
  const update: Partial<RivalStudio> = {};
  
  // Natural fluctuation
  update.strength = Math.max(20, Math.min(100, rival.strength + (rng.next() * 6 - 3)));
  
  // Strategy driven behavior
  if (rival.archetype === 'major') {
    update.cash = rival.cash + (rng.next() * 40_000_000 - 10_000_000);
    if (rng.next() < 0.25) update.recentActivity = pick(MAJOR_ACTIVITIES, rng);
    update.projectCount = Math.max(2, rival.projectCount + (rng.next() < 0.6 ? 1 : 0));
    update.strategy = 'acquirer';
  } else if (rival.archetype === 'indie') {
    update.cash = rival.cash + (rng.next() * 10_000_000 - 4_000_000);
    if (rng.next() < 0.25) update.recentActivity = pick(INDIE_ACTIVITIES, rng);
    if (rng.next() < 0.1) update.projectCount = Math.max(1, rival.projectCount + 1);
    update.strategy = 'prestige_chaser';
  } else {
    // mid-tier
    update.cash = rival.cash + (rng.next() * 20_000_000 - 5_000_000);
    if (rng.next() < 0.25) update.recentActivity = pick(MID_ACTIVITIES, rng);
    if (rng.next() < 0.2) update.projectCount = Math.max(1, rival.projectCount + 1);
    update.strategy = 'genre_specialist';
  }
  
  // Check for M&A vulnerability
  const finalCash = update.cash !== undefined ? update.cash : rival.cash;
  const finalStrength = update.strength !== undefined ? update.strength : rival.strength;
  
  if (finalCash < 0 && finalStrength < 40) {
    update.isAcquirable = true;
    update.recentActivity = 'Actively seeking a buyer amid cash crunch.';
  } else {
    update.isAcquirable = false;
  }
  
  return update;
}

export function advanceRivals(rng: RandomGenerator, state: GameState): StateImpact {
  const rivalUpdates: RivalUpdate[] = [];
  const newsEvents: NewsEvent[] = [];
  
  for (let i = 0; i < state.industry.rivals.length; i++) {
    const rival = state.industry.rivals[i];
    const update = updateRival(rng, rival);
    
    rivalUpdates.push({
      rivalId: rival.id,
      update
    });
    
    // Log major rival events
    if (update.isAcquirable && !rival.isAcquirable) {
      newsEvents.push({
        id: rng.uuid('news'),
        week: state.week,
        type: 'RIVAL',
        headline: `${rival.name} Vulnerable to Takeover!`,
        description: `${rival.name} has hit a critical cash shortage. Strategy: ${update.recentActivity || rival.recentActivity}`,
        impact: 'Available for acquisition'
      });
    }
  }

  // Talent Poaching News
  const talentPoolArr = [];
  for (const id in state.industry.talentPool) {
    talentPoolArr.push(state.industry.talentPool[id]);
  }

  for (const rival of state.industry.rivals) {
     const poakMsg = rivalPoachTalent(rng, rival, talentPoolArr);
     if (poakMsg) {
       newsEvents.push({
         id: rng.uuid('news'),
         week: state.week,
         type: 'RIVAL',
         headline: `Talent Poached by ${rival.name}`,
         description: poakMsg,
         impact: 'Pool updated'
       });
     }
  }

  return {
    rivalUpdates,
    newsEvents
  };
}


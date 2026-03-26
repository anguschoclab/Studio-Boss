import { RivalStudio, GameState, TalentProfile } from '@/engine/types';
import { pick, clamp } from '../utils';

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

export function rivalPoachTalent(rival: RivalStudio, talentPool: TalentProfile[]): string | null {
  if (rival.strategy === 'acquirer' || rival.cash > 100_000_000) {
    if (Math.random() < 0.05) {
      // Find a highly prestigious talent
      const stars = talentPool.filter(t => t.prestige > 80);
      if (stars.length > 0) {
        const star = pick(stars);
        return `${rival.name} just poached ${star.name} with a massive overall deal!`;
      }
    }
  }
  return null;
}

export function updateRival(rival: RivalStudio, state?: GameState): RivalStudio {
  const r = { ...rival };
  
  // Natural fluctuation
  r.strength = clamp(r.strength + (Math.random() * 6 - 3), 20, 100);
  
  // Strategy driven behavior
  if (r.archetype === 'major') {
    r.cash += (Math.random() * 40_000_000 - 10_000_000); // Higher variance, more revenue
    if (Math.random() < 0.25) r.recentActivity = pick(MAJOR_ACTIVITIES);
    r.projectCount = Math.max(2, r.projectCount + (Math.random() < 0.6 ? 1 : 0));
    r.strategy = 'acquirer';
  } else if (r.archetype === 'indie') {
    r.cash += (Math.random() * 10_000_000 - 4_000_000); // Lower variance, steady
    if (Math.random() < 0.25) r.recentActivity = pick(INDIE_ACTIVITIES);
    if (Math.random() < 0.1) r.projectCount = Math.max(1, r.projectCount + 1);
    r.strategy = 'prestige_chaser';
  } else {
    // mid-tier
    r.cash += (Math.random() * 20_000_000 - 5_000_000);
    if (Math.random() < 0.25) r.recentActivity = pick(MID_ACTIVITIES);
    if (Math.random() < 0.2) r.projectCount = Math.max(1, r.projectCount + 1);
    r.strategy = 'genre_specialist';
  }
  
  // Check for M&A vulnerability
  if (r.cash < 0 && r.strength < 40) {
    r.isAcquirable = true;
    r.recentActivity = 'Actively seeking a buyer amid cash crunch.';
  } else {
    r.isAcquirable = false;
  }
  
  return r;
}

export interface RivalAdvanceResult {
  updatedRivals: RivalStudio[];
  newsEvents: Omit<import('../types').NewsEvent, 'id' | 'week'>[];
}

export function advanceRivals(
  state: GameState
): RivalAdvanceResult {
  const updatedRivals: RivalStudio[] = [];
  const newsEvents: Omit<import('../types').NewsEvent, 'id' | 'week'>[] = [];
  
  for (let i = 0; i < state.industry.rivals.length; i++) {
    const r = updateRival(state.industry.rivals[i], state);
    updatedRivals.push(r);
    
    // Log major rival events
    if (r.isAcquirable && !state.industry.rivals[i].isAcquirable) {
      newsEvents.push({
        type: 'RIVAL',
        headline: `${r.name} Vulnerable to Takeover!`,
        description: `${r.name} has hit a critical cash shortage. Strategy: ${r.recentActivity}`,
        impact: 'Available for acquisition'
      });
    }
  }

  // Talent Poaching News
  for (const rival of state.industry.rivals) {
     const poakMsg = rivalPoachTalent(rival, state.industry.talentPool);
     if (poakMsg) {
       newsEvents.push({
         type: 'RIVAL',
         headline: `Talent Poached by ${rival.name}`,
         description: poakMsg,
         impact: 'Pool updated'
       });
     }
  }

  return {
    updatedRivals,
    newsEvents
  };
}

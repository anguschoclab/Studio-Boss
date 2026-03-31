import { RivalStudio, GameState, Talent } from '@/engine/types';
type TalentProfile = Talent;
import { StateImpact } from '../types/state.types';
import { clamp, pick, secureRandom } from '../utils';

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
    if (secureRandom() < 0.05) {
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

export function updateRival(rival: RivalStudio): Partial<RivalStudio> {
  const update: Partial<RivalStudio> = {};
  
  // Natural fluctuation
  update.strength = clamp(rival.strength + (secureRandom() * 6 - 3), 20, 100);
  
  // Strategy driven behavior
  if (rival.archetype === 'major') {
    update.cash = rival.cash + (secureRandom() * 40_000_000 - 10_000_000); 
    if (secureRandom() < 0.25) update.recentActivity = pick(MAJOR_ACTIVITIES);
    update.projectCount = Math.max(2, rival.projectCount + (secureRandom() < 0.6 ? 1 : 0));
    update.strategy = 'acquirer';
  } else if (rival.archetype === 'indie') {
    update.cash = rival.cash + (secureRandom() * 10_000_000 - 4_000_000);
    if (secureRandom() < 0.25) update.recentActivity = pick(INDIE_ACTIVITIES);
    if (secureRandom() < 0.1) update.projectCount = Math.max(1, rival.projectCount + 1);
    update.strategy = 'prestige_chaser';
  } else {
    // mid-tier
    update.cash = rival.cash + (secureRandom() * 20_000_000 - 5_000_000);
    if (secureRandom() < 0.25) update.recentActivity = pick(MID_ACTIVITIES);
    if (secureRandom() < 0.2) update.projectCount = Math.max(1, rival.projectCount + 1);
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

export function advanceRivals(state: GameState): StateImpact {
  const impact: StateImpact = {
    rivalUpdates: [],
    newsEvents: []
  };
  
  for (let i = 0; i < state.industry.rivals.length; i++) {
    const rival = state.industry.rivals[i];
    const update = updateRival(rival);
    
    impact.rivalUpdates!.push({
      rivalId: rival.id,
      update
    });
    
    // Log major rival events
    if (update.isAcquirable && !rival.isAcquirable) {
      impact.newsEvents!.push({
        type: 'RIVAL',
        headline: `${rival.name} Vulnerable to Takeover!`,
        description: `${rival.name} has hit a critical cash shortage. Strategy: ${update.recentActivity || rival.recentActivity}`,
        impact: 'Available for acquisition'
      });
    }
  }

  // Talent Poaching News
  for (const rival of state.industry.rivals) {
     const poakMsg = rivalPoachTalent(rival, Object.values(state.industry.talentPool));
     if (poakMsg) {
       impact.newsEvents!.push({
         type: 'RIVAL',
         headline: `Talent Poached by ${rival.name}`,
         description: poakMsg,
         impact: 'Pool updated'
       });
     }
  }

  return impact;
}


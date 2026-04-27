import { RivalStudio, GameState, Talent, NewsEvent } from '@/engine/types';
type TalentProfile = Talent;
import { StateImpact, RivalUpdate } from '../types/state.types';
import { clamp, pick, rand, generateId } from '../utils';

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
    if (rand() < 0.05) {
      // Find a highly prestigious talent
      const stars = talentPool.filter(t => t.prestige > 80);
      if (stars.length > 0) {
        const star = pick(stars);

        // Add personality based on archetype
        const personalityPrefix = rival.archetype === 'major'
          ? 'Deep-pocketed'
          : rival.archetype === 'indie'
          ? 'Prestige-focused'
          : 'Strategic';

        return `${personalityPrefix} ${rival.name} just poached ${star.name} with a massive overall deal!`;
      }
    }
  }
  return null;
}

export function updateRival(rival: RivalStudio): Partial<RivalStudio> {
  const update: Partial<RivalStudio> = {};
  
  // Natural fluctuation
  update.strength = clamp(rival.strength + (rand() * 6 - 3), 20, 100);
  
  // Strategy driven behavior
  if (rival.archetype === 'major') {
    update.cash = rival.cash + (rand() * 40_000_000 - 10_000_000); 
    if (rand() < 0.25) update.recentActivity = pick(MAJOR_ACTIVITIES);
    update.projectCount = Math.max(2, rival.projectCount + (rand() < 0.6 ? 1 : 0));
    update.strategy = 'acquirer';
  } else if (rival.archetype === 'indie') {
    update.cash = rival.cash + (rand() * 10_000_000 - 4_000_000);
    if (rand() < 0.25) update.recentActivity = pick(INDIE_ACTIVITIES);
    if (rand() < 0.1) update.projectCount = Math.max(1, rival.projectCount + 1);
    update.strategy = 'prestige_chaser';
  } else {
    // mid-tier
    update.cash = rival.cash + (rand() * 20_000_000 - 5_000_000);
    if (rand() < 0.25) update.recentActivity = pick(MID_ACTIVITIES);
    if (rand() < 0.2) update.projectCount = Math.max(1, rival.projectCount + 1);
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
  const rivalUpdates: RivalUpdate[] = [];
  const newsEvents: NewsEvent[] = [];
<<<<<<< Updated upstream
  const uiNotifications: string[] = [];
=======
>>>>>>> Stashed changes
  const ALL_RIVALS = Object.values(state.entities.rivals);
  
  for (const rival of ALL_RIVALS) {
    const update = updateRival(rival);
    
    rivalUpdates.push({
      rivalId: rival.id,
      update
    });
    
    // Log major rival events
    if (update.isAcquirable && !rival.isAcquirable) {
      const archetypeContext = rival.archetype === 'major'
        ? 'Once-mighty'
        : rival.archetype === 'indie'
        ? 'Critically-acclaimed'
        : 'Mid-tier';

      newsEvents.push({
        id: generateId('NWS'),
        week: state.week,
        type: 'RIVAL',
        headline: `${archetypeContext} ${rival.name} Vulnerable to Takeover!`,
        description: `${rival.name} has hit a critical cash shortage. Strategy: ${update.recentActivity || rival.recentActivity}`,
        impact: 'Available for acquisition'
      });

      // Add to narrative events for weekly summary
      uiNotifications.push(`RIVAL: ${archetypeContext} ${rival.name} is vulnerable to takeover due to cash crunch`);
    }
  }

  // Talent Poaching News
  for (const rival of ALL_RIVALS) {
     const poakMsg = rivalPoachTalent(rival, Object.values(state.entities.talents));
     if (poakMsg) {
       newsEvents.push({
         id: generateId('NWS'),
         week: state.week,
         type: 'RIVAL',
         headline: `Talent Poached by ${rival.name}`,
         description: poakMsg,
         impact: 'Pool updated'
       });

       // Add to narrative events for weekly summary
       uiNotifications.push(`RIVAL: ${poakMsg}`);
     }
  }

  return {
    rivalUpdates,
    newsEvents,
    uiNotifications
  };
}

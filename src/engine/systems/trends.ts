import { GenreTrend, GameState } from '../types';

export const ALL_GENRES = [
  'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Animation', 'Documentary', 'Fantasy'
];

export function initializeTrends(): GenreTrend[] {
  // Pick 3 random genres to be the starting trends
  const shuffled = [...ALL_GENRES].sort(() => 0.5 - Math.random());
  return [
    {
      genre: shuffled[0],
      heat: 80,
      direction: 'rising',
      weeksRemaining: 12
    },
    {
      genre: shuffled[1],
      heat: 50,
      direction: 'stable',
      weeksRemaining: 24
    },
    {
      genre: shuffled[2],
      heat: 20,
      direction: 'cooling',
      weeksRemaining: 6
    }
  ];
}

export function advanceTrends(trends: GenreTrend[]): GenreTrend[] {
  let updated = trends.map(t => {
    let newHeat = t.heat;
    if (t.direction === 'rising') newHeat = Math.min(100, newHeat + 5);
    if (t.direction === 'cooling') newHeat = Math.max(0, newHeat - 5);
    
    // Change direction if maxed out or cooled out
    let newDirection = t.direction;
    if (newHeat >= 100) newDirection = 'stable';
    if (newHeat <= 0) newDirection = 'dead';
    
    return {
      ...t,
      heat: newHeat,
      direction: newDirection,
      weeksRemaining: t.weeksRemaining - 1
    };
  });
  
  // Remove dead trends or those out of time
  updated = updated.filter(t => t.weeksRemaining > 0 && t.heat > 0);
  
  // Randomly spawn new trends if we are low
  if (updated.length < 5 && Math.random() < 0.1) {
    const activeGenres = new Set(updated.map(t => t.genre));
    const available = ALL_GENRES.filter(g => !activeGenres.has(g));
    if (available.length > 0) {
      const newGenre = available[Math.floor(Math.random() * available.length)];
      updated.push({
        genre: newGenre,
        heat: 30,
        direction: 'rising',
        weeksRemaining: 16 + Math.floor(Math.random() * 12)
      });
    }
  }
  
  return updated;
}

export function getTrendMultiplier(genre: string, state: GameState): number {
  if (!state.trends) return 1.0;
  const trend = state.trends.find(t => t.genre === genre);
  if (!trend) return 1.0;
  
  // Heat of 100 means +50% box office. Heat of 0 means -20% box office.
  return 0.8 + ((trend.heat / 100) * 0.7);
}

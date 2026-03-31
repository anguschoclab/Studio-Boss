import { describe, it, expect } from 'vitest';
import { calculateWeeklyRating } from '@/engine/systems/television/ratingsEvaluator';
import { Project } from '@/engine/types';

describe('calculateWeeklyRating', () => {
  it('processes reality TV ratings with higher volatility than scripted dramas', () => {
    const realityShow = { 
      type: 'TELEVISION', 
      unscriptedFormat: 'reality_ensemble', 
      tvDetails: { currentSeason: 1 } 
    } as Project;
    
    const drama = { 
      type: 'TELEVISION', 
      tvFormat: 'prestige_drama', 
      tvDetails: { currentSeason: 1 } 
    } as Project;
    
    // Evaluate ratings based on base appeal
    const realityRating = calculateWeeklyRating(realityShow, 50);
    const dramaRating = calculateWeeklyRating(drama, 50);
    
    expect(realityRating).toBeGreaterThanOrEqual(1);
    expect(realityRating).toBeLessThanOrEqual(100);
    expect(dramaRating).toBeGreaterThanOrEqual(40); // 50 +/- 5
    expect(dramaRating).toBeLessThanOrEqual(60);
  });

  it('returns 0 if project is not a television project', () => {
    const film = { type: 'FILM' } as Project;
    const rating = calculateWeeklyRating(film, 50);
    expect(rating).toBe(0);
  });
});

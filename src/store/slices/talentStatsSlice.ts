import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';

export interface TalentStatsSlice {
  getTalentFilmography: (talentId: string) => import('@/engine/types/talent.types').Talent['filmography'];
  getTalentCareerStats: (talentId: string) => { 
    careerGross: number; 
    highestSalaryMovie?: import('@/engine/types/talent.types').Talent['highestSalaryMovie']; 
    highestSalaryTv?: import('@/engine/types/talent.types').Talent['highestSalaryTv']; 
    starMeter: number; 
  } | null;
  calculateStarMeter: (talentId: string) => number;
}

export const createTalentStatsSlice: StateCreator<GameStore, [], [], TalentStatsSlice> = (set, get) => ({
  getTalentFilmography: (talentId) => {
    const s = get();
    if (!s.gameState) return [] as import('@/engine/types/talent.types').Talent['filmography'];
    const talent = s.gameState.entities.talents[talentId];
    return (talent?.filmography || []) as import('@/engine/types/talent.types').Talent['filmography'];
  },

  getTalentCareerStats: (talentId) => {
    const s = get();
    if (!s.gameState) return null;
    const talent = s.gameState.entities.talents[talentId];
    if (!talent) return null;
    
    return {
      careerGross: talent.careerGross || 0,
      highestSalaryMovie: talent.highestSalaryMovie,
      highestSalaryTv: talent.highestSalaryTv,
      starMeter: talent.starMeter || 50
    };
  },

  calculateStarMeter: (talentId) => {
    const s = get();
    if (!s.gameState) return 50;
    const talent = s.gameState.entities.talents[talentId];
    if (!talent) return 50;

    const filmography = talent.filmography || [];
    const recentProjects = filmography.slice(0, 3);
    const momentum = recentProjects.length > 0
      ? recentProjects.reduce((sum: number, p: any) => sum + (p.gross > 50000000 ? 100 : 50), 0) / recentProjects.length
      : 50;

    return Math.floor((talent.prestige * 0.4) + (talent.draw * 0.4) + (momentum * 0.2));
  }
});

import { Project, CriticConsensus, Review } from '../types/project.types';
import { Talent } from '../types/talent.types';
import { RandomGenerator } from '../utils/rng';
import { clamp } from '../utils';
import { BardResolver } from './bardResolver';

export const ReviewSystem = {
  /**
   * Generates scores at the exact moment a project shifts to the Released state.
   */
  generateReception(project: Project, attachedTalent: Talent[], rng: RandomGenerator): CriticConsensus {
    const metaScore = this.calculateMetaScore(project, attachedTalent, rng);
    const audienceScore = this.calculateAudienceScore(project, metaScore, rng);
    
    const reviews = this.generatePlaceholderReviews(metaScore, rng, project.title);
    const status = this.getStatus(metaScore);
    const isCultPotential = this.checkCultPotential(project, metaScore, audienceScore);

    return {
      metaScore,
      audienceScore,
      reviews,
      status,
      isCultPotential
    };
  },

  calculateMetaScore(project: Project, talent: Talent[], rng: RandomGenerator): number {
    // Base: project.quality (using momentum or a derived quality metric if available, 
    // but the spec says project.quality. Looking at types, project has 'momentum').
    // Let's assume project.quality exists or use momentum as proxy.
    // Wait, project.types.ts doesn't have 'quality' but 'momentum'. 
    // I will use (project as any).quality || project.momentum || 50 as base.
    const baseQuality = (project as any).quality || project.momentum || 50;
    let score = baseQuality;

    // Director Modifier: Find the director in the talent array. Add (director.prestige - 50) / 5 to the base score.
    const director = talent.find(t => t.roles.includes('director') || t.role === 'director');
    if (director) {
      score += (director.prestige - 50) / 5;
    }

    // Indie Bias: If project.budgetTier === 'Indie', apply a flat +5 bonus.
    // Note: BudgetTierKey is 'low' | 'mid' | 'high' | 'blockbuster'. 
    // I'll check for 'indie' or 'low'.
    if (project.budgetTier === 'indie' || project.budgetTier === 'low') {
      score += 5;
    }

    // Variance: Apply rng.range(-8, 8). Clamp final score between 0 and 100.
    score += rng.range(-8, 8);
    
    return clamp(Math.round(score), 0, 100);
  },

  calculateAudienceScore(project: Project, metaScore: number, rng: RandomGenerator): number {
    // Formula: (metaScore * 0.6) + ((project.marketingBuzz / 2) * 0.4) + rng.range(-15, 15). Clamp to 0-100.
    const marketingBuzz = project.buzz || 0;
    const score = (metaScore * 0.6) + ((marketingBuzz / 2) * 0.4) + rng.range(-15, 15);
    
    return clamp(Math.round(score), 0, 100);
  },

  checkCultPotential(project: Project, metaScore: number, audienceScore: number): boolean {
    // Return true IF: Box office revenue < 80% of budget AND audienceScore > metaScore + 30 AND genre includes 'Sci-Fi' or 'Horror'.
    const revenue = project.revenue || 0;
    const budget = project.budget || 1;
    const genre = (project.genre || '').toLowerCase();
    
    const isGenreMatch = genre.includes('sci-fi') || genre.includes('horror');
    const isFinancialFailure = revenue < (budget * 0.8);
    const isAudienceDisparity = audienceScore > (metaScore + 30);

    return isFinancialFailure && isAudienceDisparity && isGenreMatch;
  },

  getStatus(score: number): 'Acclaimed' | 'Mixed' | 'Panned' {
    if (score >= 75) return 'Acclaimed';
    if (score >= 40) return 'Mixed';
    return 'Panned';
  },

  generatePlaceholderReviews(score: number, rng: RandomGenerator, projectTitle: string): Review[] {
    const critics = ['Variety', 'The Hollywood Reporter', 'IndieWire', 'Rolling Stone', 'Empire'];
    const reviews: Review[] = [];
    
    critics.forEach(name => {
      const s = clamp(score + rng.range(-10, 10), 0, 100);
      reviews.push({
        criticName: name,
        score: s,
        text: BardResolver.resolve({
          domain: 'Review',
          subDomain: 'Critic',
          intensity: s,
          context: { project: projectTitle }
        })
      });
    });
    
    return reviews;
  }
};

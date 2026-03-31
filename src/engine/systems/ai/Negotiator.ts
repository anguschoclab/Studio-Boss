import { TalentProfile, Project, Contract, MotivationProfile } from '@/engine/types';
import { clamp, randRange } from '../../utils';

export interface DealOffer {
  fee: number;
  backendPercent: number;
  creativeControl?: boolean;
}

export class Negotiator {
  /**
   * Calculates the "Desire Score" (0-100) for a talent regarding a specific project offer.
   */
  static calculateTalentDesire(talent: TalentProfile, project: Project, offer: DealOffer): number {
    const profile = talent.motivationProfile || { financial: 50, prestige: 50, legacy: 50, aggression: 50 };
    let score = 50;

    // 1. Financial Motivation
    const feeRatio = offer.fee / Math.max(1, talent.fee);
    const financialScore = clamp(feeRatio * 50 + (offer.backendPercent * 2), 0, 100);
    score += (financialScore - 50) * (profile.financial / 100);

    // 2. Prestige Motivation
    // Talent with high prestige motivation cares about director prestige and project genre
    const isPrestigeGenre = ['Drama', 'Indie', 'Documentary'].includes(project.genre);
    const prestigeScore = isPrestigeGenre ? 80 : 30;
    score += (prestigeScore - 50) * (profile.prestige / 100);

    // 3. Legacy/Artistry Motivation
    if (offer.creativeControl) {
      score += 20 * (profile.legacy / 100);
    }

    // 4. Momentum/Star Meter Bonus
    // If talent's star meter is low, they might be more desperate or seeking "Fame Seeker" roles
    if (talent.starMeter && talent.starMeter < 40 && project.budgetTier === 'blockbuster') {
        score += 15;
    }

    return clamp(score, 0, 100);
  }

  /**
   * Final decision for an offer.
   */
  static evaluateOffer(talent: TalentProfile, project: Project, offer: DealOffer): { accepted: boolean; counterOffer?: DealOffer; reason: string } {
    const desire = this.calculateTalentDesire(talent, project, offer);
    const threshold = 60 + randRange(-10, 10);

    if (desire >= threshold) {
      return { accepted: true, reason: 'The project aligns perfectly with my current career goals.' };
    }

    if (desire > threshold - 20) {
      // Counter offer logic
      const counterFee = Math.round(offer.fee * 1.2);
      return { 
        accepted: false, 
        counterOffer: { ...offer, fee: counterFee },
        reason: 'I like the project, but we need to see a more serious financial commitment.' 
      };
    }

    return { accepted: false, reason: 'This project is not the right move for me at this time.' };
  }
}

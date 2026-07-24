import type {
  HeadlineCategory,
  Project,
  Talent,
  RivalStudio,
  Buyer,
  Franchise,
  Award,
} from '@/engine/types';
import type {
  NewsImpact,
  FundsImpact,
  FundsDeductedImpact,
  ProjectUpdateImpact,
  TalentUpdateImpact,
  PrestigeChangedImpact,
  BuyerUpdateImpact,
  RivalUpdateImpact,
  IndustryUpdateImpact,
  ModalTriggeredImpact,
  FranchiseUpdatedImpact,
  AwardWonImpact,
} from '@/engine/types/state.types';

/**
 * Typed impact constructor functions.
 *
 * Replaces `as any` / `as unknown as StateImpact` casts at call sites
 * with factory functions that produce correctly-typed impacts.
 */
export const impacts = {
  newsAdded(payload: {
    id?: string;
    headline: string;
    description?: string;
    category?: HeadlineCategory;
    publication?: string;
  }): NewsImpact {
    return { type: 'NEWS_ADDED', payload };
  },

  fundsChanged(amount: number): FundsImpact {
    return { type: 'FUNDS_CHANGED', payload: { amount } };
  },

  fundsDeducted(amount: number): FundsDeductedImpact {
    return { type: 'FUNDS_DEDUCTED', payload: { amount } };
  },

  projectUpdated(projectId: string, update: Partial<Project>): ProjectUpdateImpact {
    return { type: 'PROJECT_UPDATED', payload: { projectId, update } };
  },

  talentUpdated(talentId: string, update: Partial<Talent>): TalentUpdateImpact {
    return { type: 'TALENT_UPDATED', payload: { talentId, update } };
  },

  prestigeChanged(amount: number): PrestigeChangedImpact {
    return { type: 'PRESTIGE_CHANGED', payload: { amount } };
  },

  buyerUpdated(buyerId: string, update: Partial<Buyer>): BuyerUpdateImpact {
    return { type: 'BUYER_UPDATED', payload: { buyerId, update } };
  },

  rivalUpdated(rivalId: string, update: Partial<RivalStudio>): RivalUpdateImpact {
    return { type: 'RIVAL_UPDATED', payload: { rivalId, update } };
  },

  franchiseUpdated(
    franchiseId: string,
    update: Partial<Franchise>,
  ): FranchiseUpdatedImpact {
    return { type: 'FRANCHISE_UPDATED', payload: { franchiseId, update } };
  },

  industryUpdate(
    update: Record<string, unknown>,
    opts?: { mergedRivalId?: string; acquirerId?: string; bankruptRivalId?: string },
  ): IndustryUpdateImpact {
    return {
      type: 'INDUSTRY_UPDATE',
      payload: {
        update,
        ...opts,
      },
    };
  },

  modalTriggered(
    modalType: string,
    payload: Record<string, unknown> = {},
    priority: number = 10,
  ): ModalTriggeredImpact {
    return {
      type: 'MODAL_TRIGGERED',
      payload: { modalType, priority, payload },
    };
  },

  awardWon(projectId: string, award: Award): AwardWonImpact {
    return { type: 'AWARD_WON', payload: { projectId, award } };
  },
};

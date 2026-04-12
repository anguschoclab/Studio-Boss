import { GameState, StateImpact, Project, RivalStudio } from '@/engine/types';
import { RandomGenerator } from '../../utils/rng';
import { FestivalSubmission } from '@/engine/types/project.types';

// Festival market weeks: Sundance (4), Cannes (20), TIFF (36)
export const FESTIVAL_MARKET_WEEKS = [4, 20, 36] as const;

export interface FestivalBid {
  bidderId: string;
  bidderName: string;
  amount: number;
  terms: string;
}

export interface FestivalAuctionResult {
  projectId: string;
  projectTitle: string;
  festivalBody: string;
  bids: FestivalBid[];
  winnerId: string | null;
  winningAmount: number;
  isPlayerProject: boolean;
}

function getActiveFestivalBody(week: number): string | null {
  if (week === 4) return 'Sundance Film Festival';
  if (week === 20) return 'Cannes Film Festival';
  if (week === 36) return 'Toronto International Film Festival';
  return null;
}

/**
 * Generates a bid amount for an NPC buyer at a festival market.
 * Returns null if the buyer has no interest.
 */
export function generateNPCBid(
  project: Project,
  buyerCash: number,
  rng: RandomGenerator
): FestivalBid | null {
  const reviewScore = project.reviewScore ?? 60;
  const buzz = project.buzz ?? 50;
  const baseInterest = (reviewScore * 0.6 + buzz * 0.4) / 100;

  // Low-quality films get no bids
  if (baseInterest < 0.45 && rng.next() > 0.2) return null;

  const baseBidMultiplier = rng.range(0.5, 1.5);
  const budget = project.budget ?? 1_000_000;
  const bidAmount = Math.round(budget * baseInterest * baseBidMultiplier * rng.range(0.8, 1.8));
  const cappedBid = Math.min(bidAmount, buyerCash * 0.3);

  if (cappedBid < 100_000) return null;

  return {
    bidderId: rng.uuid('SUB'),
    bidderName: 'NPC Buyer',
    amount: cappedBid,
    terms: reviewScore > 75 ? 'theatrical + streaming rights' : 'streaming rights only',
  };
}

/**
 * Resolves festival market auctions for the current week.
 * Generates NPC bids, determines winners, and triggers modals for player projects.
 */
export function runFestivalMarket(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];

  const festivalBody = getActiveFestivalBody(state.week % 52 || state.week);
  if (!festivalBody) return impacts;

  const submissions: FestivalSubmission[] = state.industry.festivalSubmissions ?? [];
  const activeSubmissions = submissions.filter(
    s => s.festivalBody === festivalBody && (s.status === 'submitted' || s.status === 'selected')
  );

  if (activeSubmissions.length === 0) return impacts;

  const buyers = state.market.buyers;
  const auctionResults: FestivalAuctionResult[] = [];

  // ⚡ Bolt: Pre-compute rival projects mapping for O(1) lookups
  const rivalProjectsMap: Record<string, Project> = {};
  const rivalsList = Object.values(state.entities.rivals || {});

  for (const rival of rivalsList) {
    // Backward compatibility for projects field
    const rivalProjects = ('projects' in rival && rival.projects) ? (rival as any).projects : {};
    if (rival && rivalProjects) {
      for (const projId in rivalProjects) {
        rivalProjectsMap[projId] = rivalProjects[projId];
      }
    }
  }

  activeSubmissions.forEach(sub => {
    const isPlayerProject = !!state.entities.projects[sub.projectId];
    const project = isPlayerProject
      ? state.entities.projects[sub.projectId]
      : rivalProjectsMap[sub.projectId];

    if (!project) return;

    const bids: FestivalBid[] = [];

    // Generate NPC bids from all buyers
    buyers.forEach(buyer => {
      const buyerCash = (buyer as any).cash ?? 50_000_000;
      const bid = generateNPCBid(project, buyerCash, rng);
      if (bid) {
        bids.push({ ...bid, bidderId: buyer.id, bidderName: buyer.name });
      }
    });

    // Add NPC rival bids
    rivalsList.slice(0, 3).forEach(rival => {
      const bid = generateNPCBid(project, rival.cash, rng);
      if (bid) {
        bids.push({ ...bid, bidderId: rival.id, bidderName: rival.name });
      }
    });

    bids.sort((a, b) => b.amount - a.amount);
    const winner = bids[0] ?? null;

    auctionResults.push({
      projectId: project.id,
      projectTitle: project.title,
      festivalBody,
      bids,
      winnerId: winner?.bidderId ?? null,
      winningAmount: winner?.amount ?? 0,
      isPlayerProject,
    });

    if (!isPlayerProject && winner) {
      // NPC project sold — update submission status
      const updatedSubs = submissions.map(s =>
        s.projectId === sub.projectId ? { ...s, status: 'selected' as const } : s
      );
      impacts.push({
        type: 'INDUSTRY_UPDATE',
        payload: { update: { 'industry.festivalSubmissions': updatedSubs } }
      });
    }
  });

  const playerResults = auctionResults.filter(r => r.isPlayerProject);

  if (playerResults.length > 0) {
    // Trigger FESTIVAL_MARKET modal so player can review bids and accept/decline
    impacts.push({
      type: 'MODAL_TRIGGERED',
      payload: {
        modalType: 'FESTIVAL_MARKET',
        priority: 40,
        payload: { results: playerResults, festivalBody, week: state.week }
      }
    });
  }

  // Headline for the festival market opening
  impacts.push({
    type: 'NEWS_ADDED',
    payload: {
      id: rng.uuid('NWS'),
      headline: `${festivalBody} market opens — acquisition frenzy underway`,
      description: `Buyers and sellers converge as distribution rights go up for grabs.`,
      category: 'festival',
      publication: 'Variety'
    }
  });

  return impacts;
}

import { GameState, Project } from "../../types";
import { RivalStance, TalentTier } from "../../types";
import { isPlayerProject } from "../../utils/ownership";
import { getMarketHeat, getBudgetInflation } from "../industry/MacroCycle";
import { AWARDS_CALENDAR } from "../../data/awards.data";

/**
 * WorldAssessment — the shared per-tick facts every AI brain reads.
 *
 * Computed once at the top of the weekly tick and stored on TickContext.world.
 * Pure derivation over GameState: no RNG, no mutation. Brains consume this
 * instead of re-scanning entities so all actors reason over the same facts.
 */

export type MarketCycle = "BOOM" | "RECOVERY" | "STABLE" | "BEAR" | "RECESSION";

/** Map the macro heat multiplier (~[0.45, 1.55]) onto a named market cycle. */
export function cycleFromHeat(heat: number): MarketCycle {
  if (heat >= 1.15) return "BOOM";
  if (heat >= 1.0) return "RECOVERY";
  if (heat >= 0.85) return "STABLE";
  if (heat >= 0.7) return "BEAR";
  return "RECESSION";
}

export interface GenreAssessment {
  /** 0-100 trend heat from state.market.trends (50 when unknown). */
  heat: number;
  direction: "hot" | "rising" | "stable" | "cooling" | "dead";
  /** Count of active (in-flight) projects in this genre across all owners. */
  activeProjects: number;
}

export type CashTier = "distressed" | "lean" | "healthy" | "flush";
export type PrestigeTier = "low" | "mid" | "high";

export interface StudioStanding {
  id: string;
  isPlayer: boolean;
  cash: number;
  cashTier: CashTier;
  prestige: number;
  prestigeTier: PrestigeTier;
  /** Estimated weeks of overhead+slate burn remaining (999 when unthreatened). */
  runwayWeeks: number;
  /** Active in-flight projects (all formats). */
  activeProjects: number;
}

export interface PlayerThreatProfile {
  /** Player share of industry box office over the last 52 weeks, 0-1. */
  marketShare: number;
  prestige: number;
  activeProjects: number;
  /** Recent player wins: player-owned released hits in the last year. */
  recentWins: number;
  /** Per-rival hostility score from the simMemory relations ledger. */
  recentHostilityByRival: Record<string, number>;
}

export type CalendarPhase = "AWARDS_SEASON" | "UPFRONTS" | "SUMMER_TENTPOLE" | "NORMAL";

export interface WorldAssessment {
  week: number;
  marketHeat: number;
  marketCycle: MarketCycle;
  budgetInflation: number;
  genreHeat: Record<string, GenreAssessment>;
  studioStandings: Record<string, StudioStanding>;
  playerThreat: PlayerThreatProfile;
  calendarPhase: CalendarPhase;
  /** Free-agent talent counts per tier (no active contract, not retired). */
  talentSupply: Record<TalentTier, number>;
}

const ACTIVE_STATES: ReadonlySet<string> = new Set([
  "development",
  "needs_greenlight",
  "pitching",
  "shopping",
  "turnaround",
  "production",
  "post_production",
  "marketing",
]);

const TALENT_TIERS: TalentTier[] = ["A_LIST", "B_LIST", "C_LIST", "RISING_STAR", "NEWCOMER"];

function cashTierFor(cash: number): CashTier {
  if (cash < 0) return "distressed";
  if (cash < 10_000_000) return "lean";
  if (cash < 60_000_000) return "healthy";
  return "flush";
}

function prestigeTierFor(prestige: number): PrestigeTier {
  if (prestige >= 70) return "high";
  if (prestige >= 40) return "mid";
  return "low";
}

function calendarPhaseFor(week: number): CalendarPhase {
  const weekOfYear = ((week - 1) % 52) + 1;
  // Awards bodies run in weeks 2-10 (Globes→Oscars) and 34-37 (festivals+Emmys).
  if (AWARDS_CALENDAR[weekOfYear]) return "AWARDS_SEASON";
  // TV upfronts fire at week 20.
  if (weekOfYear >= 18 && weekOfYear <= 21) return "UPFRONTS";
  // Summer tentpole corridor — tentpole release windows cluster mid-year.
  if (weekOfYear >= 22 && weekOfYear <= 34) return "SUMMER_TENTPOLE";
  return "NORMAL";
}

export function buildWorldAssessment(state: GameState): WorldAssessment {
  const week = state.week;
  const projects = state.entities.projects || {};

  // --- Single census over canonical projects ---
  const activeByGenre: Record<string, number> = {};
  const activeByOwner: Record<string, number> = {};
  const weeklyBurnByOwner: Record<string, number> = {};
  let playerActive = 0;
  let playerRecentWins = 0;
  let playerBoxOffice = 0;
  let industryBoxOffice = 0;

  for (const pid in projects) {
    const p: Project = projects[pid];
    if (ACTIVE_STATES.has(p.state)) {
      const owner = p.ownerId ?? "__player__";
      activeByOwner[owner] = (activeByOwner[owner] || 0) + 1;
      if (p.genre) activeByGenre[p.genre] = (activeByGenre[p.genre] || 0) + 1;
      weeklyBurnByOwner[owner] = (weeklyBurnByOwner[owner] || 0) + (p.weeklyCost || 0);
      if (isPlayerProject(state, p)) playerActive++;
    }
    if (p.state === "released" && p.releaseWeek && week - p.releaseWeek <= 52) {
      const gross = (p.boxOffice?.totalDomestic || 0) + (p.boxOffice?.totalForeign || 0);
      industryBoxOffice += gross;
      if (isPlayerProject(state, p)) {
        playerBoxOffice += gross;
        if (gross > (p.budget || 0) * 2) playerRecentWins++;
      }
    }
  }

  // --- Genre heat: trend data + saturation census ---
  const genreHeat: Record<string, GenreAssessment> = {};
  const trends = state.market.trends || [];
  for (const t of trends) {
    genreHeat[t.genre] = {
      heat: t.heat,
      direction: t.direction,
      activeProjects: activeByGenre[t.genre] || 0,
    };
  }
  for (const g in activeByGenre) {
    if (!genreHeat[g]) {
      genreHeat[g] = { heat: 50, direction: "stable", activeProjects: activeByGenre[g] };
    }
  }

  // --- Studio standings (rivals + player) ---
  const studioStandings: Record<string, StudioStanding> = {};
  const rivals = state.entities.rivals || {};
  for (const rid in rivals) {
    const r = rivals[rid];
    if (!r) continue;
    const burn = weeklyBurnByOwner[rid] || 0;
    studioStandings[rid] = {
      id: rid,
      isPlayer: false,
      cash: r.cash,
      cashTier: cashTierFor(r.cash),
      prestige: r.prestige,
      prestigeTier: prestigeTierFor(r.prestige),
      runwayWeeks: burn > 0 ? Math.floor(r.cash / burn) : 999,
      activeProjects: activeByOwner[rid] || 0,
    };
  }
  const playerCash = state.finance.cash;
  const playerBurn = weeklyBurnByOwner["__player__"] || 0;
  studioStandings[state.studio.id] = {
    id: state.studio.id,
    isPlayer: true,
    cash: playerCash,
    cashTier: cashTierFor(playerCash),
    prestige: state.studio.prestige,
    prestigeTier: prestigeTierFor(state.studio.prestige),
    runwayWeeks: playerBurn > 0 ? Math.floor(playerCash / playerBurn) : 999,
    activeProjects: playerActive,
  };

  // --- Player threat profile ---
  const relations = state.simMemory?.rivalRelations || {};
  const recentHostilityByRival: Record<string, number> = {};
  for (const rid in relations) {
    const rel = relations[rid];
    const recency = week - rel.lastHostileWeek <= 52 ? 1 : 0;
    recentHostilityByRival[rid] = (rel.playerOutbids + rel.playerPoaches) * recency;
  }
  const playerThreat: PlayerThreatProfile = {
    marketShare: industryBoxOffice > 0 ? Math.min(1, playerBoxOffice / industryBoxOffice) : 0,
    prestige: state.studio.prestige,
    activeProjects: playerActive,
    recentWins: playerRecentWins,
    recentHostilityByRival,
  };

  // --- Talent supply census ---
  const talentSupply = {} as Record<TalentTier, number>;
  for (const t of TALENT_TIERS) talentSupply[t] = 0;
  const talents = state.entities.talents || {};
  for (const tid in talents) {
    const t = talents[tid];
    if (t.retired || t.contractId) continue;
    if (t.tier in talentSupply) talentSupply[t.tier]++;
  }

  const heat = getMarketHeat(week);
  return {
    week,
    marketHeat: heat,
    marketCycle: cycleFromHeat(heat),
    budgetInflation: getBudgetInflation(week),
    genreHeat,
    studioStandings,
    playerThreat,
    calendarPhase: calendarPhaseFor(week),
    talentSupply,
  };
}

/** Resolve a rival's current stance toward the player from the ledger. */
export function stanceFor(
  state: GameState,
  rivalId: string,
  playerThreat: PlayerThreatProfile
): RivalStance {
  const rel = state.simMemory?.rivalRelations?.[rivalId];
  const hostility = rel ? rel.playerOutbids + rel.playerPoaches : 0;
  const recency = rel && state.week - rel.lastHostileWeek <= 52;
  if (hostility >= 3 && recency) return "hostile";
  if (hostility >= 1 && recency) return "rivalrous";
  if (playerThreat.marketShare > 0.5 || playerThreat.recentWins >= 3) return "deferential";
  return "neutral";
}

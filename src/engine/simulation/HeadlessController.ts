import {GameState, StateImpact, Project, CampaignData} from "@/engine/types";
import {RandomGenerator} from "../utils/rng";
import {isPlayerOwner, getPlayerId} from "../utils/ownership";
import {executeGreenlight, executeMarketing} from "../systems/projects";
import {BudgetTierKey, MarketingCampaign} from "../types/project.types";
import {processFlops} from "../systems/finance/FlopMechanics";
import {calculateOpeningWeekend} from "../systems/releaseSimulation";
import {getSimMemory} from "../core/simMemory";
import {getMarketHeat, getBudgetInflation, BANKRUPTCY_CASH_FLOOR, BANKRUPTCY_WEEKS_REQUIRED} from "../systems/industry/MacroCycle";
import {buildFatigueAwareGenreWeights} from "../systems/rivals/rivalProduction";
import {checkCampaignBacklash} from "../systems/awards/NominationCalculator";

/**
 * Headless Controller (AI for the Player Studio)
 * Automates decision-making to prevent the simulation from stalling.
 */
export class HeadlessController {
  static tick(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];

    // 0. Auto-Pitch New Projects (for headless simulation)
    // ⚡ Bolt Optimization: Replaced Object.values().filter() with a for...in loop to avoid array allocations.
    let activePlayerProjectCount = 0;
    for (const pid in state.entities.projects) {
      const p = state.entities.projects[pid];
      if (isPlayerOwner(state, p.ownerId) && p.state !== "archived") {
        activePlayerProjectCount++;
      }
    }
    let newlyPitchedProject: Project | null = null;
    if (activePlayerProjectCount < 10 && rng.next() < 0.8) {
      const pitchResult = this.pitchNewProject(state, rng);
      if (pitchResult) {
        impacts.push(pitchResult);
        // Extract the newly pitched project for immediate processing
        if (pitchResult.type === "PROJECT_CREATED") {
          newlyPitchedProject = pitchResult.payload.project as Project;
        }
      }
    }

    // Process projects from current state (including newly pitched ones)
    const allProjects = Object.values(state.entities.projects);
    if (newlyPitchedProject) {
      allProjects.push(newlyPitchedProject);
    }
    allProjects.forEach((project) => {
      // 1. Auto-Greenlight
      if (project.state === "needs_greenlight") {
        // In headless simulation, always greenlight projects
        const result = executeGreenlight(project);
        // Set productionWeeks for headless simulation (shorter duration)
        const productionWeeks = rng.rangeInt(4, 8); // 4-8 weeks
        const updateWithProductionWeeks = {
          ...result.project,
          productionWeeks,
        };

        // Use PROJECT_UPDATED (supported by impact reducer)
        impacts.push({
          type: "PROJECT_UPDATED",
          payload: { projectId: project.id, update: updateWithProductionWeeks },
        });
        impacts.push({
          type: "NEWS_ADDED",
          payload: {
            headline: `GREENLIGHT: ${state.studio.name} moves forward with "${project.title}"`,
            description: `Automated decision: Project greenlit in headless simulation.`,
            category: "general",
          },
        });
      }

      // 1.5. Auto-advance production (for headless mode)
      if (project.state === "production" && project.productionWeeks) {
        if (project.weeksInPhase >= project.productionWeeks) {
          // Transition to post_production
          const updateWithPostProduction = {
            ...project,
            state: "post_production" as const,
            weeksInPhase: 0,
            postProductionWeeksRemaining: 1,
            progress: 100,
          };
          impacts.push({
            type: "PROJECT_UPDATED",
            payload: { projectId: project.id, update: updateWithPostProduction },
          });
        } else {
          // Increment weeks in production
          const updateWithProgress = {
            ...project,
            weeksInPhase: project.weeksInPhase + 1,
            progress: Math.min(100, ((project.weeksInPhase + 1) / project.productionWeeks) * 100),
          };
          impacts.push({
            type: "PROJECT_UPDATED",
            payload: { projectId: project.id, update: updateWithProgress },
          });
        }
      }

      // 1.6. Auto-advance post_production to marketing
      if (project.state === "post_production") {
        const weeksRemaining = project.postProductionWeeksRemaining || 1;
        if (project.weeksInPhase >= weeksRemaining) {
          // Transition to marketing
          const updateWithMarketing = {
            ...project,
            state: "marketing" as const,
            weeksInPhase: 0,
            marketingCampaign: {
              primaryAngle: "SELL_THE_STORY" as const,
              domesticBudget: project.budget * 0.18,
              foreignBudget: project.budget * 0.12,
              weeksInMarketing: 0,
            },
          };
          impacts.push({
            type: "PROJECT_UPDATED",
            payload: { projectId: project.id, update: updateWithMarketing },
          });
        } else {
          // Increment weeks in post_production
          const updateWithProgress = {
            ...project,
            weeksInPhase: project.weeksInPhase + 1,
          };
          impacts.push({
            type: "PROJECT_UPDATED",
            payload: { projectId: project.id, update: updateWithProgress },
          });
        }
      }

      // 2. Auto-Release (Transition from marketing to released)
      if (project.state === "marketing" && !project.releaseWeek) {
        const isTv = project.format === "tv" || project.type === "SERIES";
        if (isTv) {
          // TV premiere: revenue = license fees (per-episode) or streamer subscriber-value proxy.
          // Simpler than box office. Renewal can spawn a season-2 project.
          const tvDetails: import("../types").TVSeasonDetails =
            ("tvDetails" in project ? project.tvDetails : undefined) || {
              episodesOrdered: 10,
              currentSeason: 1,
              episodesCompleted: 0,
              episodesAired: 0,
              averageRating: 0,
              status: "ON_AIR",
            };
          const episodes = tvDetails.episodesOrdered || 10;
          const ownsPlatform = (state.studio?.ownedPlatforms || []).length > 0;
          // License fees must track budget inflation or TV projects become guaranteed losers
          // late in the sim (budgets scale 5.6x over 50 years, revenue must too).
          const inflation = getBudgetInflation(state.week);
          // Scale per-ep license to budget tier so blockbuster TV can recoup. Real-world
          // Sheridan/Murphy-tier shows clear $8-12M/ep license. Base floor tracks cable rate.
          const tier = project.budgetTier || "mid";
          const tierPerEp: Record<string, [number, number]> = {
            low: [1_200_000, 2_500_000],
            mid: [2_500_000, 5_000_000],
            high: [4_500_000, 8_000_000],
            blockbuster: [8_000_000, 14_000_000],
          };
          const [loLic, hiLic] = tierPerEp[tier] || tierPerEp.mid;
          const ownershipBoost = ownsPlatform ? 1.15 : 1.0;
          const perEpLicense = rng.range(loLic, hiLic) * inflation * ownershipBoost;
          const buzzMult = 0.6 + (project.buzz || 40) / 100;
          const heatMult = 0.8 + getMarketHeat(state.week) * 0.4;
          const revenue = Math.round(episodes * perEpLicense * buzzMult * heatMult);
          const marketingBudget = (project.budget || 0) * 0.05; // TV marketing much lighter

          // Rating score = f(buzz, heat). Drives renewal probability.
          const ratingScore = Math.max(
            5,
            Math.min(95, Math.round((project.buzz || 40) * 0.8 + rng.range(-15, 25)))
          );
          const renewalProb =
            ratingScore >= 75 ? 0.85 : ratingScore >= 60 ? 0.55 : ratingScore >= 40 ? 0.25 : 0.05;
          const renewed = rng.next() < renewalProb;
          const currentSeason = tvDetails.currentSeason || 1;
          const isHit = ratingScore >= 70 && revenue > (project.budget || 0) * 1.3;

          impacts.push({
            type: "PROJECT_UPDATED",
            payload: {
              projectId: project.id,
              update: {
                state: "released" as const,
                releaseWeek: state.week,
                revenue,
                marketingBudget,
                tvDetails: {
                  ...tvDetails,
                  episodesAired: episodes,
                  averageRating: ratingScore,
                  status: renewed ? "RENEWED" : "CANCELLED",
                },
              },
            },
          });
          const netCash = revenue - (project.budget || 0) - marketingBudget;
          impacts.push({ type: "FUNDS_CHANGED", payload: { amount: netCash } });
          impacts.push(
            ...HeadlessController.attributeTalent(state, project, revenue, rng, isHit, ratingScore)
          );

          // Renewal spawns a follow-on season project (sequel-equivalent).
          if (renewed && currentSeason < 8) {
            const nextId = rng.uuid("PRJ");
            const nextProject: Project = {
              id: nextId,
              title: `${project.title} S${currentSeason + 1}`,
              genre: project.genre,
              format: "tv",
              type: "SERIES",
              state: "needs_greenlight",
              weeksInPhase: 0,
              budgetTier: project.budgetTier,
              budget: Math.round((project.budget || 0) * (isHit ? 1.15 : 1.05)),
              weeklyCost: 0,
              targetAudience: project.targetAudience,
              flavor: project.flavor,
              developmentWeeks: 0,
              productionWeeks: 0,
              revenue: 0,
              weeklyRevenue: 0,
              releaseWeek: null,
              activeCrisis: null,
              momentum: 50,
              buzz: Math.min(95, (project.buzz || 40) + (isHit ? 15 : 5)),
              ownerId: getPlayerId(state),
              quality: 50,
              scriptHeat: 55,
              activeRoles: [],
              scriptEvents: [],
              progress: 0,
              accumulatedCost: 0,
              parentProjectId: project.parentProjectId || project.id,
              franchiseId: project.franchiseId,
              tvDetails: {
                status: "IN_DEVELOPMENT",
                episodesOrdered: episodes,
                episodesAired: 0,
                averageRating: 0,
                currentSeason: currentSeason + 1,
                episodesCompleted: 0,
              },
            };
            impacts.push({
              type: "PROJECT_CREATED",
              payload: { project: nextProject },
            });

            // On its 3rd season, promote the line to a franchise (if not already).
            if (currentSeason + 1 >= 3 && !project.franchiseId) {
              const fid = rng.uuid("FR");
              impacts.push({
                type: "INDUSTRY_UPDATE",
                payload: {
                  update: {
                    [`ip.franchises.${fid}`]: {
                      id: fid,
                      name: project.title,
                      medium: "TV",
                      rootProjectId: project.parentProjectId || project.id,
                      creationWeek: state.week,
                      entries: [project.id, nextId],
                      heat: 70,
                      fatigue: 0,
                    },
                  },
                },
              });
              impacts.push({
                type: "PROJECT_UPDATED",
                payload: { projectId: project.id, update: { franchiseId: fid } },
              } as StateImpact);
            }
          }
        } else {
          // Film: existing box-office path.
          const campaign: MarketingCampaign = {
            primaryAngle: "SELL_THE_STORY",
            domesticBudget: project.budget * 0.25,
            foreignBudget: project.budget * 0.15,
            weeksInMarketing: 1,
          };
          const result = executeMarketing(project, campaign);
          const marketingBudget = campaign.domesticBudget + campaign.foreignBudget;
          const projectWithMarketing = { ...result.project, marketingBudget };
          const { project: releasedProject } = calculateOpeningWeekend(
            projectWithMarketing,
            [],
            state.studio.prestige || 50,
            1.0,
            0,
            state.week
          );
          impacts.push({
            type: "PROJECT_UPDATED",
            payload: {
              projectId: project.id,
              update: {
                ...releasedProject,
                state: "released",
                releaseWeek: state.week,
                marketingBudget,
              },
            },
          });
          const netCash = (releasedProject.revenue || 0) - (project.budget || 0) - marketingBudget;
          impacts.push({
            type: "FUNDS_CHANGED",
            payload: { amount: netCash },
          });
          const filmRev = releasedProject.revenue || 0;
          const filmHit = filmRev > (project.budget || 0) * 2;
          impacts.push(
            ...HeadlessController.attributeTalent(state, project, filmRev, rng, filmHit, 0)
          );
        }
      }

      // Archive released player projects so the pitch gate isn't permanently saturated
      if (
        isPlayerOwner(state, project.ownerId) &&
        project.state === "released" &&
        project.releaseWeek &&
        state.week - project.releaseWeek > 1
      ) {
        impacts.push({
          type: "PROJECT_UPDATED",
          payload: { projectId: project.id, update: { state: "archived" } },
        } as StateImpact);
      }
    });

    // Pre-calculate genre counts to avoid O(N) inside the loop
    const playerGenreCounts: Record<string, number> = {};
    for (let i = 0; i < allProjects.length; i++) {
      const g = allProjects[i].genre;
      if (g) {
        playerGenreCounts[g] = (playerGenreCounts[g] || 0) + 1;
      }
    }

    // 3. Auto-Bidding on Opportunities
    state.market.opportunities.forEach((opportunity) => {
      const isAlreadyBid = !!opportunity.bids[getPlayerId(state)];

      // Headless mode: always bid when affordable-by-fiat (the controller is the
      // market's buyer of last resort, so the cash guard is intentionally bypassed).
      let shouldBid = !isAlreadyBid;

      // Persona Overrides
      const persona = state.persona || "balanced";

      // Genre Saturation Guard for Player (Limit to 2 same-genre projects)
      const isSaturated = (playerGenreCounts[opportunity.genre] || 0) >= 2;

      if (persona === "frugal") {
        // Frugal only bids on low/mid if cash is tight, or any if cash is high
        if (opportunity.budgetTier === "blockbuster" || opportunity.budgetTier === "high") {
          if (state.finance.cash < 100000000) shouldBid = false;
        }
      } else if (persona === "aggressive") {
        // Aggressive always bids if not already bid
        shouldBid = !isAlreadyBid;
      }

      if (isSaturated) shouldBid = false;

      if (shouldBid) {
        let bidAmount = Math.floor(opportunity.costToAcquire * 1.05);

        // Predatory Bidding (Top the highest rival bid if Aggressive)
        if (persona === "aggressive") {
          const rivalBids: number[] = [];
          if (opportunity.bids) {
            for (const id in opportunity.bids) {
              if (Object.prototype.hasOwnProperty.call(opportunity.bids, id)) {
                rivalBids.push(opportunity.bids[id].amount);
              }
            }
          }
          if (rivalBids.length > 0) {
            const highestRival = Math.max(...rivalBids);
            bidAmount = Math.max(bidAmount, Math.floor(highestRival * 1.05));
          }
        }

        impacts.push({
          type: "OPPORTUNITY_UPDATED",
          payload: {
            opportunityId: opportunity.id,
            rivalId: getPlayerId(state),
            bid: { amount: bidAmount, terms: "standard" },
          },
        });
      }
    });

    // Process flops for all released projects
    const flopImpacts = processFlops(state);
    impacts.push(...flopImpacts);

    // Awards campaigns for player projects (headless mode)
    impacts.push(...HeadlessController.tickPlayerAwardsCampaigns(state, rng));

    // Bankruptcy check: cash below floor for 52+ consecutive weeks → failure.
    // A failed rival is marked acquirable so ConsolidationEngine sweeps it next downturn.
    const mem = getSimMemory(state);
    const cashStreaks: Record<string, number> = { ...mem.headlessCashStreaks };
    const streakRivals = state.entities.rivals || {};
    for (const rid in streakRivals) {
      const r = streakRivals[rid];
      const cash = Number(r.cash) || 0;
      const prev = cashStreaks[r.id] || 0;
      const next = cash < BANKRUPTCY_CASH_FLOOR ? prev + 1 : 0;
      cashStreaks[r.id] = next;
      if (next >= BANKRUPTCY_WEEKS_REQUIRED && !r.isAcquirable) {
        impacts.push({
          type: "RIVAL_UPDATED",
          payload: { rivalId: r.id, update: { isAcquirable: true, strength: 5 } },
        });
        impacts.push({
          type: "NEWS_ADDED",
          payload: {
            headline: `BANKRUPTCY: ${r.name} files for protection after sustained losses`,
            description: `${r.name} has posted negative cash for over a year and is now seeking a buyer or restructuring.`,
            category: "business",
          },
        });
        cashStreaks[r.id] = 0;
      }
    }
    impacts.push({
      type: "INDUSTRY_UPDATE",
      payload: { update: { "simMemory.headlessCashStreaks": cashStreaks } },
    });

    return impacts;
  }

  // _cashStreaks moved to simMemory.headlessCashStreaks — state-carried for save/reload determinism.

  /**
   * Headless has no contract pipeline, so releases would never move talent prestige
   * and the weekly decay in TalentLifecycleSystem would drain everyone to zero. This
   * proxy attaches a small crew (3-5 talents: director/actor/writer/producer) to each
   * release, bumps their lastReleaseWeek + prestige by ROI, and lets marquee careers
   * actually break out into the 80-99 band over 50 years.
   */
  static attributeTalent(
    state: GameState,
    project: Project,
    revenue: number,
    rng: RandomGenerator,
    isHit: boolean,
    ratingScore: number
  ): StateImpact[] {
    const impacts: StateImpact[] = [];
    // ⚡ Bolt Optimization: Replace Object.values() with direct for...in loop to avoid array allocation
    const pool: typeof state.entities.talents[keyof typeof state.entities.talents][] = [];
    const talentsObj = state.entities.talents || {};
    for (const key in talentsObj) {
      if (!Object.prototype.hasOwnProperty.call(talentsObj, key)) continue;
      pool.push(talentsObj[key]);
    }
    if (pool.length === 0) return impacts;
    const totalCost = (project.budget || 0) + (project.marketingBudget || 0);
    const ROI = totalCost > 0 ? revenue / totalCost : 0;
    const isTv = project.format === "tv" || project.type === "SERIES";

    // Budget factor — bigger project = bigger cultural footprint for its talent.
    const budgetFactor = Math.log10(Math.max(10_000_000, project.budget || 10_000_000)) / 7.2;

    let basePrestige = 0;
    if (isTv) {
      // TV: prestige tied to ratingScore rather than ROI.
      if (ratingScore >= 85) basePrestige = 10;
      else if (ratingScore >= 70) basePrestige = 6;
      else if (ratingScore >= 50) basePrestige = 2;
      else if (ratingScore >= 30) basePrestige = -1;
      else basePrestige = -3;
    } else {
      if (ROI > 6.0) basePrestige = 14;
      else if (ROI > 4.0) basePrestige = 9;
      else if (ROI > 2.0) basePrestige = 5;
      else if (ROI > 1.0) basePrestige = 2;
      else if (ROI < 0.4) basePrestige = -4;
      else if (ROI < 0.8) basePrestige = -2;
    }
    const delta = basePrestige * budgetFactor;
    if (delta === 0) return impacts;

    // Pick 3-5 attached talents weighted by existing prestige (so the already-rising ones
    // keep accumulating — mirrors the real industry's winner-take-most dynamic).
    const crewSize = rng.rangeInt(3, 5);
    // Heavier prestige concentration (winner-take-most): high-prestige talents get
    // repeat picks, driving breakout careers into the 80-99 band. For big-budget
    // projects, the top ~10 talents get weighted even harder (A-list attachment).
    const isBlockbuster = ((project.budget as number) || 0) > 80_000_000;
    const weights = pool.map((t) => {
      const p = t.prestige || 0;
      const base = 1 + Math.pow(p / 10, 2.2);
      return isBlockbuster && p >= 50 ? base * 3 : base;
    });
    const picked: typeof pool = [];
    for (let i = 0; i < crewSize && pool.length > 0; i++) {
      const total = weights.reduce((s, w) => s + w, 0);
      let r = rng.next() * total;
      let idx = 0;
      for (; idx < pool.length; idx++) {
        r -= weights[idx];
        if (r <= 0) break;
      }
      if (idx >= pool.length) idx = pool.length - 1;
      picked.push(pool[idx]);
      pool.splice(idx, 1);
      weights.splice(idx, 1);
    }

    // Marquee breakout: repeated blockbuster hits compound (streak bonus).
    for (const t of picked) {
      // Streak/momentum-aware bonus. Talents above 70 with strong momentum get
      // outsized prestige pushes on hits (Spielberg/Sheridan dynamic).
      let bonus = 0;
      if (isHit && (t.momentum || 50) > 50) {
        if ((t.prestige || 0) >= 50) bonus += 3;
        if ((t.prestige || 0) >= 65) bonus += 4;
        if ((t.prestige || 0) >= 80) bonus += 5;
      }
      // Franchise-launch / marquee uncap: an outsized hit on an already-strong talent
      // pushes into the 90-99 band (Spielberg/Shonda/Sheridan). Only a handful of picks
      // clear all three gates over a 50-year run.
      if (isHit && ROI > 3.0 && (t.prestige || 0) >= 60) {
        bonus += 4;
      }
      // Mid-career bump: unknown hit moves a mid-career talent (40-65 prestige) up meaningfully.
      if (isHit && (t.prestige || 0) >= 40 && (t.prestige || 0) < 60) {
        bonus += 2;
      }
      const newPrestige = Math.max(0, Math.min(99, (t.prestige || 50) + delta + bonus));
      const newMomentum = Math.max(
        0,
        Math.min(100, (t.momentum || 50) + (isHit ? 6 : delta < 0 ? -4 : 1))
      );
      // Sticky legacy: each hit locks in a fraction of the current peak as a non-decayable
      // floor. Mirrors real Oscar/Emmy/franchise-creator credit — once earned, never lost.
      const priorLegacy = t.legacyPrestige || 0;
      let legacyGain = 0;
      if (isHit) {
        if (ROI > 3.0 && newPrestige >= 60) legacyGain = 3;
        else if (isTv && ratingScore >= 85) legacyGain = 3;
        else if (newPrestige >= 50) legacyGain = 1;
      }
      const newLegacy = Math.min(90, priorLegacy + legacyGain);
      impacts.push({
        type: "TALENT_UPDATED",
        payload: {
          talentId: t.id,
          update: {
            prestige: Math.max(newPrestige, newLegacy),
            momentum: newMomentum,
            lastReleaseWeek: state.week,
            legacyPrestige: newLegacy,
          },
        },
      });
    }
    return impacts;
  }

  private static pitchNewProject(state: GameState, rng: RandomGenerator): StateImpact | null {
    const id = rng.uuid("PRJ");
    const genres = ["Action", "Drama", "Comedy", "Sci-Fi", "Horror", "Family"];
    // Fatigue-aware genre selection for player studio
    const playerRival = { id: getPlayerId(state), archetypeId: "BALANCED_GIANT" };
    const genreWeights = buildFatigueAwareGenreWeights(state, playerRival);
    const weightSum = genres.reduce((s, g) => s + (genreWeights[g] ?? 1), 0);
    let roll = rng.next() * weightSum;
    let genre = genres[0];
    for (const g of genres) {
      roll -= (genreWeights[g] ?? 1);
      if (roll <= 0) { genre = g; break; }
    }
    const formats = ["film", "tv"];
    const format = formats[Math.floor(rng.next() * formats.length)] as "film" | "tv";
    // Player tier bias: majority low/mid, occasional high, rare blockbuster.
    // Uniform roll was losing money every week because blockbuster TV is a 5x loss
    // after inflation. Real studios skew their slate similarly — mostly mids + some tentpoles.
    const tierRoll = rng.next();
    let budgetTier: BudgetTierKey;
    if (tierRoll < 0.4) budgetTier = "low";
    else if (tierRoll < 0.8) budgetTier = "mid";
    else if (tierRoll < 0.95) budgetTier = "high";
    else budgetTier = "blockbuster";

    // Map budget tiers to actual budget values
    const budgetMap: Record<BudgetTierKey, number> = {
      low: 15_000_000,
      mid: 40_000_000,
      high: 80_000_000,
      blockbuster: 150_000_000,
      indie: 5_000_000,
    };
    let budget = Math.floor(budgetMap[budgetTier] * getBudgetInflation(state.week));
    // TV total budget = episodeCount × perEpisodeBudget (2M indie, 8M cable, 15M+ streamer, 25M+ Sheridan-tier)
    let tvEpisodes = 10;
    if (format === "tv") {
      tvEpisodes = rng.rangeInt(6, 13);
      const year = 1975 + Math.floor(state.week / 52);
      const perEpByTier: Record<BudgetTierKey, number> = {
        low: 2_000_000, // indie TV
        mid: 8_000_000, // cable
        high: 15_000_000, // premium streamer
        blockbuster: year >= 2015 ? 25_000_000 : 18_000_000, // Sheridan-tier
        indie: 1_500_000,
      };
      const tvPerEpBudget = Math.floor(perEpByTier[budgetTier] * getBudgetInflation(state.week));
      budget = tvEpisodes * tvPerEpBudget;
    }

    const base = {
      id,
      title: `${genre} ${rng.rangeInt(1, 100)}`,
      genre,
      format,
      state: "needs_greenlight" as const,
      weeksInPhase: 0,
      budgetTier,
      budget,
      weeklyCost: 0,
      targetAudience: "general",
      flavor: "",
      developmentWeeks: 0,
      productionWeeks: 0,
      revenue: 0,
      weeklyRevenue: 0,
      releaseWeek: null,
      activeCrisis: null,
      momentum: 50,
      buzz: rng.rangeInt(20, 50),
      ownerId: getPlayerId(state),
      quality: 50,
      scriptHeat: 50,
      activeRoles: [] as import("@/engine/types").CharacterArchetype[],
      scriptEvents: [] as import("@/engine/types").ScriptEvent[],
      progress: 0,
      accumulatedCost: 0,
    };

    const project: Project =
      format === "tv"
        ? {
            ...base,
            type: "SERIES",
            tvDetails: {
              status: "IN_DEVELOPMENT",
              episodesOrdered: tvEpisodes,
              episodesAired: 0,
              averageRating: 0,
              currentSeason: 1,
              episodesCompleted: 0,
            },
          }
        : { ...base, type: "FILM" };

    return {
      type: "PROJECT_CREATED",
      payload: { project },
    };
  }

  private static tickPlayerAwardsCampaigns(state: GameState, rng: RandomGenerator): StateImpact[] {
    const impacts: StateImpact[] = [];
    const cash = state.finance?.cash ?? 0;
    const projectsObj = state.entities?.projects || {};
    const activeCampaigns = state.studio?.activeCampaigns || {};
    const activeCampaignProjectIds = new Set<string>();
    for (const key in activeCampaigns) {
      if (Object.prototype.hasOwnProperty.call(activeCampaigns, key)) {
        activeCampaignProjectIds.add((activeCampaigns[key] as CampaignData).projectId);
      }
    }

    const TIER_COSTS = { Grassroots: 250_000, Trade: 1_000_000, Blitz: 5_000_000 };
    const TIER_BUZZ = { Grassroots: 5, Trade: 15, Blitz: 40 };

    for (const pid in projectsObj) {
      const project = projectsObj[pid];
      if (
        !isPlayerOwner(state, project.ownerId) ||
        project.state !== "released" ||
        project.releaseWeek === null ||
        state.week - (project.releaseWeek as number) > 52 ||
        (project.reviewScore ?? 0) < 70
      ) {
        continue;
      }

      // Skip if already has an active campaign
      if (activeCampaignProjectIds.has(pid)) continue;

      const reviewScore = project.reviewScore ?? 0;
      let tier: "Grassroots" | "Trade" | "Blitz" | null = null;
      if (cash > 50_000_000 && reviewScore >= 85) tier = "Blitz";
      else if (cash > 10_000_000 && reviewScore >= 75) tier = "Trade";
      else if (cash > 2_000_000) tier = "Grassroots";

      if (!tier) continue;

      const cost = TIER_COSTS[tier];
      const buzzBonus = TIER_BUZZ[tier];

      // Check for backlash
      const metaScore = project.reception?.metaScore || project.reviewScore || 60;
      const hasBacklash = checkCampaignBacklash(metaScore, tier, rng);

      // Deduct cash
      impacts.push({
        type: "FUNDS_CHANGED",
        payload: { amount: -cost },
      });

      // Boost project buzz (capped at 100)
      const newBuzz = Math.min(100, (project.buzz ?? 50) + buzzBonus);
      impacts.push({
        type: "PROJECT_UPDATED",
        payload: { projectId: pid, update: { buzz: newBuzz } },
      });

      if (hasBacklash) {
        impacts.push({
          type: "NEWS_ADDED",
          payload: {
            headline: `BACKLASH: Aggressive awards campaigning for "${project.title}" sparks industry outcry!`,
            description: `Critics question the sincerity of the campaign given the project's reception.`,
            category: "scandal",
          },
        });
      }
    }

    return impacts;
  }
}

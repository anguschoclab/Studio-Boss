import { GameState, StateImpact, SeriesProject } from '@/engine/types';
import { calculateWeeklyRating } from './ratingsEvaluator';
import { evaluateRenewal } from './renewalEngine';
import { RandomGenerator } from '../../utils/rng';
import { calculateNielsenRatings, buildNielsenProfile, assignTimeSlot, NielsenSnapshot, rankShows } from './nielsenSystem';

const PILOT_MAX_WEEKS = 2;
const PILOT_BURN_RATE = 0.30; // pilot costs 30% of full production weeklyCost

/**
 * Processes projects in pilot stage: caps production at 2 weeks,
 * then graduates or cancels based on script quality and momentum.
 */
/**
 * Processes projects in pilot stage: caps production at 2 weeks.
 * Graduation/Cancellation is now handled by processUpfronts on Week 20.
 */
function tickPilots(state: GameState): StateImpact[] {
  const impacts: StateImpact[] = [];
  const playerProjects = Object.values(state.studio.internal.projects);
  const rivalProjects = state.industry.rivals.flatMap(r => Object.values(r.projects || {}));
  const allProjects = [...playerProjects, ...rivalProjects];

  for (const project of allProjects) {
    if (project.type !== 'SERIES' || project.stage !== 'pilot') continue;

    const weeksInPilot = (project.weeksInPhase || 0) + 1;

    if (weeksInPilot <= PILOT_MAX_WEEKS) {
      impacts.push({
        type: 'PROJECT_UPDATED',
        payload: {
          projectId: project.id,
          update: {
            weeksInPhase: weeksInPilot,
            // Pilot costs are suppressed to 30% via weeklyCost override
            weeklyCost: Math.round(project.weeklyCost * PILOT_BURN_RATE),
          }
        }
      });
    }
  }
  return impacts;
}

/**
 * Week 20: The Upfronts.
 * Evaluates all finished pilots and orders them to series or cancels them.
 */
export function processUpfronts(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [];
  const playerProjects = Object.values(state.studio.internal.projects);
  const rivalProjects = state.industry.rivals.flatMap(r => Object.values(r.projects || {}));
  const allProjects = [...playerProjects, ...rivalProjects];

  for (const project of allProjects) {
    if (project.type !== 'SERIES' || project.stage !== 'pilot') continue;
    if (project.weeksInPhase < PILOT_MAX_WEEKS) continue;

    // Pilot complete — evaluate graduation
    const quality = (project.reviewScore ?? project.momentum ?? 50);
    const graduated = quality >= 45 || rng.next() < 0.25;

    if (graduated) {
      impacts.push({
        type: 'PROJECT_UPDATED',
        payload: { 
          projectId: project.id, 
          update: { 
            state: 'production' as const, 
            stage: 'series' as const,
            weeksInPhase: 0,
            progress: 0 
          } 
        }
      });
      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          id: rng.uuid('news'),
          headline: `UPFRONTS: "${project.title}" Picked Up to Series`,
          description: `After a successful pilot screening, the network has ordered a full season.`,
          category: 'production'
        }
      });
    } else {
      impacts.push({
        type: 'PROJECT_UPDATED',
        payload: {
          projectId: project.id,
          update: { state: 'archived' as const }
        }
      });
      impacts.push({
        type: 'NEWS_ADDED',
        payload: {
          id: rng.uuid('news'),
          headline: `UPFRONTS: "${project.title}" Pilot Passed Over`,
          description: `The network has declined to pick up the pilot for the upcoming fall season.`,
          category: 'cancellation'
        }
      });
    }
  }
  return impacts;
}

export type TVStatus = 'IN_DEVELOPMENT' | 'ON_AIR' | 'ON_BUBBLE' | 'RENEWED' | 'CANCELLED' | 'SYNDICATED';

/**
 * Weekly TV Tick with integrated Nielsen ratings system.
 * Processes both player and rival series.
 */
export function tickTelevision(state: GameState, rng: RandomGenerator): StateImpact[] {
  const impacts: StateImpact[] = [
    ...tickPilots(state),
  ];

  // The Upfronts: Week 20
  if (state.week % 52 === 20) {
    impacts.push(...processUpfronts(state, rng));
  }
  
  // Collect all series from player and rivals
  const allSeries: SeriesProject[] = [];
  const airingShows: SeriesProject[] = [];

  const playerProjects = Object.values(state.studio.internal.projects);
  for (let i = 0; i < playerProjects.length; i++) {
    const p = playerProjects[i];
    if (p.type === 'SERIES' && 'tvDetails' in p) {
      const seriesProject = p as SeriesProject;
      allSeries.push(seriesProject);
      if (seriesProject.tvDetails.status === 'ON_AIR') {
        airingShows.push(seriesProject);
      }
    }
  }

  const rivals = state.industry.rivals;
  for (let i = 0; i < rivals.length; i++) {
    const rivalProjects = Object.values(rivals[i].projects || {});
    for (let j = 0; j < rivalProjects.length; j++) {
      const p = rivalProjects[j];
      if (p.type === 'SERIES' && 'tvDetails' in p) {
        const seriesProject = p as SeriesProject;
        allSeries.push(seriesProject);
        if (seriesProject.tvDetails.status === 'ON_AIR') {
          airingShows.push(seriesProject);
        }
      }
    }
  }
  const weekSnapshots = new Map<string, NielsenSnapshot>();

  // Phase 1: Generate Nielsen snapshots for all airing shows
  airingShows.forEach(project => {
    const aired = (project.tvDetails.episodesAired || 0) + 1;
    const snapshot = calculateNielsenRatings(project, aired, airingShows.length, rng);
    snapshot.week = state.week + 1;
    weekSnapshots.set(project.id, snapshot);
  });

  // Phase 2: Rank all shows by key demo
  const rankedSnapshots = rankShows(weekSnapshots);

  // Phase 3: Process each series
  allSeries.forEach(project => {
    if (project.tvDetails.status !== 'ON_AIR') return;

    const snapshot = rankedSnapshots.get(project.id);
    if (!snapshot) return;

    const aired = (project.tvDetails.episodesAired || 0) + 1;

    // Legacy rating (keep backward compat)
    const newRating = calculateWeeklyRating(project, project.buzz || 0, rng);
    const totalRatingSum = (project.tvDetails.averageRating * (project.tvDetails.episodesAired || 0)) + newRating;
    const nextAverageRating = Math.round((totalRatingSum / aired) * 10) / 10;

    // Renewal logic
    let nextStatus: TVStatus = project.tvDetails.status;
    if (aired >= project.tvDetails.episodesOrdered) {
      nextStatus = evaluateRenewal(project, nextAverageRating) as TVStatus;
    }

    // Build updated Nielsen profile
    const existingSnapshots = project.nielsenProfile?.snapshots || [];
    const timeSlot = project.nielsenProfile?.timeSlot || assignTimeSlot(project);
    const updatedSnapshots = [...existingSnapshots, snapshot];
    const nielsenProfile = buildNielsenProfile(updatedSnapshots, timeSlot);

    // Identify owner for impact
    const isPlayer = !!state.studio.internal.projects[project.id];
    const rival = state.industry.rivals.find(r => !!(r.projects || {})[project.id]);

    if (isPlayer) {
      impacts.push({
        type: 'PROJECT_UPDATED',
        payload: {
          projectId: project.id,
          update: {
            tvDetails: { ...project.tvDetails, episodesAired: aired, averageRating: nextAverageRating, status: nextStatus },
            nielsenProfile
          }
        }
      });
    } else if (rival) {
        // Correctly update rival project
        const updatedProject = {
            ...project,
            tvDetails: { ...project.tvDetails, episodesAired: aired, averageRating: nextAverageRating, status: nextStatus },
            nielsenProfile
        };
        impacts.push({
            type: 'RIVAL_UPDATED',
            payload: {
                rivalId: rival.id,
                update: {
                    projects: { ...rival.projects, [project.id]: updatedProject }
                }
            }
        });
    }

    if (nextStatus === 'CANCELLED') {
      const usesDeficit = project.dealModel === 'deficit_financing';
      if (usesDeficit) {
        // Deficit-financed cancelled show (Player or Rival) enters shopping window (4 weeks)
        const update = {
          state: 'shopping' as const,
          shoppingExpiresWeek: state.week + 4,
        };

        if (isPlayer) {
          impacts.push({
            type: 'PROJECT_UPDATED',
            payload: { projectId: project.id, update }
          });
        } else if (rival) {
          impacts.push({
            type: 'RIVAL_UPDATED',
            payload: {
              rivalId: rival.id,
              update: { projects: { ...rival.projects, [project.id]: { ...project, ...update } } }
            }
          });
        }

        impacts.push({
          type: 'NEWS_ADDED',
          payload: {
            id: `shopping-${project.id}`,
            headline: `"${project.title}" cancelled — shopping for new home`,
            description: `The series is now available for pickup by another network.`,
            category: 'cancellation'
          }
        });
      } else {
        impacts.push({
          type: isPlayer ? 'PROJECT_REMOVED' : 'RIVAL_UPDATED',
          payload: isPlayer
            ? { projectId: project.id }
            : { rivalId: rival?.id, update: { projects: { ...rival?.projects, [project.id]: { ...project, state: 'archived' } } } } as any
        });
      }
    }
  });

  // Phase 4: Handle Shopping Expiration
  const allProjects = [
    ...Object.values(state.studio.internal.projects),
    ...state.industry.rivals.flatMap(r => Object.values(r.projects || {}))
  ];

  allProjects.forEach(p => {
    if (p.state === 'shopping' && p.shoppingExpiresWeek && state.week >= p.shoppingExpiresWeek) {
      const isPlayer = !!state.studio.internal.projects[p.id];
      const rival = state.industry.rivals.find(r => !!(r.projects || {})[p.id]);

      impacts.push({
        type: isPlayer ? 'PROJECT_UPDATED' : 'RIVAL_UPDATED',
        payload: isPlayer
          ? { projectId: p.id, update: { state: 'archived' as const } }
          : { rivalId: rival?.id, update: { projects: { ...rival?.projects, [p.id]: { ...p, state: 'archived' as const } } } } as any
      });
    }
  });

  return impacts;
}

import { Award, AwardBody, AwardCategory, AwardsProfile, GameState, Project, Headline, StateImpact, NewsEvent } from '@/engine/types';
import { secureRandom } from '../utils';
import { AWARDS_CALENDAR, AWARD_CONFIGS } from '../data/awards.data';

export function generateAwardsProfile(project: Project): AwardsProfile {
  const basePrestige = (secureRandom() * 50) + (project.budget / 1000000) * 0.5;
  const baseCritic = secureRandom() * 100;

  return {
    criticScore: Math.min(100, Math.max(0, baseCritic)),
    audienceScore: Math.min(100, Math.max(0, secureRandom() * 100)),
    prestigeScore: Math.min(100, Math.max(0, basePrestige)),
    craftScore: Math.min(100, Math.max(0, secureRandom() * 100)),
    culturalHeat: Math.min(100, Math.max(0, secureRandom() * 100)),
    campaignStrength: 10,
    controversyRisk: Math.min(100, Math.max(0, secureRandom() * 30)),
    festivalBuzz: Math.min(100, Math.max(0, secureRandom() * 100)),
    academyAppeal: Math.min(100, Math.max(0, basePrestige * 0.8 + secureRandom() * 40)),
    guildAppeal: Math.min(100, Math.max(0, baseCritic * 0.7 + secureRandom() * 40)),
    populistAppeal: Math.min(100, Math.max(0, secureRandom() * 100)),
    indieCredibility: Math.min(100, Math.max(0, project.budgetTier === 'low' ? secureRandom() * 80 + 20 : secureRandom() * 30)),
    industryNarrativeScore: Math.min(100, Math.max(0, secureRandom() * 100))
  };
}

export function launchAwardsCampaign(project: Project, budget: number): StateImpact {
  if (!project.awardsProfile) return {};

  const boost = (budget / 1_000_000) * 5;
  const newStrength = Math.min(100, project.awardsProfile.campaignStrength + boost);

  return {
    cashChange: -budget,
    projectUpdates: [
      {
        projectId: project.id,
        update: {
          awardsProfile: {
            ...project.awardsProfile,
            campaignStrength: newStrength
          }
        }
      }
    ],
    newHeadlines: [
      {
        id: crypto.randomUUID(),
        week: 0,
        category: 'awards',
        text: `Studio launches massive FYC campaign for "${project.title}".`
      }
    ]
  };
}

export function runAwardsCeremony(projects: Project[], currentWeek: number, year: number): StateImpact {
  const weekOfYear = currentWeek % 52 === 0 ? 52 : currentWeek % 52;
  const bodiesThisWeek = AWARDS_CALENDAR[weekOfYear] || [];

  if (bodiesThisWeek.length === 0 || projects.length === 0) return {};

  const configsThisWeek = AWARD_CONFIGS.filter(config => bodiesThisWeek.includes(config.body));
  if (configsThisWeek.length === 0) return {};

  const eligibleFilm = projects.filter(p => 
    (p.status === 'released' || p.status === 'post_release' || p.status === 'archived') &&
    p.releaseWeek !== null &&
    p.releaseWeek > currentWeek - 52 &&
    p.awardsProfile !== undefined &&
    p.format === 'film'
  );
  
  const eligibleTv = projects.filter(p => 
    (p.status === 'released' || p.status === 'post_release' || p.status === 'archived') &&
    p.releaseWeek !== null &&
    p.releaseWeek > currentWeek - 52 &&
    p.awardsProfile !== undefined &&
    p.format === 'tv'
  );

  const impact: StateImpact = {
    prestigeChange: 0,
    newHeadlines: [],
    newsEvents: []
  };

  for (const config of configsThisWeek) {
    let candidates = config.format === 'film' ? eligibleFilm : (config.format === 'tv' ? eligibleTv : [...eligibleFilm, ...eligibleTv]);
    if (candidates.length === 0) continue;

    let bestProject = candidates[0];
    let bestScore = -1;

    for (const p of candidates) {
      const score = config.evaluator(p) * (1 + (p.awardsProfile?.campaignStrength || 0) / 100);
      if (score > bestScore) {
        bestScore = score;
        bestProject = p;
      }
    }

    if (bestScore > 150) {
      impact.prestigeChange! += 10;
      impact.newHeadlines!.push({
        id: `award-headline-${crypto.randomUUID()}`,
        week: currentWeek,
        category: 'awards',
        text: `🏆 "${bestProject.title}" won ${config.category} at the ${config.body}!`
      });
      impact.newsEvents!.push({
        type: 'AWARD',
        headline: `${bestProject.title} Wins ${config.category}!`,
        description: `In a stunning victory at the ${config.body}, "${bestProject.title}" took home the top prize for ${config.category}.`,
        impact: '+10 Prestige'
      });
    } else if (bestScore > 100) {
      impact.prestigeChange! += 2;
      impact.newHeadlines!.push({
        id: `nom-headline-${crypto.randomUUID()}`,
        week: currentWeek,
        category: 'awards',
        text: `⭐ "${bestProject.title}" was nominated for ${config.category} at the ${config.body}.`
      });
    }
  }

  return impact;
}

export function processRazzies(projects: Project[], talents: any[], currentWeek: number): StateImpact {
  const eligibleProjects = projects.filter(p =>
    p.status === 'released' &&
    p.budget >= 50_000_000 &&
    (p.reviewScore !== undefined && p.reviewScore <= 30)
  );

  if (eligibleProjects.length === 0) return {};

  const worstPicture = eligibleProjects.reduce((worst, p) =>
    (p.reviewScore! < worst.reviewScore!) ? p : worst
  );

  const impact: StateImpact = {
    prestigeChange: -10,
    newHeadlines: [
      {
        id: crypto.randomUUID(),
        week: currentWeek,
        category: 'razzies',
        text: `The Razzies: "${worstPicture.title}" sweeps the board with a historic Worst Picture win.`
      }
    ],
    newsEvents: [
      {
        type: 'AWARD',
        headline: `Razzies: ${worstPicture.title} Named Worst Picture`,
        description: `The Golden Raspberry Awards have spoken, and "${worstPicture.title}" is officially the worst film of the year.`,
        impact: '-10 Prestige'
      }
    ]
  };

  // Cult classic logic
  const isAbsurd = worstPicture.genre === 'Drama' || (worstPicture.flavor && worstPicture.flavor.toLowerCase().match(/absurd|ridiculous|bizarre|insane/));
  if (isAbsurd || secureRandom() > 0.5) {
     impact.cultClassicProjectId = worstPicture.id;
  }

  return impact;
}

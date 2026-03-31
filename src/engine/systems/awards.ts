import { Award, AwardBody, AwardCategory, AwardsProfile, GameState, Project, Headline, NewsEvent } from '@/engine/types';
import { secureRandom } from '../utils';
import { StateImpact } from '../types/state.types';
import { 
  AWARDS_CALENDAR, 
  AWARD_CONFIGS, 
  CANNES_EQUIVALENTS, 
  SUNDANCE_EQUIVALENTS 
} from '../data/awards.data';

export function isCannesEquivalentFestival(body: AwardBody | string): boolean {
  return CANNES_EQUIVALENTS.includes(body as AwardBody);
}

export function isSundanceEquivalentFestival(body: AwardBody | string): boolean {
  return SUNDANCE_EQUIVALENTS.includes(body as AwardBody);
}

export function isMajorCategoryNomination(category: AwardCategory | string): boolean {
  return ['Best Director', 'Best Actor', 'Best Actress', 'Palme d\'Or', 'Golden Lion', 'Golden Bear', 'Grand Jury Prize'].includes(category as any);
}

export function isSupportingCategoryNomination(category: AwardCategory | string): boolean {
  return ['Best Supporting Actor', 'Best Supporting Actress'].includes(category as any);
}

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

export function launchAwardsCampaign(state: GameState, projectId: string, budget: number): StateImpact | null {
  const project = state.studio.internal.projects[projectId];
  if (!project || state.finance.cash < budget || !project.awardsProfile) return null;

  const boost = (budget / 1_000_000) * 5;
  const newStrength = Math.min(100, project.awardsProfile.campaignStrength + boost);

  return {
    cashChange: -budget,
    projectUpdates: [{
      projectId,
      update: {
        awardsProfile: {
          ...project.awardsProfile,
          campaignStrength: newStrength
        }
      }
    }],
    newHeadlines: [{
      week: state.week,
      category: 'awards',
      text: `Studio launches massive FYC campaign for "${project.title}".`
    }]
  };
}

export function runAwardsCeremony(state: GameState, currentWeek: number, year: number): StateImpact {
  const impact: StateImpact = {
    newAwards: [],
    prestigeChange: 0,
    newHeadlines: [],
    uiNotifications: [],
    newsEvents: []
  };

  const weekOfYear = currentWeek % 52 === 0 ? 52 : currentWeek % 52;
  const bodiesThisWeek = AWARDS_CALENDAR[weekOfYear] || [];
  if (bodiesThisWeek.length === 0) return impact;

  const configsThisWeek = AWARD_CONFIGS.filter(config => bodiesThisWeek.includes(config.body));
  if (configsThisWeek.length === 0) return impact;

  const eligibleFilm: Project[] = [];
  const eligibleTv: Project[] = [];

  for (const p of Object.values(state.studio.internal.projects)) {
    if ((p.state === 'released' || p.state === 'post_release' || p.state === 'archived') &&
        p.releaseWeek !== null &&
        p.releaseWeek > currentWeek - 52 &&
        p.awardsProfile !== undefined) {
      if (p.format === 'film') eligibleFilm.push(p);
      else if (p.format === 'tv') eligibleTv.push(p);
    }
  }

  if (eligibleFilm.length === 0 && eligibleTv.length === 0) return impact;

  for (const config of configsThisWeek) {
    let candidates: Project[];
    if (config.format === 'film') candidates = eligibleFilm;
    else if (config.format === 'tv') candidates = eligibleTv;
    else candidates = [...eligibleFilm, ...eligibleTv];

    if (candidates.length === 0) continue;

    let bestProject = candidates[0];
    let bestScore = -1;

    for (const p of candidates) {
      const score = (config.evaluator(p) || 0) * (1 + (p.awardsProfile?.campaignStrength || 0) / 25);
      if (score > bestScore) {
        bestScore = score;
        bestProject = p;
      }
    }

    if (bestScore > 150) {
      impact.newAwards!.push({
        id: `award-${crypto.randomUUID()}`,
        projectId: bestProject.id,
        name: config.category,
        category: config.category,
        body: config.body,
        status: 'won',
        year
      });
      impact.prestigeChange! += 10;
      impact.uiNotifications!.push(`🏆 "${bestProject.title}" won ${config.category} at the ${config.body}!`);
      impact.newsEvents!.push({
        type: 'AWARD',
        headline: `${bestProject.title} Wins ${config.category}!`,
        description: `In a stunning victory at the ${config.body}, "${bestProject.title}" took home the top prize for ${config.category}.`,
      });
      impact.newHeadlines!.push({
        week: currentWeek,
        category: 'awards',
        text: `BREAKING: "${bestProject.title}" wins ${config.category} at the ${config.body}!`
      });
    } else if (bestScore > 100) {
      impact.newAwards!.push({
        id: `award-${crypto.randomUUID()}`,
        projectId: bestProject.id,
        name: config.category,
        category: config.category,
        body: config.body,
        status: 'nominated',
        year
      });
      impact.prestigeChange! += 2;
      impact.uiNotifications!.push(`⭐ "${bestProject.title}" was nominated for ${config.category} at the ${config.body}.`);
    }
  }

  return impact;
}

export function processRazzies(state: GameState, week: number): StateImpact {
  const impact: StateImpact = {
    uiNotifications: [],
    prestigeChange: 0,
    newHeadlines: [],
    newsEvents: [],
    projectUpdates: [],
    talentUpdates: []
  };

  const eligibleProjects = Object.values(state.studio.internal.projects).filter(p =>
    p.state === 'released' &&
    p.budget >= 50_000_000 &&
    (p.reviewScore !== undefined && p.reviewScore <= 30)
  );

  if (eligibleProjects.length === 0) return impact;

  const worstPicture = eligibleProjects.reduce((worst, p) =>
    (p.reviewScore! < worst.reviewScore!) ? p : worst
  );

  impact.uiNotifications!.push(`"${worstPicture.title}" has 'won' Worst Picture at The Razzies! A catastrophic failure.`);
  impact.newHeadlines!.push({
    week,
    category: 'awards',
    text: `The Razzies Nominees Announced! "${worstPicture.title}" sweeps the board with a historic Worst Picture win.`
  });
  impact.newsEvents!.push({
    type: 'AWARD',
    headline: `Razzies: ${worstPicture.title} Named Worst Picture`,
    description: `The Golden Raspberry Awards have spoken, and "${worstPicture.title}" is officially the worst film of the year.`,
  });
  impact.prestigeChange = -10;

  const isAbsurd = worstPicture.genre === 'Drama' || (worstPicture.flavor && worstPicture.flavor.toLowerCase().match(/absurd|ridiculous|bizarre|insane/));
  if (isAbsurd || secureRandom() > 0.5) {
     impact.cultClassicProjectIds = [worstPicture.id];
  }

  const projectContracts = state.studio.internal.contracts.filter(c => c.projectId === worstPicture.id);
  const contractTalentIds = new Set(projectContracts.map(c => c.talentId));

  let worstLeadId: string | null = null;
  let highestDraw = 0;
  let worstLeadName: string | null = null;

  for (const talent of Object.values(state.industry.talentPool)) {
      if (contractTalentIds.has(talent.id)) {
          if (talent.draw > 70 && talent.draw > highestDraw) {
              worstLeadId = talent.id;
              highestDraw = talent.draw;
              worstLeadName = talent.name;
          }
      }
  }

  if (worstLeadId && worstLeadName) {
     impact.razzieWinnerTalents = [worstLeadId];
     impact.uiNotifications!.push(`${worstLeadName} won Worst Lead for "${worstPicture.title}", absolutely devastating their ego.`);
     
     impact.projectUpdates!.push({
       projectId: worstPicture.id,
       update: {
         activeCrisis: {
           description: `The Razzies have destroyed ${worstLeadName}'s ego. They are having a meltdown on set of their next project, or refusing to promote this one.`,
           resolved: false,
           severity: 'high',
           options: [
             { text: 'Apologize for being "misunderstood"', effectDescription: 'Lose 10 buzz.', buzzPenalty: 10 },
             { text: 'Ignore the noise', effectDescription: 'Lose $500k in PR damage.', cashPenalty: 500000 }
           ]
         }
       }
     });
  }

  return impact;
}

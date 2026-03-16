import { Award, AwardBody, AwardCategory, AwardsProfile, GameState, Project } from '../types';

export function generateAwardsProfile(project: Project): AwardsProfile {
  // Base values heavily randomized for now, could be tied to budget, talent, etc.
  const basePrestige = (Math.random() * 50) + (project.budget / 1000000) * 0.5;
  const baseCritic = Math.random() * 100;

  return {
    criticScore: Math.min(100, Math.max(0, baseCritic)),
    audienceScore: Math.min(100, Math.max(0, Math.random() * 100)),
    prestigeScore: Math.min(100, Math.max(0, basePrestige)),
    craftScore: Math.min(100, Math.max(0, Math.random() * 100)),
    culturalHeat: Math.min(100, Math.max(0, Math.random() * 100)),
    campaignStrength: 10, // Default baseline, player can boost
    controversyRisk: Math.min(100, Math.max(0, Math.random() * 30)),
    festivalBuzz: Math.min(100, Math.max(0, Math.random() * 100)),

    // Hidden values
    academyAppeal: Math.min(100, Math.max(0, basePrestige * 0.8 + Math.random() * 40)),
    guildAppeal: Math.min(100, Math.max(0, baseCritic * 0.7 + Math.random() * 40)),
    populistAppeal: Math.min(100, Math.max(0, Math.random() * 100)),
    indieCredibility: Math.min(100, Math.max(0, project.budgetTier === 'low' ? Math.random() * 80 + 20 : Math.random() * 30)),
    industryNarrativeScore: Math.min(100, Math.max(0, Math.random() * 100))
  };
}

export interface AwardCeremonyResult {
  newAwards: Award[];
  prestigeChange: number;
  projectUpdates: string[];
}

// Define when ceremonies happen within a 52-week year
export const AWARDS_CALENDAR: Record<number, AwardBody[]> = {
  2: ['Golden Globes'],
  3: ['Critics Choice Awards'],
  4: ['SAG Awards'],
  5: ['Directors Guild Awards'],
  6: ['Producers Guild Awards'],
  7: ['Writers Guild Awards', 'BAFTAs'],
  8: ['Annie Awards'],
  9: ['Independent Spirit Awards'],
  10: ['Academy Awards'],
  20: ['Peabody Awards'],
  37: ['Primetime Emmys']
};

interface AwardConfig {
  body: AwardBody;
  category: AwardCategory;
  format: 'film' | 'tv' | 'both';
  evaluator: (p: Project) => number;
}

const AWARD_CONFIGS: AwardConfig[] = [
  // --- ACADEMY AWARDS (Oscars) ---
  {
    body: 'Academy Awards', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.academyAppeal || 0) + (p.awardsProfile?.prestigeScore || 0) + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5
  },
  {
    body: 'Academy Awards', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.academyAppeal || 0) * 0.8
  },
  {
    body: 'Academy Awards', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.buzz || 0) * 0.5
  },

  // --- PRIMETIME EMMYS ---
  {
    body: 'Primetime Emmys', category: 'Best Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.criticScore || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5
  },

  // --- GOLDEN GLOBES ---
  {
    body: 'Golden Globes', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.populistAppeal || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.buzz / 2)
  },
  {
    body: 'Golden Globes', category: 'Best Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.populistAppeal || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.buzz / 2)
  },

  // --- INDEPENDENT SPIRIT AWARDS ---
  {
    body: 'Independent Spirit Awards', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 2 + (p.awardsProfile?.criticScore || 0)
  },

  // --- BAFTAS ---
  {
    body: 'BAFTAs', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0)
  },
  {
    body: 'BAFTAs', category: 'Best Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0)
  },

  // --- SAG AWARDS ---
  {
    body: 'SAG Awards', category: 'Best Ensemble', format: 'both',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 0.5 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5 + (p.buzz || 0)
  },

  // --- GUILDS ---
  {
    body: 'Directors Guild Awards', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    body: 'Producers Guild Awards', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.prestigeScore || 0) * 0.8 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5
  },
  {
    body: 'Writers Guild Awards', category: 'Best Screenplay', format: 'both',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5
  },

  // --- CRITICS CHOICE ---
  {
    body: 'Critics Choice Awards', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.criticScore || 0) * 2
  },
  {
    body: 'Critics Choice Awards', category: 'Best Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.criticScore || 0) * 2
  },

  // --- ANNIE AWARDS ---
  {
    body: 'Annie Awards', category: 'Best Animated Feature', format: 'film',
    evaluator: p => (p.genre === 'Animation' ? 200 : 0) + (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.audienceScore || 0)
  },

  // --- PEABODY AWARDS ---
  {
    body: 'Peabody Awards', category: 'Special Achievement', format: 'tv',
    evaluator: p => (p.awardsProfile?.culturalHeat || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0)
  }
];

export function runAwardsCeremony(state: GameState, currentWeek: number, year: number): AwardCeremonyResult {
  const newAwards: Award[] = [];
  const projectUpdates: string[] = [];
  let prestigeChange = 0;

  const weekOfYear = currentWeek % 52 === 0 ? 52 : currentWeek % 52;
  const bodiesThisWeek = AWARDS_CALENDAR[weekOfYear] || [];

  if (bodiesThisWeek.length === 0) {
    return { newAwards, prestigeChange, projectUpdates };
  }

  // Find eligible projects (released within the last 52 weeks relative to the ceremony)
  const eligibleProjects = state.projects.filter(
    p => (p.status === 'released' || p.status === 'archived') &&
         p.releaseWeek !== null &&
         p.releaseWeek > currentWeek - 52 &&
         p.awardsProfile !== undefined
  );

  if (eligibleProjects.length === 0) {
    return { newAwards, prestigeChange, projectUpdates };
  }

  // Helper to evaluate a specific award
  const evaluateAward = (config: AwardConfig) => {
    const candidates = eligibleProjects.filter(p => config.format === 'both' || p.format === config.format);
    if (candidates.length === 0) return;

    // Score all candidates
    const scored = candidates.map(p => ({
      project: p,
      score: config.evaluator(p) * (1 + (p.awardsProfile?.campaignStrength || 0) / 100) // Campaign boosts score
    })).sort((a, b) => b.score - a.score);

    // Top scorer wins, next few nominated (simplified logic)
    const winner = scored[0];

    // Threshold to actually win (don't give out awards if the year was terrible)
    if (winner.score > 150) {
      newAwards.push({
        id: `award-${crypto.randomUUID()}`,
        projectId: winner.project.id,
        name: config.category,
        category: config.category,
        body: config.body,
        status: 'won',
        year
      });
      prestigeChange += 10;
      projectUpdates.push(`🏆 "${winner.project.title}" won ${config.category} at the ${config.body}!`);
    } else if (winner.score > 100) {
       newAwards.push({
        id: `award-${crypto.randomUUID()}`,
        projectId: winner.project.id,
        name: config.category,
        category: config.category,
        body: config.body,
        status: 'nominated',
        year
      });
      prestigeChange += 2;
      projectUpdates.push(`⭐ "${winner.project.title}" was nominated for ${config.category} at the ${config.body}.`);
    }
  };

  // Evaluate all configs for bodies present this week
  for (const config of AWARD_CONFIGS) {
    if (bodiesThisWeek.includes(config.body)) {
      evaluateAward(config);
    }
  }

  return { newAwards, prestigeChange, projectUpdates };
}

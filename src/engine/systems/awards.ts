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
  const evaluateAward = (
    body: AwardBody,
    category: AwardCategory,
    evaluator: (p: Project) => number,
    formatFilter: 'film' | 'tv' | 'unscripted' | 'both' = 'both'
  ) => {
        // Filter and score candidates in a single pass
    const scored = eligibleProjects.reduce((acc, p) => {
      if (formatFilter === 'both' || p.format === formatFilter) {
        acc.push({
          project: p,
          score: evaluator(p) * (1 + (p.awardsProfile?.campaignStrength || 0) / 100)
        });
      }
      return acc;
    }, [] as { project: Project, score: number }[]).sort((a, b) => b.score - a.score);

    if (scored.length === 0) return;

    // Top scorer wins, next few nominated (simplified logic)
    const winner = scored[0];

    // Threshold to actually win (don't give out awards if the year was terrible)
    if (winner.score > 150) {
      newAwards.push({
        id: `award-${crypto.randomUUID()}`,
        projectId: winner.project.id,
        name: category,
        category: category,
        body: body,
        status: 'won',
        year
      });
      prestigeChange += 10;
      projectUpdates.push(`🏆 "${winner.project.title}" won ${category} at the ${body}!`);
    } else if (winner.score > 100) {
       newAwards.push({
        id: `award-${crypto.randomUUID()}`,
        projectId: winner.project.id,
        name: category,
        category: category,
        body: body,
        status: 'nominated',
        year
      });
      prestigeChange += 2;
      projectUpdates.push(`⭐ "${winner.project.title}" was nominated for ${category} at the ${body}.`);
    }
  };

  // --- ACADEMY AWARDS (Oscars) ---
  if (bodiesThisWeek.includes('Academy Awards')) {
    evaluateAward('Academy Awards', 'Best Picture', p =>
      (p.awardsProfile?.academyAppeal || 0) + (p.awardsProfile?.prestigeScore || 0) + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5,
      'film'
    );
    evaluateAward('Academy Awards', 'Best Director', p =>
      (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.academyAppeal || 0) * 0.8,
      'film'
    );
    evaluateAward('Academy Awards', 'Best Actor', p =>
      (p.awardsProfile?.craftScore || 0) + (p.buzz || 0) * 0.5,
      'film'
    );
  }


  // --- PRIMETIME EMMYS ---
  if (bodiesThisWeek.includes('Primetime Emmys')) {
    evaluateAward('Primetime Emmys', 'Best Series', p =>
      (p.awardsProfile?.criticScore || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5,
      'tv'
    );
    evaluateAward('Primetime Emmys', 'Best Documentary', p =>
      (p.awardsProfile?.criticScore || 0) * 1.5 + (p.awardsProfile?.industryNarrativeScore || 0),
      'unscripted'
    );
  }

  // --- GOLDEN GLOBES ---
  if (bodiesThisWeek.includes('Golden Globes')) {
    evaluateAward('Golden Globes', 'Best Picture', p =>
      (p.awardsProfile?.populistAppeal || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.buzz / 2),
      'film'
    );
    evaluateAward('Golden Globes', 'Best Series', p =>
      (p.awardsProfile?.populistAppeal || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.buzz / 2),
      'tv'
    );
  }

  // --- INDEPENDENT SPIRIT AWARDS ---
  if (bodiesThisWeek.includes('Independent Spirit Awards')) {
    evaluateAward('Independent Spirit Awards', 'Best Picture', p =>
      (p.awardsProfile?.indieCredibility || 0) * 2 + (p.awardsProfile?.criticScore || 0),
      'film'
    );
  }

  // --- BAFTAS ---
  if (bodiesThisWeek.includes('BAFTAs')) {
    evaluateAward('BAFTAs', 'Best Picture', p =>
      (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0),
      'film'
    );
    evaluateAward('BAFTAs', 'Best Series', p =>
      (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0),
      'tv'
    );
  }

  // --- SAG AWARDS ---
  if (bodiesThisWeek.includes('SAG Awards')) {
    evaluateAward('SAG Awards', 'Best Ensemble', p =>
      (p.awardsProfile?.craftScore || 0) * 0.5 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5 + (p.buzz || 0),
      'both'
    );
  }

  // --- GUILDS ---
  if (bodiesThisWeek.includes('Directors Guild Awards')) {
    evaluateAward('Directors Guild Awards', 'Best Director', p =>
      (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0) * 0.8,
      'film'
    );
  }
  if (bodiesThisWeek.includes('Producers Guild Awards')) {
    evaluateAward('Producers Guild Awards', 'Best Picture', p =>
      (p.awardsProfile?.prestigeScore || 0) * 0.8 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5,
      'film'
    );
  }
  if (bodiesThisWeek.includes('Writers Guild Awards')) {
    evaluateAward('Writers Guild Awards', 'Best Screenplay', p =>
      (p.awardsProfile?.craftScore || 0) * 1.5,
      'both'
    );
  }

  // --- CRITICS CHOICE ---
  if (bodiesThisWeek.includes('Critics Choice Awards')) {
    evaluateAward('Critics Choice Awards', 'Best Picture', p =>
      (p.awardsProfile?.criticScore || 0) * 2,
      'film'
    );
    evaluateAward('Critics Choice Awards', 'Best Series', p =>
      (p.awardsProfile?.criticScore || 0) * 2,
      'tv'
    );
  }

  // --- ANNIE AWARDS ---
  if (bodiesThisWeek.includes('Annie Awards')) {
    evaluateAward('Annie Awards', 'Best Animated Feature', p =>
      (p.genre === 'Animation' ? 200 : 0) + (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.audienceScore || 0),
      'film'
    );
  }

  // --- PEABODY AWARDS ---
  if (bodiesThisWeek.includes('Peabody Awards')) {
    evaluateAward('Peabody Awards', 'Special Achievement', p =>
      (p.awardsProfile?.culturalHeat || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0),
      'tv'
    );
  }

  return { newAwards, prestigeChange, projectUpdates };
}

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

export function runAwardsCeremony(state: GameState, year: number): AwardCeremonyResult {
  const newAwards: Award[] = [];
  const projectUpdates: string[] = [];
  let prestigeChange = 0;

  // Find eligible projects (released this year)
  // We approximate "this year" as released within the last 52 weeks
  const eligibleProjects = state.projects.filter(
    p => (p.status === 'released' || p.status === 'archived') &&
         p.releaseWeek !== null &&
         p.releaseWeek > state.week - 52 &&
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
    formatFilter: 'film' | 'tv' | 'both' = 'both'
  ) => {
        // Filter and score candidates in a single pass
    const scored = eligibleProjects.reduce((acc, p) => {
      if (formatFilter === 'both' || p.format === formatFilter) {
        acc.push({
          project: p,
          score: evaluator(p) * (1 + (p.awardsProfile?.campaignStrength || 0) / 100) // Campaign boosts score
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
  evaluateAward('Academy Awards', 'Best Picture', p =>
    (p.awardsProfile?.academyAppeal || 0) + (p.awardsProfile?.prestigeScore || 0) + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5,
    'film'
  );
  evaluateAward('Academy Awards', 'Best Director', p =>
    (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.academyAppeal || 0) * 0.8,
    'film'
  );

  // --- PRIMETIME EMMYS ---
  evaluateAward('Primetime Emmys', 'Best Series', p =>
    (p.awardsProfile?.criticScore || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5,
    'tv'
  );

  // --- GOLDEN GLOBES ---
  evaluateAward('Golden Globes', 'Best Picture', p =>
    (p.awardsProfile?.populistAppeal || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.buzz / 2),
    'both' // Simplifying to both for now
  );

  // --- INDEPENDENT SPIRIT AWARDS ---
  evaluateAward('Independent Spirit Awards', 'Best Picture', p =>
    (p.awardsProfile?.indieCredibility || 0) * 2 + (p.awardsProfile?.criticScore || 0),
    'film'
  );

  // --- BAFTAS ---
  evaluateAward('BAFTAs', 'Best Picture', p =>
    (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0),
    'both'
  );

  return { newAwards, prestigeChange, projectUpdates };
}

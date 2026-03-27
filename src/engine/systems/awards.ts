import { Award, AwardBody, AwardCategory, AwardsProfile, GameState, Project, Headline } from '@/engine/types';

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

export function launchAwardsCampaign(state: GameState, projectId: string, budget: number): GameState | null {
  const projectIndex = state.studio.internal.projects.findIndex(p => p.id === projectId);
  if (projectIndex === -1 || state.cash < budget) return null;
  const project = state.studio.internal.projects[projectIndex];
  if (!project.awardsProfile) return null;

  // Assuming $1M buys 5 points of campaign strength
  const boost = (budget / 1_000_000) * 5;
  const newStrength = Math.min(100, project.awardsProfile.campaignStrength + boost);

  const newProjects = [...state.studio.internal.projects];
  newProjects[projectIndex] = {
    ...project,
    awardsProfile: {
      ...project.awardsProfile,
      campaignStrength: newStrength
    }
  };

  const newHeadline: Headline = {
    id: crypto.randomUUID(),
    week: state.week,
    category: 'awards' as const, 
    text: `Studio launches massive FYC campaign for "${project.title}".`
  };

  return {
    ...state,
    cash: state.cash - budget,
    studio: {
      ...state.studio,
      internal: {
        ...state.studio.internal,
        projects: newProjects
      }
    },
    industry: {
      ...state.industry,
      headlines: [newHeadline, ...state.industry.headlines].slice(0, 50)
    }
  };
}

interface AwardCeremonyResult {
  newAwards: Award[];
  prestigeChange: number;
  projectUpdates: string[];
  newsEvents: Omit<import('../types').NewsEvent, 'id' | 'week'>[];
}

// Define when ceremonies happen within a 52-week year
export const AWARDS_CALENDAR: Record<number, AwardBody[]> = {
  2: ['Golden Globes'],
  3: ['Sundance Film Festival'],
  4: ['Critics Choice Awards'],
  5: ['SAG Awards'],
  6: ['Directors Guild Awards'],
  7: ['Producers Guild Awards', 'Berlin International Film Festival'],
  8: ['Writers Guild Awards', 'BAFTAs'],
  9: ['Annie Awards', 'Independent Spirit Awards'],
  10: ['Academy Awards'],
  11: ['SXSW Film Festival'],
  15: ['Tribeca Film Festival'],
  20: ['Peabody Awards'],
  21: ['Cannes Film Festival'],
  34: ['Venice Film Festival', 'Telluride Film Festival'],
  35: ['Toronto International Film Festival'],
  36: ['Slamdance Film Festival'],
  37: ['Primetime Emmys']
};
AWARDS_CALENDAR[4] = ['Critics Choice Awards', 'The Razzies']; // Razzie week is usually week 4

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
  {
    body: 'Academy Awards', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.buzz || 0) * 0.5
  },
  {
    body: 'Academy Awards', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 0.8 + (p.buzz || 0) * 0.4
  },
  {
    body: 'Academy Awards', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 0.8 + (p.buzz || 0) * 0.4
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

  // --- BAFTAs ---
  {
    body: 'BAFTAs', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0)
  },
  {
    body: 'BAFTAs', category: 'Best Series', format: 'tv',
    evaluator: p => (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0)
  },
  {
    body: 'BAFTAs', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 0.8 + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },
  {
    body: 'BAFTAs', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 0.8 + (p.awardsProfile?.prestigeScore || 0) * 0.5
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
  },

  // --- CANNES FILM FESTIVAL ---
  {
    body: 'Cannes Film Festival', category: 'Palme d\'Or', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0) * 1.2
  },
  {
    body: 'Cannes Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    body: 'Cannes Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 2 + (p.awardsProfile?.indieCredibility || 0) * 0.5
  },
  {
    body: 'Cannes Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    body: 'Cannes Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    body: 'Cannes Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.6
  },
  {
    body: 'Cannes Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.6
  },
  {
    body: 'Cannes Film Festival', category: 'Best Screenplay', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.8 + (p.awardsProfile?.indieCredibility || 0) * 0.8
  },

  // --- SUNDANCE FILM FESTIVAL ---
  {
    body: 'Sundance Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 2 + (p.awardsProfile?.criticScore || 0)
  },
  {
    body: 'Sundance Film Festival', category: 'Audience Award', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.audienceScore || 0) * 1.5
  },
  {
    body: 'Sundance Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.craftScore || 0)
  },
  {
    body: 'Sundance Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) + (p.awardsProfile?.criticScore || 0) * 0.8
  },
  {
    body: 'Sundance Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) + (p.awardsProfile?.criticScore || 0) * 0.8
  },
  {
    body: 'Sundance Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 0.8 + (p.awardsProfile?.criticScore || 0) * 0.5
  },
  {
    body: 'Sundance Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 0.8 + (p.awardsProfile?.criticScore || 0) * 0.5
  },
  {
    body: 'Sundance Film Festival', category: 'Best Screenplay', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.craftScore || 0) * 0.5
  },

  // --- BERLIN INTERNATIONAL FILM FESTIVAL ---
  {
    body: 'Berlin International Film Festival', category: 'Golden Bear', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0) * 1.2
  },
  {
    body: 'Berlin International Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    body: 'Berlin International Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 2 + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },
  {
    body: 'Berlin International Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    body: 'Berlin International Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    body: 'Berlin International Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    body: 'Berlin International Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    body: 'Berlin International Film Festival', category: 'Best Screenplay', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.8 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.8
  },

  // --- VENICE FILM FESTIVAL ---
  {
    body: 'Venice Film Festival', category: 'Golden Lion', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0) * 1.5
  },
  {
    body: 'Venice Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.2
  },
  {
    body: 'Venice Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 2 + (p.awardsProfile?.prestigeScore || 0) * 0.5
  },
  {
    body: 'Venice Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    body: 'Venice Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    body: 'Venice Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    body: 'Venice Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.0 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    body: 'Venice Film Festival', category: 'Best Screenplay', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.8 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.8
  },

  // --- TORONTO INTERNATIONAL FILM FESTIVAL ---
  {
    body: 'Toronto International Film Festival', category: 'Audience Award', format: 'film',
    evaluator: p => (p.awardsProfile?.audienceScore || 0) * 1.5 + (p.awardsProfile?.populistAppeal || 0)
  },
  {
    body: 'Toronto International Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.populistAppeal || 0) * 0.5
  },
  {
    body: 'Toronto International Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.populistAppeal || 0) * 0.8
  },
  {
    body: 'Toronto International Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.populistAppeal || 0) * 0.8
  },

  // --- SXSW FILM FESTIVAL ---
  {
    body: 'SXSW Film Festival', category: 'Audience Award', format: 'film',
    evaluator: p => (p.awardsProfile?.audienceScore || 0) * 1.2 + (p.awardsProfile?.culturalHeat || 0) * 1.2
  },
  {
    body: 'SXSW Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.culturalHeat || 0) * 1.0
  },
  {
    body: 'SXSW Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.culturalHeat || 0) * 1.0
  },
  {
    body: 'SXSW Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.culturalHeat || 0) * 1.0
  },

  // --- TRIBECA FILM FESTIVAL ---
  {
    body: 'Tribeca Film Festival', category: 'Best Narrative Feature', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.industryNarrativeScore || 0)
  },
  {
    body: 'Tribeca Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.craftScore || 0) * 0.8
  },
  {
    body: 'Tribeca Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.craftScore || 0) * 0.5
  },
  {
    body: 'Tribeca Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.2 + (p.awardsProfile?.craftScore || 0) * 0.5
  },

  // --- TELLURIDE FILM FESTIVAL (Cannes Equivalent) ---
  {
    body: 'Telluride Film Festival', category: 'Best Picture', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.8 + (p.awardsProfile?.prestigeScore || 0) * 1.2
  },
  {
    body: 'Telluride Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 2.0 + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5
  },
  {
    body: 'Telluride Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    body: 'Telluride Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.5 + (p.awardsProfile?.prestigeScore || 0) * 1.0
  },
  {
    body: 'Telluride Film Festival', category: 'Best Supporting Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },
  {
    body: 'Telluride Film Festival', category: 'Best Supporting Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.craftScore || 0) * 1.2 + (p.awardsProfile?.prestigeScore || 0) * 0.8
  },

  // --- SLAMDANCE FILM FESTIVAL (Sundance Equivalent) ---
  {
    body: 'Slamdance Film Festival', category: 'Grand Jury Prize', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 2.5 + (p.awardsProfile?.culturalHeat || 0) * 0.5
  },
  {
    body: 'Slamdance Film Festival', category: 'Best Director', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 2.0 + (p.awardsProfile?.craftScore || 0) * 0.5
  },
  {
    body: 'Slamdance Film Festival', category: 'Best Actor', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.craftScore || 0) * 0.5
  },
  {
    body: 'Slamdance Film Festival', category: 'Best Actress', format: 'film',
    evaluator: p => (p.awardsProfile?.indieCredibility || 0) * 1.5 + (p.awardsProfile?.craftScore || 0) * 0.5
  }
];

export function runAwardsCeremony(state: GameState, currentWeek: number, year: number): AwardCeremonyResult {
  const newAwards: Award[] = [];
  const projectUpdates: string[] = [];
  let prestigeChange = 0;

  const weekOfYear = currentWeek % 52 === 0 ? 52 : currentWeek % 52;
  const bodiesThisWeek = AWARDS_CALENDAR[weekOfYear] || [];

  if (bodiesThisWeek.length === 0) {
    return { newAwards, prestigeChange, projectUpdates, newsEvents: [] };
  }

  // ⚡ Bolt: Pre-filter configs so we don't process projects if no matching body exists
  const configsThisWeek = AWARD_CONFIGS.filter(config => bodiesThisWeek.includes(config.body));
  if (configsThisWeek.length === 0) {
    return { newAwards, prestigeChange, projectUpdates, newsEvents: [] };
  }

  // ⚡ Bolt: O(1) early exit for zero eligible projects
  if (state.studio.internal.projects.length === 0) {
    return { newAwards, prestigeChange, projectUpdates, newsEvents: [] };
  }

  // ⚡ Bolt: Find eligible projects (released within the last 52 weeks relative to the ceremony)
  const eligibleFilm: Project[] = [];
  const eligibleTv: Project[] = [];

  for (let k = 0; k < state.studio.internal.projects.length; k++) {
    const p = state.studio.internal.projects[k];
    if ((p.status === 'released' || p.status === 'post_release' || p.status === 'archived') &&
        p.releaseWeek !== null &&
        p.releaseWeek > currentWeek - 52 &&
        p.awardsProfile !== undefined) {
      if (p.format === 'film') eligibleFilm.push(p);
      else if (p.format === 'tv') eligibleTv.push(p);
    }
  }

  if (eligibleFilm.length === 0 && eligibleTv.length === 0) {
    return { newAwards, prestigeChange, projectUpdates, newsEvents: [] };
  }

  const newsEvents: Omit<import('../types').NewsEvent, 'id' | 'week'>[] = [];

  // Evaluate all configs for bodies present this week
  for (let i = 0; i < configsThisWeek.length; i++) {
    const config = configsThisWeek[i];

    // Select candidates directly from our pre-filtered arrays to avoid .filter() overhead
    let candidates: Project[];
    if (config.format === 'film') candidates = eligibleFilm;
    else if (config.format === 'tv') candidates = eligibleTv;
    else candidates = eligibleFilm.concat(eligibleTv);

    if (candidates.length === 0) continue;

    let bestProject = candidates[0];
    let bestScore = -1;

    // ⚡ Bolt: Find best score using a single loop
    for (let j = 0; j < candidates.length; j++) {
      const p = candidates[j];
      const score = config.evaluator(p) * (1 + (p.awardsProfile?.campaignStrength || 0) / 100);
      if (score > bestScore) {
        bestScore = score;
        bestProject = p;
      }
    }

    // Threshold to actually win (don't give out awards if the year was terrible)
    if (bestScore > 150) {
      newAwards.push({
        id: `award-${crypto.randomUUID()}`,
        projectId: bestProject.id,
        name: config.category,
        category: config.category,
        body: config.body,
        status: 'won',
        year
      });
      prestigeChange += 10;
      projectUpdates.push(`🏆 "${bestProject.title}" won ${config.category} at the ${config.body}!`);
      newsEvents.push({
        type: 'AWARD',
        headline: `${bestProject.title} Wins ${config.category}!`,
        description: `In a stunning victory at the ${config.body}, "${bestProject.title}" took home the top prize for ${config.category}.`,
        impact: '+10 Prestige'
      });
    } else if (bestScore > 100) {
       newAwards.push({
        id: `award-${crypto.randomUUID()}`,
        projectId: bestProject.id,
        name: config.category,
        category: config.category,
        body: config.body,
        status: 'nominated',
        year
      });
      prestigeChange += 2;
      projectUpdates.push(`⭐ "${bestProject.title}" was nominated for ${config.category} at the ${config.body}.`);
    }
  }

  return { newAwards, prestigeChange, projectUpdates, newsEvents };
}


export interface RazzieResult {
  projectUpdates: string[];
  studioPrestigePenalty: number;
  razzieWinnerTalentIds: string[];
  cultClassicProjectIds: string[];
  newHeadlines: Headline[];
  newsEvents: Omit<import('../types').NewsEvent, 'id' | 'week'>[];
}

export function processRazzies(state: GameState, week: number): RazzieResult {
  const result: RazzieResult = {
    projectUpdates: [],
    studioPrestigePenalty: 0,
    razzieWinnerTalentIds: [],
    cultClassicProjectIds: [],
    newHeadlines: [],
    newsEvents: []
  };

  const eligibleProjects = state.studio.internal.projects.filter(p =>
    p.status === 'released' &&
    p.budget >= 50_000_000 &&
    (p.reviewScore !== undefined && p.reviewScore <= 30)
  );

  if (eligibleProjects.length === 0) return result;

  // Pick the absolute worst project
  const worstPicture = eligibleProjects.reduce((worst, p) =>
    (p.reviewScore! < worst.reviewScore!) ? p : worst
  );

  result.projectUpdates.push(`"${worstPicture.title}" has 'won' Worst Picture at The Razzies! A catastrophic failure.`);
  result.newHeadlines.push({
    id: crypto.randomUUID(),
    week,
    category: 'razzies',
    text: `The Razzies Nominees Announced! "${worstPicture.title}" sweeps the board with a historic Worst Picture win.`
  });
  result.newsEvents.push({
    type: 'AWARD', // Razzies are technically awards, albeit negative
    headline: `Razzies: ${worstPicture.title} Named Worst Picture`,
    description: `The Golden Raspberry Awards have spoken, and "${worstPicture.title}" is officially the worst film of the year.`,
    impact: '-10 Prestige'
  });
  result.studioPrestigePenalty = 10;

  // Determine if it becomes a Cult Classic
  // A cult classic is born if it has high absurdity/drama or a specific flavor. Let's use the genre and a random chance if it's very bad.
  const isAbsurd = worstPicture.genre === 'Drama' || (worstPicture.flavor && worstPicture.flavor.toLowerCase().match(/absurd|ridiculous|bizarre|insane/));
  if (isAbsurd || Math.random() > 0.5) {
     result.cultClassicProjectIds.push(worstPicture.id);
  }

  // Find the 'Worst Lead'
  const projectContracts = state.studio.internal.contracts.filter(c => c.projectId === worstPicture.id);

  let worstLeadId: string | null = null;
  let highestDraw = 0;

  for (const c of projectContracts) {
     const talent = state.industry.talentPool.find(t => t.id === c.talentId);
     if (talent && talent.draw > 70 && talent.draw > highestDraw) {
         worstLeadId = talent.id;
         highestDraw = talent.draw;
     }
  }

  if (worstLeadId) {
     result.razzieWinnerTalentIds.push(worstLeadId);
     const talent = state.industry.talentPool.find(t => t.id === worstLeadId);
     if (talent) {
        result.projectUpdates.push(`${talent.name} won Worst Lead for "${worstPicture.title}", absolutely devastating their ego.`);
     }
  }

  return result;
}

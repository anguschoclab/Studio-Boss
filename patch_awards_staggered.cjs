const fs = require('fs');
let text = fs.readFileSync('src/engine/systems/awards.ts', 'utf8');

// Replace runAwardsCeremony signature and implementation
text = text.replace(
`export function runAwardsCeremony(state: GameState, year: number): AwardCeremonyResult {
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
  );`,
`// Define when ceremonies happen within a 52-week year
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
  );`
);

// We need to only evaluate bodies that are happening this week
text = text.replace(
`  // --- ACADEMY AWARDS (Oscars) ---
  evaluateAward('Academy Awards', 'Best Picture', p =>
    (p.awardsProfile?.academyAppeal || 0) + (p.awardsProfile?.prestigeScore || 0) + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5,
    'film'
  );`,
`  // --- ACADEMY AWARDS (Oscars) ---
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
  }`
);

// Remove the standalone Best Director from before since we moved it into the if block
text = text.replace(
`  evaluateAward('Academy Awards', 'Best Director', p =>
    (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.academyAppeal || 0) * 0.8,
    'film'
  );`,
``
);


text = text.replace(
`  // --- PRIMETIME EMMYS ---
  evaluateAward('Primetime Emmys', 'Best Series', p =>
    (p.awardsProfile?.criticScore || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5,
    'tv'
  );`,
`  // --- PRIMETIME EMMYS ---
  if (bodiesThisWeek.includes('Primetime Emmys')) {
    evaluateAward('Primetime Emmys', 'Best Series', p =>
      (p.awardsProfile?.criticScore || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.awardsProfile?.industryNarrativeScore || 0) * 0.5,
      'tv'
    );
  }`
);

text = text.replace(
`  // --- GOLDEN GLOBES ---
  evaluateAward('Golden Globes', 'Best Picture', p =>
    (p.awardsProfile?.populistAppeal || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.buzz / 2),
    'both' // Simplifying to both for now
  );`,
`  // --- GOLDEN GLOBES ---
  if (bodiesThisWeek.includes('Golden Globes')) {
    evaluateAward('Golden Globes', 'Best Picture', p =>
      (p.awardsProfile?.populistAppeal || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.buzz / 2),
      'film'
    );
    evaluateAward('Golden Globes', 'Best Series', p =>
      (p.awardsProfile?.populistAppeal || 0) + (p.awardsProfile?.culturalHeat || 0) + (p.buzz / 2),
      'tv'
    );
  }`
);

text = text.replace(
`  // --- INDEPENDENT SPIRIT AWARDS ---
  evaluateAward('Independent Spirit Awards', 'Best Picture', p =>
    (p.awardsProfile?.indieCredibility || 0) * 2 + (p.awardsProfile?.criticScore || 0),
    'film'
  );`,
`  // --- INDEPENDENT SPIRIT AWARDS ---
  if (bodiesThisWeek.includes('Independent Spirit Awards')) {
    evaluateAward('Independent Spirit Awards', 'Best Picture', p =>
      (p.awardsProfile?.indieCredibility || 0) * 2 + (p.awardsProfile?.criticScore || 0),
      'film'
    );
  }`
);

text = text.replace(
`  // --- BAFTAS ---
  evaluateAward('BAFTAs', 'Best Picture', p =>
    (p.awardsProfile?.craftScore || 0) + (p.awardsProfile?.prestigeScore || 0),
    'both'
  );`,
`  // --- BAFTAS ---
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
  }`
);

fs.writeFileSync('src/engine/systems/awards.ts', text);

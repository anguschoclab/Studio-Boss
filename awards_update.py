import re

with open('src/engine/systems/awards.ts', 'r') as f:
    content = f.read()

# 1. Ensure 'The Razzies' is in AWARDS_CALENDAR
razzies_calendar = """
AWARDS_CALENDAR[34] = ['Venice Film Festival', 'Telluride Film Festival'];
AWARDS_CALENDAR[35] = ['Toronto International Film Festival'];
AWARDS_CALENDAR[36] = ['Slamdance Film Festival'];
AWARDS_CALENDAR[37] = ['Primetime Emmys'];
AWARDS_CALENDAR[4] = ['Critics Choice Awards', 'The Razzies']; // Razzie week is usually week 4
"""

content = re.sub(
    r"AWARDS_CALENDAR\[34\] = \['Venice Film Festival', 'Telluride Film Festival'\];\nAWARDS_CALENDAR\[35\] = \['Toronto International Film Festival'\];\nAWARDS_CALENDAR\[36\] = \['Slamdance Film Festival'\];\nAWARDS_CALENDAR\[37\] = \['Primetime Emmys'\];",
    razzies_calendar.strip(),
    content
)

# 2. Add 'The Razzies' and specific Razzies logic
# Actually, the user asked to create `processRazzies(state: GameState)` and call it.
# So I don't necessarily have to add it to AWARDS_CALENDAR and AWARD_CONFIGS if I'm processing it as a special system.

razzies_func = """
export interface RazzieResult {
  projectUpdates: string[];
  studioPrestigePenalty: number;
  razzieWinnerTalentIds: string[];
  cultClassicProjectIds: string[];
  newHeadlines: Headline[];
}

export function processRazzies(state: GameState, week: number): RazzieResult {
  const result: RazzieResult = {
    projectUpdates: [],
    studioPrestigePenalty: 0,
    razzieWinnerTalentIds: [],
    cultClassicProjectIds: [],
    newHeadlines: []
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
"""

content += "\n" + razzies_func

with open('src/engine/systems/awards.ts', 'w') as f:
    f.write(content)

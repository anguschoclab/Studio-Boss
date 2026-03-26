import re

with open('src/engine/core/weekAdvance.ts', 'r') as f:
    content = f.read()

# Add import for processRazzies
content = content.replace("import { generateAwardsProfile, runAwardsCeremony } from '../systems/awards';", "import { generateAwardsProfile, runAwardsCeremony, processRazzies } from '../systems/awards';")

# Call processRazzies during Award Season (week 4)
razzies_logic = """
  const year = Math.floor(nextWeek / 52) + 1;
  const ceremonyResult = runAwardsCeremony(state, nextWeek, year);

  let prestigeChange = ceremonyResult.prestigeChange;

  if (nextWeek % 52 === 4) {
     const razzies = processRazzies(state, nextWeek);
     if (razzies.projectUpdates.length > 0) {
        weeklyChanges.projectUpdates.push(...razzies.projectUpdates);
        weeklyChanges.newHeadlines.push(...razzies.newHeadlines);
        prestigeChange -= razzies.studioPrestigePenalty;

        // Apply cult classic flags
        if (razzies.cultClassicProjectIds.length > 0) {
           for (const p of updatedProjects) {
              if (razzies.cultClassicProjectIds.includes(p.id)) {
                 p.isCultClassic = true;
              }
           }
        }

        // Apply razzie winners and trigger crisis
        if (razzies.razzieWinnerTalentIds.length > 0) {
           for (const t of updatedTalentPool) {
              if (razzies.razzieWinnerTalentIds.includes(t.id)) {
                 t.hasRazzie = true;

                 // Ego Crisis logic for the specific talent project
                 const relatedProject = updatedProjects.find(p => p.id === razzies.cultClassicProjectIds[0]); // fallback to worst picture
                 if (relatedProject && !relatedProject.activeCrisis) {
                    relatedProject.activeCrisis = {
                        description: `The Razzies have destroyed ${t.name}'s ego. They are having a meltdown on set of their next project, or refusing to promote this one.`,
                        options: [
                           { text: "Apologize to them", buzzPenalty: 10 },
                           { text: "Ignore it", cashPenalty: 500000 }
                        ],
                        resolved: false,
                        severity: 'catastrophic'
                    };
                    weeklyChanges.events.push(`CRISIS: "${relatedProject.title}" - ${relatedProject.activeCrisis.description}`);
                 }
              }
           }
        }
     }
  }

  const newAwards = ceremonyResult.newAwards;
"""

content = re.sub(
    r"  const year = Math\.floor\(nextWeek / 52\) \+ 1;\n  const ceremonyResult = runAwardsCeremony\(state, nextWeek, year\);\n\n  const newAwards = ceremonyResult\.newAwards;\n  const prestigeChange = ceremonyResult\.prestigeChange;",
    razzies_logic.strip(),
    content
)

with open('src/engine/core/weekAdvance.ts', 'w') as f:
    f.write(content)

import re

with open('src/engine/systems/productionEngine.ts', 'r') as f:
    content = f.read()

# I apparently didn't actually add the calculateChemistry function successfully, or it was overwritten. Let's add it.

chemistry_code = """
export function calculateChemistry(project: Project, attachedTalent: TalentProfile[]): number {
  if (attachedTalent.length === 0) return 50;

  let baseChemistry = 50;

  // Unscripted Ensemble
  if (project.format === 'unscripted' && project.template?.castingRequirements?.some(req => req.roleType === 'ENSEMBLE')) {
    let conflictScore = 0;
    let totalDrama = 0;
    const traits = new Set<string>();

    for (const t of attachedTalent) {
      if (t.perks) {
        for (const perk of t.perks) {
          traits.add(perk);
        }
      }
      totalDrama += (t.ego || 0);
    }

    if (traits.has('Diva') && (traits.has('Hot-Headed') || traits.has('Abrasive') || traits.has('Difficult'))) {
      conflictScore += 30;
    }
    if (traits.has('Volatile')) conflictScore += 10;

    const avgDrama = attachedTalent.length > 0 ? totalDrama / attachedTalent.length : 0;
    baseChemistry += conflictScore + (avgDrama * 0.4);

  } else if (project.format === 'unscripted' && project.template?.castingRequirements?.some(req => req.roleType === 'HOST')) {
    const host = attachedTalent.find(t => t.roles.includes('showrunner') || t.roles.includes('director'));
    let charismaBonus = 0;
    if (host) {
      charismaBonus = host.draw * 0.5;
    }

    const uniqueTraits = new Set<string>();
    for (const t of attachedTalent) {
       if (t.perks) t.perks.forEach(p => uniqueTraits.add(p));
    }
    const varietyBonus = Math.min(30, uniqueTraits.size * 5);

    baseChemistry += charismaBonus + varietyBonus;

  } else {
    let synergyScore = 0;
    let totalActing = 0;

    for (const t of attachedTalent) {
       totalActing += t.skill || t.draw;
       if (t.perks) {
         if (t.perks.includes('Collaborative')) synergyScore += 10;
         if (t.perks.includes('Reliable')) synergyScore += 5;
         if (t.perks.includes('Diva') || t.perks.includes('Difficult')) synergyScore -= 15;
         if (t.perks.includes('Volatile')) synergyScore -= 10;
       }
    }

    const avgActing = attachedTalent.length > 0 ? totalActing / attachedTalent.length : 0;
    baseChemistry += synergyScore + (avgActing * 0.4);
  }

  return Math.max(1, Math.min(100, Math.round(baseChemistry)));
}
"""

if 'calculateChemistry' not in content:
    content = content.replace("export const ProductionEngine = {", chemistry_code + "\nexport const ProductionEngine = {")
    if 'TalentProfile' not in content:
        content = content.replace("import { GameState, Project, Headline } from '../types';", "import { GameState, Project, Headline, TalentProfile } from '../types';")

with open('src/engine/systems/productionEngine.ts', 'w') as f:
    f.write(content)

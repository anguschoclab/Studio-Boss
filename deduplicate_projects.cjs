const fs = require('fs');
const file = 'src/engine/systems/projects.ts';
let code = fs.readFileSync(file, 'utf8');

const target1 = `    // Talent impact
    const attachedTalent = projectContracts.reduce((acc, c) => {
      const t = talentPoolMap.get(c.talentId);
      if (t) acc.push(t);
      return acc;
    }, [] as TalentProfile[]);
    const talentDrawFactor = attachedTalent.reduce((sum, t) => sum + (t.draw / 100), 1);`;

const target2 = `  // Buzz drift during active phases
  if (p.status === 'development' || p.status === 'production') {
    const attachedTalent = projectContracts.reduce((acc, c) => {
      const t = talentPoolMap.get(c.talentId);
      if (t) acc.push(t);
      return acc;
    }, [] as TalentProfile[]);
    const talentBuzzBonus = attachedTalent.reduce((sum, t) => sum + (t.draw / 50), 0);
    p.buzz = clamp(p.buzz + randRange(-4, 6) + talentBuzzBonus, 0, 100);
  }`;

// Inject helper
code = code.replace(`export function advanceProject(`, `function getAttachedTalent(contracts: Contract[], talentPoolMap: Map<string, TalentProfile>): TalentProfile[] {
  return contracts.reduce((acc, c) => {
    const t = talentPoolMap.get(c.talentId);
    if (t) acc.push(t);
    return acc;
  }, [] as TalentProfile[]);
}

export function advanceProject(`);

// Replace targets
code = code.replace(`    // Talent impact
    const attachedTalent = projectContracts.reduce((acc, c) => {
      const t = talentPoolMap.get(c.talentId);
      if (t) acc.push(t);
      return acc;
    }, [] as TalentProfile[]);
    const talentDrawFactor = attachedTalent.reduce((sum, t) => sum + (t.draw / 100), 1);`, `    // Talent impact
    const attachedTalent = getAttachedTalent(projectContracts, talentPoolMap);
    const talentDrawFactor = attachedTalent.reduce((sum, t) => sum + (t.draw / 100), 1);`);

code = code.replace(`  // Buzz drift during active phases
  if (p.status === 'development' || p.status === 'production') {
    const attachedTalent = projectContracts.reduce((acc, c) => {
      const t = talentPoolMap.get(c.talentId);
      if (t) acc.push(t);
      return acc;
    }, [] as TalentProfile[]);
    const talentBuzzBonus = attachedTalent.reduce((sum, t) => sum + (t.draw / 50), 0);
    p.buzz = clamp(p.buzz + randRange(-4, 6) + talentBuzzBonus, 0, 100);
  }`, `  // Buzz drift during active phases
  if (p.status === 'development' || p.status === 'production') {
    const attachedTalent = getAttachedTalent(projectContracts, talentPoolMap);
    const talentBuzzBonus = attachedTalent.reduce((sum, t) => sum + (t.draw / 50), 0);
    p.buzz = clamp(p.buzz + randRange(-4, 6) + talentBuzzBonus, 0, 100);
  }`);

fs.writeFileSync(file, code);

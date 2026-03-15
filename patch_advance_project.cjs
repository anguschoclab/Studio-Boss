const fs = require('fs');
const path = 'src/engine/systems/projects.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /export function advanceProject\(/,
  `export function advanceProject(`
);

// We need to mutate the talentPoolMap or return updated talents when a project is archived.

code = code.replace(
  /if \(p\.weeklyRevenue < 50_000 \|\| p\.weeksInPhase > 8\) \{\n           p\.status = 'archived';\n           update = `"\$\{p\.title\}" Season \$\{p\.season\} finishes its run.`;\n        \}/,
  `if (p.weeklyRevenue < 50_000 || p.weeksInPhase > 8) {
           p.status = 'archived';
           update = \`"\${p.title}" Season \${p.season} finishes its run.\`;
           updateTalentStats(p, projectContracts, talentPoolMap);
        }`
);

code = code.replace(
  /if \(p\.weeksInPhase > part2DropWeek \+ 6 && p\.weeklyRevenue < 50_000\) \{\n           p\.status = 'archived';\n           update = `"\$\{p\.title\}" Season \$\{p\.season\} finishes its run.`;\n        \}/,
  `if (p.weeksInPhase > part2DropWeek + 6 && p.weeklyRevenue < 50_000) {
           p.status = 'archived';
           update = \`"\${p.title}" Season \${p.season} finishes its run.\`;
           updateTalentStats(p, projectContracts, talentPoolMap);
        }`
);

code = code.replace(
  /if \(p\.weeklyRevenue < 50_000 \|\| p\.weeksInPhase > eps \+ 4\) \{\n             p\.status = 'archived';\n             update = `"\$\{p\.title\}" Season \$\{p\.season\} finishes its run.`;\n           \}/,
  `if (p.weeklyRevenue < 50_000 || p.weeksInPhase > eps + 4) {
             p.status = 'archived';
             update = \`"\${p.title}" Season \${p.season} finishes its run.\`;
             updateTalentStats(p, projectContracts, talentPoolMap);
           }`
);

code = code.replace(
  /if \(p\.weeklyRevenue < 100_000 \|\| p\.weeksInPhase > 12\) \{\n        p\.status = 'archived';\n        update = `"\$\{p\.title\}" completes its run — total gross: \$\{\(p\.revenue \/ 1_000_000\)\.toFixed\(1\)\}M`;\n      \}/,
  `if (p.weeklyRevenue < 100_000 || p.weeksInPhase > 12) {
        p.status = 'archived';
        update = \`"\${p.title}" completes its run — total gross: \${\(p.revenue / 1_000_000\).toFixed(1)}M\`;
        updateTalentStats(p, projectContracts, talentPoolMap);
      }`
);

const helperFunc = `

function updateTalentStats(project: Project, contracts: Contract[], talentPoolMap: Map<string, TalentProfile>) {
  if (contracts.length === 0) return;

  const ROI = project.revenue / project.budget;

  // Define success/failure bounds
  let drawChange = 0;
  let prestigeChange = 0;
  let feeMultiplier = 1.0;

  if (ROI > 3.0) {
    // Massive hit
    drawChange = 10;
    prestigeChange = 5;
    feeMultiplier = 1.5;
  } else if (ROI > 1.5) {
    // Solid success
    drawChange = 5;
    prestigeChange = 2;
    feeMultiplier = 1.2;
  } else if (ROI < 0.5) {
    // Bomb
    drawChange = -10;
    prestigeChange = -5;
    feeMultiplier = 0.8;
  } else if (ROI < 1.0) {
    // Disappointment
    drawChange = -5;
    prestigeChange = -2;
    feeMultiplier = 0.9;
  }

  for (const contract of contracts) {
    const talent = talentPoolMap.get(contract.talentId);
    if (talent) {
      talent.draw = clamp(talent.draw + drawChange, 0, 100);
      talent.prestige = clamp(talent.prestige + prestigeChange, 0, 100);
      talent.fee = Math.max(50000, Math.floor(talent.fee * feeMultiplier));
    }
  }
}
`;

code += helperFunc;

fs.writeFileSync(path, code);

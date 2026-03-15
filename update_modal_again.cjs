const fs = require('fs');

const path = 'src/components/modals/ProjectDetailModal.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import { evaluateGreenlight }')) {
  code = code.replace(
    /import { TV_FORMATS } from '@\/engine\/data\/tvFormats';/,
    `import { TV_FORMATS } from '@/engine/data/tvFormats';\nimport { evaluateGreenlight } from '@/engine/systems/greenlight';`
  );
}

if (!code.includes('greenlightProject')) {
  code = code.replace(
    /const renewProject = useGameStore\(s => s\.renewProject\);/,
    `const renewProject = useGameStore(s => s.renewProject);\n  const greenlightProject = useGameStore(s => s.greenlightProject);`
  );
}

// Add evaluateGreenlight call
if (!code.includes('const greenlightReport')) {
  code = code.replace(
    /const tier = BUDGET_TIERS\[project.budgetTier\];/,
    `const tier = BUDGET_TIERS[project.budgetTier];

  const greenlightReport = useMemo(() => {
    if (!project || project.status !== 'needs_greenlight' || !gameState) return null;
    const projectContracts = contracts.filter(c => c.projectId === project.id);
    const attachedTalent = projectContracts.map(c => talentPool.find(t => t.id === c.talentId)).filter(Boolean) as import('@/engine/types').TalentProfile[];
    return evaluateGreenlight(project, gameState.cash, attachedTalent);
  }, [project, gameState, contracts, talentPool]);`
  );
}

// Fix casting logic to allow casting during needs_greenlight
code = code.replace(
  /project\.status === 'development'\s*\?\s*\(/g,
  `(project.status === 'development' || project.status === 'needs_greenlight') ? (`
);

// Add Greenlight Committee UI
const greenlightUI = `
          {/* Greenlight Committee */}
          {project.status === 'needs_greenlight' && greenlightReport && (
            <div className="space-y-3 border border-warning/50 bg-warning/10 p-4 rounded-lg">
              <div className="flex items-center justify-between border-b border-warning/20 pb-2">
                <h4 className="font-display font-semibold text-warning-foreground">Greenlight Committee Readout</h4>
                <Badge variant={greenlightReport.score >= 60 ? 'default' : 'destructive'}>
                  {greenlightReport.recommendation}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                {greenlightReport.positives.length > 0 && (
                  <div>
                    <span className="font-semibold text-success">Pros:</span>
                    <ul className="list-disc list-inside text-muted-foreground ml-2">
                      {greenlightReport.positives.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
                {greenlightReport.negatives.length > 0 && (
                  <div>
                    <span className="font-semibold text-destructive">Cons:</span>
                    <ul className="list-disc list-inside text-muted-foreground ml-2">
                      {greenlightReport.negatives.map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              <Button
                className="w-full mt-2"
                variant={greenlightReport.score >= 60 ? 'default' : 'destructive'}
                onClick={() => {
                  greenlightProject(project.id);
                  selectProject(null);
                }}
              >
                Approve Greenlight
              </Button>
            </div>
          )}
`;

if (!code.includes('Greenlight Committee')) {
  code = code.replace(
    /\{\/\* Casting Section \*\/\}/,
    `${greenlightUI}\n\n          {/* Casting Section */}`
  );
}


fs.writeFileSync(path, code);

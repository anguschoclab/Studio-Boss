const fs = require('fs');

let code = fs.readFileSync('src/components/pipeline/ProjectCard.tsx', 'utf-8');

code = code.replace(
  "import { BUDGET_TIERS } from '@/engine/data/budgetTiers';",
  "import { BUDGET_TIERS } from '@/engine/data/budgetTiers';\nimport { Button } from '@/components/ui/button';"
);

code = code.replace(
  "const { selectProject } = useUIStore();",
  "const { selectProject, openPitchProject } = useUIStore();"
);

code = code.replace(
  "      {/* Revenue for released/archived */}",
  `      {/* Pitch Button */}
      {project.status === 'pitching' && (
        <div className="pt-2">
           <Button
             variant="default"
             size="sm"
             className="w-full text-xs"
             onClick={(e) => {
               e.stopPropagation();
               openPitchProject(project.id);
             }}
           >
             Pitch to Network
           </Button>
        </div>
      )}

      {/* Revenue for released/archived */}`
);

fs.writeFileSync('src/components/pipeline/ProjectCard.tsx', code);

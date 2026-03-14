const fs = require('fs');

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(
  "import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';",
  "import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';\nimport { PitchProjectModal } from '@/components/modals/PitchProjectModal';"
);

code = code.replace(
  "      {/* Modals */}\n      <CreateProjectModal />\n      <WeekSummaryModal />\n      <ProjectDetailModal />\n    </div>",
  "      {/* Modals */}\n      <CreateProjectModal />\n      <WeekSummaryModal />\n      <ProjectDetailModal />\n      <PitchProjectModal />\n    </div>"
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);

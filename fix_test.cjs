const fs = require('fs');

let content = fs.readFileSync('src/test/components/pipeline/PipelineBoard.test.tsx', 'utf8');
content = content.replace(
  "import { PipelineBoard } from '@/components/pipeline/PipelineBoard';",
  "import { PipelineBoard } from '@/components/pipeline/PipelineBoard';\nimport { TooltipProvider } from '@radix-ui/react-tooltip';"
);
content = content.replace(
  /<PipelineBoard \/>/g,
  "<TooltipProvider><PipelineBoard /></TooltipProvider>"
);
fs.writeFileSync('src/test/components/pipeline/PipelineBoard.test.tsx', content);

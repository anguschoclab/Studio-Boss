const fs = require('fs');

let content = fs.readFileSync('src/test/components/modals/CrisisModal.test.tsx', 'utf8');
content = content.replace(
  "import { render, screen, fireEvent } from '@testing-library/react';",
  "import { render, screen, fireEvent } from '@testing-library/react';\nimport { TooltipProvider } from '@radix-ui/react-tooltip';"
);
content = content.replace(
  /render\(<CrisisModal \/>\);/g,
  "render(<TooltipProvider><CrisisModal /></TooltipProvider>);"
);
content = content.replace(
  /expect\(container\.firstChild\)/g,
  "expect(screen.queryByRole('dialog'))"
);
fs.writeFileSync('src/test/components/modals/CrisisModal.test.tsx', content);

let unified = fs.readFileSync('src/test/components/modals/UnifiedModal.test.tsx', 'utf8');
unified = unified.replace(
  /expect\(container\.firstChild\)/g,
  "expect(screen.queryByRole('dialog'))"
);
fs.writeFileSync('src/test/components/modals/UnifiedModal.test.tsx', unified);

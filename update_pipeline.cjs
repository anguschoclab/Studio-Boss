const fs = require('fs');

let code = fs.readFileSync('src/components/pipeline/PipelineBoard.tsx', 'utf-8');

code = code.replace(
  "const COLUMNS: { status: ProjectStatus[]; title: string; color: string }[] = [\n  { status: ['development'], title: 'Development', color: 'bg-secondary' },\n  { status: ['production'], title: 'Production', color: 'bg-primary' },\n  { status: ['released', 'archived'], title: 'Released', color: 'bg-success' },\n];",
  "const COLUMNS: { status: ProjectStatus[]; title: string; color: string }[] = [\n  { status: ['development'], title: 'Development', color: 'bg-secondary' },\n  { status: ['pitching'], title: 'Pitching', color: 'bg-warning' },\n  { status: ['production'], title: 'Production', color: 'bg-primary' },\n  { status: ['released', 'archived'], title: 'Released', color: 'bg-success' },\n];"
);

code = code.replace(
  '<div className="grid grid-cols-3 gap-4">',
  '<div className="grid grid-cols-4 gap-4">'
);

fs.writeFileSync('src/components/pipeline/PipelineBoard.tsx', code);

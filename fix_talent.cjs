const fs = require('fs');
let code = fs.readFileSync('src/engine/generators/talent/index.ts', 'utf8');
code = code.replace(
  /_families: Family\[\] = \[\],\n  _agents: Agent\[\] = \[\],\n  _agencies: Agency\[\] = \[\],/g,
  "_families: Family[] = [],\n  _agents: Agent[] = [],\n  _agencies: Agency[] = [],\n"
);
// actually just inject `void` at the top of the function
code = code.replace(
  /export function generateTalentPool\([\s\S]*?\): Talent\[\] \{/m,
  "$& \n  void _families;\n  void _agents;\n  void _agencies;"
);
fs.writeFileSync('src/engine/generators/talent/index.ts', code);

const fs = require('fs');
let code = fs.readFileSync('src/engine/generators/names.ts', 'utf8');
code = code.replace(
  /export function generateDemographicName\(gender: 'MALE' \| 'FEMALE' \| 'NON_BINARY', country: string, _ethnicity: string\): string \{/,
  "export function generateDemographicName(gender: 'MALE' | 'FEMALE' | 'NON_BINARY', country: string, _ethnicity: string): string {\n  void _ethnicity; // ignore unused var warning\n"
);
fs.writeFileSync('src/engine/generators/names.ts', code);

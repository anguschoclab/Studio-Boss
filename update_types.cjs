const fs = require('fs');

let typesContent = fs.readFileSync('src/engine/types.ts', 'utf8');

const familyInterface = `
export type AccessLevel = 'outsider' | 'soft-access' | 'legacy' | 'dynasty' | 'comeback';

export interface Family {
  id: string;
  name: string;
  recognition: number; // 0-100
  prestigeLegacy: number; // 0-100
  commercialLegacy: number; // 0-100
  scandalLegacy: number; // 0-100
  volatility: number; // 0-100
  status: 'respected' | 'chaotic' | 'overexposed' | 'revived' | 'faded' | 'rising';
}
`;

// Add Family interface
typesContent = typesContent.replace('// Future system stubs', familyInterface + '\n// Future system stubs');

// Add families to GameState
typesContent = typesContent.replace(
  'talentPool: TalentProfile[];',
  'families: Family[];\n  talentPool: TalentProfile[];'
);

// Update TalentProfile
const newTalentProfile = `export interface TalentProfile {
  id: string;
  name: string;
  type: 'director' | 'actor' | 'writer' | 'producer';
  prestige: number;
  fee: number;
  draw: number;
  temperament: string; // Used by UI
  // Lineage properties
  familyId?: string;
  accessLevel: AccessLevel;
}`;

typesContent = typesContent.replace(/export interface TalentProfile \{[^}]+\}/, newTalentProfile);

fs.writeFileSync('src/engine/types.ts', typesContent);

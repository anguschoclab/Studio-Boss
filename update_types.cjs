const fs = require('fs');

let code = fs.readFileSync('src/engine/types.ts', 'utf-8');

// 1. Update ProjectStatus
code = code.replace(
  "export type ProjectStatus = 'development' | 'production' | 'released' | 'archived';",
  "export type ProjectStatus = 'development' | 'pitching' | 'production' | 'released' | 'archived';"
);

// 2. Add ProjectContractType, MandateType, Mandate, Buyer interfaces
const addTypes = `
export type ProjectContractType = 'upfront' | 'deficit';
export type MandateType = 'sci-fi' | 'comedy' | 'drama' | 'budget_freeze' | 'broad_appeal' | 'prestige';

export interface Mandate {
  type: MandateType;
  activeUntilWeek: number;
}

export interface Buyer {
  id: string;
  name: string;
  archetype: 'network' | 'streamer' | 'premium';
  currentMandate?: Mandate;
}
`;
code = code.replace('export interface Project {', addTypes + '\\nexport interface Project {');

// 3. Add contractType and buyerId to Project
code = code.replace(
  '  awardsProfile?: AwardsProfile;\n}',
  '  awardsProfile?: AwardsProfile;\n  contractType?: ProjectContractType;\n  buyerId?: string;\n}'
);

// 4. Update GameState
code = code.replace(
  '  financeHistory: FinanceRecord[];\n}',
  '  financeHistory: FinanceRecord[];\n  buyers: Buyer[];\n  contracts: Contract[];\n  talentPool: TalentProfile[];\n  awards?: Award[];\n}'
);

fs.writeFileSync('src/engine/types.ts', code);

const fs = require('fs');

let code = fs.readFileSync('src/engine/core/gameInit.ts', 'utf-8');

code = code.replace(
  "import { GameState, ArchetypeKey, RivalStudio } from '../types';",
  "import { GameState, ArchetypeKey, RivalStudio, Buyer } from '../types';"
);

const initialBuyersCode = `
  const initialBuyers: Buyer[] = [
    { id: 'b-net-1', name: 'Globe Broadcasting', archetype: 'network', currentMandate: { type: 'broad_appeal', activeUntilWeek: 24 } },
    { id: 'b-net-2', name: 'National Television', archetype: 'network', currentMandate: { type: 'comedy', activeUntilWeek: 16 } },
    { id: 'b-str-1', name: 'ViewMax', archetype: 'streamer', currentMandate: { type: 'sci-fi', activeUntilWeek: 32 } },
    { id: 'b-str-2', name: 'StreamFlix', archetype: 'streamer', currentMandate: { type: 'drama', activeUntilWeek: 20 } },
    { id: 'b-pre-1', name: 'Premium TV', archetype: 'premium', currentMandate: { type: 'prestige', activeUntilWeek: 48 } },
  ];
`;

code = code.replace(
  "  return {\n    studio:",
  initialBuyersCode + "\n  return {\n    studio:"
);

code = code.replace(
  "    financeHistory: [{ week: 1, cash: arch.startingCash, revenue: 0, costs: 0 }],\n  };\n}",
  "    financeHistory: [{ week: 1, cash: arch.startingCash, revenue: 0, costs: 0 }],\n    buyers: initialBuyers,\n    contracts: [],\n    talentPool: [],\n  };\n}"
);

fs.writeFileSync('src/engine/core/gameInit.ts', code);

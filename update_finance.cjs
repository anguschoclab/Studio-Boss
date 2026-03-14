const fs = require('fs');

let code = fs.readFileSync('src/engine/systems/finance.ts', 'utf-8');

const calculateCosts = `
export function calculateWeeklyCosts(projects: Project[]): number {
  return projects
    .filter(p => p.status === 'development' || p.status === 'production')
    .reduce((sum, p) => {
      let costMultiplier = 1;
      if (p.status === 'production' && p.contractType === 'upfront') {
         costMultiplier = 0; // The network/streamer is paying for the production entirely
      } else if (p.status === 'production' && p.contractType === 'deficit') {
         costMultiplier = 0.3; // Studio pays 30% to retain backend rights
      }
      return sum + (p.weeklyCost * costMultiplier);
    }, 0);
}
`;

const calculateRevenue = `
export function calculateWeeklyRevenue(projects: Project[], contracts: Contract[]): number {
  return projects
    .filter(p => p.status === 'released')
    .reduce((sum, p) => {
      let revenue = p.weeklyRevenue;

      if (p.contractType === 'upfront') {
          revenue = 0; // Studio traded all backend revenue for an upfront production fee
      } else if (p.contractType === 'deficit') {
          // Keep 100% of the calculated revenue for the syndication run
      }

      // Subtract backend participation
      const projectContracts = contracts.filter(c => c.projectId === p.id);
      const totalBackendPercent = projectContracts.reduce((total, c) => total + c.backendPercent, 0);
      const backendCut = revenue * (totalBackendPercent / 100);
      return sum + (revenue - backendCut);
    }, 0);
}
`;

code = code.replace(
  /export function calculateWeeklyCosts[\s\S]*?}\n/,
  calculateCosts
);

code = code.replace(
  /export function calculateWeeklyRevenue[\s\S]*?}\n/,
  calculateRevenue
);

fs.writeFileSync('src/engine/systems/finance.ts', code);

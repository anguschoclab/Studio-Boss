import fs from 'fs';

let content = fs.readFileSync('src/test/engine/systems/ReviewSystem.test.ts', 'utf-8');

content = content.replace(/mockTalent = \[\n\s+\{\n\s+id: "dir-1",\n\s+name: "Great Director",\n\s+roles: \["director"\],\n\s+prestige: 90\n\s+\}\n\s+\] as any;/, `mockTalent = [\n      createMockTalent({\n        id: "dir-1",\n        name: "Great Director",\n        roles: ["director"],\n        prestige: 90\n      })\n    ];`);

content = content.replace(/const bomb = createMockProject\(\{[\s\S]*?genre: "Sci-Fi"[\s\S]*?\}\);\n\s+const isCult = ReviewSystem.checkCultPotential\(bomb2, 40, 85\);/, `const bomb = createMockProject({\n        ...mockProject,\n        budget: 100_000_000,\n        revenue: 10_000_000,\n        genre: "Comedy"\n      });\n      const isCult = ReviewSystem.checkCultPotential(bomb, 40, 85);`);

content = content.replace(/const mockT = \[\n\s+\{\n\s+id: "dir-1",\n\s+name: "Great Director",\n\s+roles: \["director"\],\n\s+prestige: 90\n\s+\}\n\s+\] as any;/, `const mockT = [\n          createMockTalent({\n            id: "dir-1",\n            name: "Great Director",\n            roles: ["director"],\n            prestige: 90\n          })\n        ];`);


fs.writeFileSync('src/test/engine/systems/ReviewSystem.test.ts', content);

const fs = require('fs');
const file = 'src/test/engine/systems/awards.test.ts';
let code = fs.readFileSync(file, 'utf8');

const target1 = `    it("should award 'won' status for high scores (> 150)", () => {
      // Academy Awards Best Picture: academyAppeal (90) + prestigeScore (85) + narrative (80*0.5) = 90 + 85 + 40 = 215
      // 215 * (1 + 20/100) = 215 * 1.2 = 258
      const state = { ...mockState, projects: [eligibleProject] };
      const result = runAwardsCeremony(state, 62, 2024);

      const bestPictureAward = result.newAwards.find(a => a.category === "Best Picture" && a.body === "Academy Awards");
      expect(bestPictureAward).toBeDefined();
      expect(bestPictureAward?.status).toBe("won");
      expect(result.projectUpdates.some(u => u.includes("won Best Picture"))).toBe(true);
    });`;

const replace1 = `    const checkBestPictureAward = (project: any, expectedStatus: 'won' | 'nominated') => {
      const state = { ...mockState, projects: [project] };
      const result = runAwardsCeremony(state, 62, 2024);
      const bestPictureAward = result.newAwards.find(a => a.category === "Best Picture" && a.body === "Academy Awards");
      expect(bestPictureAward).toBeDefined();
      expect(bestPictureAward?.status).toBe(expectedStatus);
      expect(result.projectUpdates.some(u => u.includes(\`\${expectedStatus === 'won' ? 'won' : 'nominated for'} Best Picture\`))).toBe(true);
    };

    it("should award 'won' status for high scores (> 150)", () => {
      // Academy Awards Best Picture: academyAppeal (90) + prestigeScore (85) + narrative (80*0.5) = 90 + 85 + 40 = 215
      // 215 * (1 + 20/100) = 215 * 1.2 = 258
      checkBestPictureAward(eligibleProject, 'won');
    });`;

code = code.replace(target1, replace1);

const target2 = `      const state = { ...mockState, projects: [modestProject] };
      const result = runAwardsCeremony(state, 62, 2024);

      const bestPictureAward = result.newAwards.find(a => a.category === "Best Picture" && a.body === "Academy Awards");
      expect(bestPictureAward).toBeDefined();
      expect(bestPictureAward?.status).toBe("nominated");
      expect(result.projectUpdates.some(u => u.includes("nominated for Best Picture"))).toBe(true);`;

const replace2 = `      checkBestPictureAward(modestProject, 'nominated');`;

code = code.replace(target2, replace2);

fs.writeFileSync(file, code);

const fs = require('fs');
const file = 'src/test/engine/systems/awards.test.ts';
let code = fs.readFileSync(file, 'utf8');

// The lines starting at 126 in awards.test.ts:
const pattern1 = `    it("should not return awards if no projects are eligible", () => {
      const state = { ...mockState, projects: [] };
      const result = runAwardsCeremony(state, 62, 2024);
      expect(result.newAwards).toHaveLength(0);
      expect(result.prestigeChange).toBe(0);
    });

    it("should exclude projects released more than 52 weeks ago", () => {
      const oldProject = { ...eligibleProject, releaseWeek: 5 }; // 62 - 5 = 57 weeks ago
      const state = { ...mockState, projects: [oldProject] };
      const result = runAwardsCeremony(state, 62, 2024);
      expect(result.newAwards).toHaveLength(0);
    });`;

// Replace with a helper for no-award assertions
const replace1 = `    const expectNoAwards = (projects: any[]) => {
      const state = { ...mockState, projects };
      const result = runAwardsCeremony(state, 62, 2024);
      expect(result.newAwards).toHaveLength(0);
      expect(result.prestigeChange).toBe(0);
    };

    it("should not return awards if no projects are eligible", () => {
      expectNoAwards([]);
    });

    it("should exclude projects released more than 52 weeks ago", () => {
      const oldProject = { ...eligibleProject, releaseWeek: 5 }; // 62 - 5 = 57 weeks ago
      expectNoAwards([oldProject]);
    });`;

code = code.replace(pattern1, replace1);

const pattern2 = `    it("should not consider projects that are not released or archived", () => {
      const inDevProject = {
        ...eligibleProject,
        id: "proj-dev",
        status: "development" as const,
        releaseWeek: 0
      };
      const inProdProject = {
        ...eligibleProject,
        id: "proj-prod",
        status: "production" as const,
        releaseWeek: 0
      };

      const state = { ...mockState, projects: [inDevProject, inProdProject] };
      const result = runAwardsCeremony(state, 62, 2024);

      expect(result.newAwards).toHaveLength(0);
      expect(result.prestigeChange).toBe(0);
    });`;

const replace2 = `    it("should not consider projects that are not released or archived", () => {
      const inDevProject = {
        ...eligibleProject,
        id: "proj-dev",
        status: "development" as const,
        releaseWeek: 0
      };
      const inProdProject = {
        ...eligibleProject,
        id: "proj-prod",
        status: "production" as const,
        releaseWeek: 0
      };

      expectNoAwards([inDevProject, inProdProject]);
    });`;

code = code.replace(pattern2, replace2);

fs.writeFileSync(file, code);

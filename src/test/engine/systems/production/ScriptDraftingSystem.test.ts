import { describe, it, expect } from 'vitest';
import { Project, ScriptedProject, FilmProject } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';
import { tickScriptDevelopment } from '@/engine/systems/production/ScriptDraftingSystem';

function createBaseProject(): FilmProject {
  return {
    id: "p1",
    title: "Test Movie",
    type: 'FILM',
    format: "film",
    genre: "Drama",
    budgetTier: "mid",
    budget: 10_000_000,
    weeklyCost: 100_000,
    targetAudience: "General",
    flavor: "Dramatic",
    state: "development",
    buzz: 50,
    weeksInPhase: 0,
    developmentWeeks: 10,
    productionWeeks: 10,
    revenue: 0,
    weeklyRevenue: 0,
    releaseWeek: null,
    accumulatedCost: 0,
    momentum: 50,
    progress: 0,
    activeCrisis: null,
    contentFlags: [],
    scriptHeat: 50,
    activeRoles: [],
    scriptEvents: []
  };
}

describe('ScriptDraftingSystem - Edge Cases', () => {
    it('returns unmodified project if not in development state', () => {
        const rng = new RandomGenerator(555);
        const project = createBaseProject();
        project.state = 'production';
        const result = tickScriptDevelopment(project, rng);
        expect(result.project).toBe(project);
    });

    it('returns unmodified project if not scripted', () => {
        const rng = new RandomGenerator(555);
        const project = createBaseProject() as unknown as Project;
        delete project.scriptHeat; // Remove scripted trait
        const result = tickScriptDevelopment(project as Project, rng);
        expect(result.project).toBe(project);
    });

    it('should cap scriptHeat at 100 and 0', () => {
       const rng = new RandomGenerator(555);
       rng.next = () => 0.9; // Avoid evolution events
       rng.rangeInt = () => 10; // Drift up
       const p1 = createBaseProject();
       p1.scriptHeat = 95;
       const result1 = tickScriptDevelopment(p1, rng);
       expect((result1.project as ScriptedProject).scriptHeat).toBe(100);

       rng.rangeInt = () => -10; // Drift down
       const p2 = createBaseProject();
       p2.scriptHeat = 5;
       const result2 = tickScriptDevelopment(p2, rng);
       expect((result2.project as ScriptedProject).scriptHeat).toBe(0);
    });

    it('should force ROLE_MERGE on low heat', () => {
       const rng = new RandomGenerator(555);
       rng.next = () => 0.1; // trigger evolution, then 0.1 for evolutionRoll < 0.4
       rng.rangeInt = () => 0; // No drift
       const p = createBaseProject();
       p.scriptHeat = 20;
       p.activeRoles = ['sidekick', 'love_interest', 'loose_cannon', 'femme_fatale'];
       p.buzz = 10;
       const result = tickScriptDevelopment(p, rng);
       const pOut = result.project as ScriptedProject;
       expect(pOut.activeRoles.length).toBe(3); // 4 -> 3
       expect(pOut.scriptEvents[0].type).toBe('ROLE_MERGE');
       expect(pOut.buzz).toBe(5); // 10 - 5
    });

    it('should force ROLE_SPLIT on high heat', () => {
       const rng = new RandomGenerator(555);
       let callCount = 0;
       rng.next = () => { callCount++; return callCount === 1 ? 0.1 : 0.9; }; // trigger evolution, then > 0.8
       rng.pick = () => 'sidekick';
       rng.rangeInt = () => 0;
       const p = createBaseProject();
       p.scriptHeat = 80;
       p.activeRoles = ['sidekick', 'love_interest', 'loose_cannon'];
       p.buzz = 10;
       const result = tickScriptDevelopment(p, rng);
       const pOut = result.project as ScriptedProject;
       expect(pOut.activeRoles.length).toBe(4);
       expect(pOut.scriptEvents[0].type).toBe('ROLE_SPLIT');
       expect(pOut.buzz).toBe(20); // 10 + 10
    });
});

import { describe, it, expect } from 'vitest';
import { Project, ScriptedProject } from '@/engine/types';
import { RandomGenerator } from '@/engine/utils/rng';
import { tickScriptDevelopment } from '@/engine/systems/production/ScriptDraftingSystem';
import { createMockProject } from '../../../utils/mockFactories';

describe('ScriptDraftingSystem - Edge Cases', () => {
    it('returns empty impacts if not in development state', () => {
        const rng = new RandomGenerator(555);
        const project = createMockProject({ state: 'production' });
        const impacts = tickScriptDevelopment(project, rng);
        expect(impacts).toEqual([]);
    });

    it('returns empty impacts if not scripted', () => {
        const rng = new RandomGenerator(555);
        const project = createMockProject({ state: 'development' });
        // Manually strip scripted fields to simulate non-scripted project
        const { scriptHeat, activeRoles, scriptEvents, ...nonScriptedProject } = project as any;
        const impacts = tickScriptDevelopment(nonScriptedProject as Project, rng);
        expect(impacts).toEqual([]);
    });

    it('should cap scriptHeat at 100 and 0', () => {
       const rng = new RandomGenerator(555);
       vi.spyOn(rng, 'next').mockReturnValue(0.9); // Avoid evolution events
       vi.spyOn(rng, 'rangeInt').mockReturnValue(10); // Drift up
       
       const p1 = createMockProject({ state: 'development', scriptHeat: 95 });
       const impacts1 = tickScriptDevelopment(p1, rng);
       const update1 = impacts1.find(i => i.type === 'PROJECT_UPDATED')?.payload.update;
       expect(update1?.scriptHeat).toBe(100);

       vi.spyOn(rng, 'rangeInt').mockReturnValue(-10); // Drift down
       const p2 = createMockProject({ state: 'development', scriptHeat: 5 });
       const impacts2 = tickScriptDevelopment(p2, rng);
       const update2 = impacts2.find(i => i.type === 'PROJECT_UPDATED')?.payload.update;
       expect(update2?.scriptHeat).toBe(0);
    });

    it('should force ROLE_MERGE on low heat', () => {
       const rng = new RandomGenerator(555);
       // 1st call (evolution check): 0.1 < 0.15
       // 2nd call (evolutionRoll): 0.1 < 0.4
       vi.spyOn(rng, 'next').mockReturnValue(0.1); 
       vi.spyOn(rng, 'rangeInt').mockReturnValue(0); // No drift
       
       const p = createMockProject({ 
         state: 'development', 
         scriptHeat: 20, 
         activeRoles: ['sidekick', 'love_interest', 'loose_cannon', 'femme_fatale'],
         buzz: 10 
       });
       const impacts = tickScriptDevelopment(p, rng);
       const update = impacts.find(i => i.type === 'PROJECT_UPDATED')?.payload.update;
       expect(update?.activeRoles.length).toBe(3); // 4 -> 3
       expect(update?.scriptEvents[0].type).toBe('ROLE_MERGE');
       expect(update?.buzz).toBe(5); // 10 - 5
    });

    it('should force ROLE_SPLIT on high heat', () => {
       const rng = new RandomGenerator(555);
       // 1st call (evolution check): 0.1 < 0.15
       // 2nd call (evolutionRoll): 0.9 > 0.8
       let callCount = 0;
       vi.spyOn(rng, 'next').mockImplementation(() => { 
         callCount++; 
         return callCount === 1 ? 0.1 : 0.9; 
       });
       vi.spyOn(rng, 'pick').mockReturnValue('sidekick' as any);
       vi.spyOn(rng, 'rangeInt').mockReturnValue(0);
       
       const p = createMockProject({ 
         state: 'development', 
         scriptHeat: 80, 
         activeRoles: ['sidekick', 'love_interest', 'loose_cannon'],
         buzz: 10 
       });
       const impacts = tickScriptDevelopment(p, rng);
       const update = impacts.find(i => i.type === 'PROJECT_UPDATED')?.payload.update;
       expect(update?.activeRoles.length).toBe(4);
       expect(update?.scriptEvents[0].type).toBe('ROLE_SPLIT');
       expect(update?.buzz).toBe(20); // 10 + 10
    });
});

describe('ScriptDraftingSystem - General Evolution', () => {
    it('triggers PLOT_TWIST_ADDED and DIALOGUE_POLISH correctly', () => {
       const rng = new RandomGenerator(555);

       let callCount = 0;
       vi.spyOn(rng, 'next').mockImplementation(() => {
         callCount++;
         return callCount === 1 ? 0.1 : 0.6; // < 0.15 for event, > 0.5 for twist
       });
       vi.spyOn(rng, 'rangeInt').mockReturnValue(0);

       const p1 = createMockProject({ state: 'development', scriptHeat: 50, buzz: 10 });
       const impacts1 = tickScriptDevelopment(p1, rng);
       const update1 = impacts1.find(i => i.type === 'PROJECT_UPDATED')?.payload.update;
       expect(update1?.scriptEvents[0].type).toBe('PLOT_TWIST_ADDED');
       expect(update1?.buzz).toBe(22); // 10 + 12

       callCount = 0;
       vi.spyOn(rng, 'next').mockImplementation(() => {
         callCount++;
         return callCount === 1 ? 0.1 : 0.45; // < 0.15 for event, <= 0.5 for polish
       });
       const p2 = createMockProject({ state: 'development', scriptHeat: 50, buzz: 10 });
       const impacts2 = tickScriptDevelopment(p2, rng);
       const update2 = impacts2.find(i => i.type === 'PROJECT_UPDATED')?.payload.update;
       expect(update2?.scriptEvents[0].type).toBe('DIALOGUE_POLISH');
       expect(update2?.buzz).toBe(15); // 10 + 5
    });
});

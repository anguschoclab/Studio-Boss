import { SimulationRunner } from './SimulationRunner';
import { ArchetypeKey } from '@/engine/types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * CLI Run Script for Headless Simulation
 * Execution: bun src/engine/simulation/run.ts --weeks 104 --runs 1
 */

declare const Bun: any;

const args = (process.argv || []).slice(2);
const weeks = parseInt(args.find((_: string, i: number) => args[i-1] === '--weeks') || '104');
const runs = parseInt(args.find((_: string, i: number) => args[i-1] === '--runs') || '1');
const archetype = (args.find((_: string, i: number) => args[i-1] === '--archetype') || 'major') as ArchetypeKey;
const persona = args.find((_: string, i: number) => args[i-1] === '--persona') || 'balanced';
const seed = parseInt(args.find((_: string, i: number) => args[i-1] === '--seed') || Date.now().toString().slice(-4));

console.log(`🚀 Starting Studio Boss Headless Simulation...`);
console.log(`Weeks: ${weeks} | Archetype: ${archetype} | Persona: ${persona} | Seed: ${seed} | Runs: ${runs}\n`);

for (let r = 0; r < runs; r++) {
  const currentSeed = seed + r;
  const result = SimulationRunner.run(weeks, currentSeed, archetype, persona, true);
  
  const report = result.metrics.getSummaryReport();
  console.log(`Run ${r + 1}: ${report}`);

  // Save detailed history
  const dir = path.join(process.cwd(), 'sim-reports');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  
  const filename = `sim_${archetype}_w${weeks}_s${currentSeed}_${Date.now()}.json`;
  const filepath = path.join(dir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(result.metrics.getHistory(), null, 2));
  console.log(`✅ Detailed report saved to: ${filepath}\n`);
}

console.log('--- ALL SIMULATIONS COMPLETE ---');

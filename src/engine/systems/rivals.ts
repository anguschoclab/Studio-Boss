import { RivalStudio } from '../types';
import { pick, clamp, randRange } from '../utils';

const ACTIVITIES = [
  'Quietly developing a prestige drama slate',
  'Aggressively acquiring IP rights',
  'Restructuring after a box office disappointment',
  'Riding high on a recent blockbuster success',
  'Expanding into international co-productions',
  'Courting A-list talent with lucrative deals',
  'Focusing on streaming-first releases',
  'Doubling down on franchise expansion',
  'Launching an ambitious awards campaign',
  'Pivoting strategy after executive shakeup',
];

export function updateRival(rival: RivalStudio): RivalStudio {
  const r = { ...rival };
  r.strength = clamp(r.strength + randRange(-3, 3), 20, 100);
  r.cash += randRange(-5_000_000, 20_000_000);
  if (Math.random() < 0.25) {
    r.recentActivity = pick(ACTIVITIES);
  }
  if (Math.random() < 0.15) {
    r.projectCount = Math.max(1, r.projectCount + (Math.random() < 0.7 ? 1 : -1));
  }
  return r;
}

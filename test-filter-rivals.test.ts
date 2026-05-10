import { describe, test, expect } from 'vitest';
import { bench } from 'vitest'; // assuming we had vitest benchmarking available, but we'll use performance.now

const numRivals = 100;
const targetId = 'target_123';
const targetPrestige = 30;
const rivalObj: Record<string, any> = {};

for (let i = 0; i < numRivals; i++) {
  const id = `rival_${i}`;
  rivalObj[id] = {
    id,
    cash: i % 2 === 0 ? 1000000000 : 100000,
    prestige: i % 3 === 0 ? 10 : 80
  };
}

function method1() {
  const rivals = Object.values(rivalObj);
  const buyers = rivals.filter(r => r.id !== targetId && (r.cash || 0) > 300_000_000);
  return buyers;
}

function method2() {
  const buyers = [];
  for (const id in rivalObj) {
    if (id !== targetId && (rivalObj[id].cash || 0) > 300_000_000) {
      buyers.push(rivalObj[id]);
    }
  }
  return buyers;
}

test('compare distress cascade loop', () => {
  const start1 = performance.now();
  for (let i = 0; i < 10000; i++) method1();
  const t1 = performance.now() - start1;

  const start2 = performance.now();
  for (let i = 0; i < 10000; i++) method2();
  const t2 = performance.now() - start2;

  console.log(`Method 1 (Object.values + filter): ${t1.toFixed(2)}ms`);
  console.log(`Method 2 (for..in): ${t2.toFixed(2)}ms`);
  expect(true).toBe(true);
});

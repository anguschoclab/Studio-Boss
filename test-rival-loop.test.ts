import { describe, test, expect } from 'vitest';

const numTalents = 5000;
const talentPoolArray = Array.from({ length: numTalents }, (_, i) => ({
  id: `T${i}`,
  prestige: Math.random() * 100,
  name: `Talent ${i}`
}));
const talentsObj: Record<string, any> = {};
talentPoolArray.forEach(t => { talentsObj[t.id] = t; });

// method1: current advanceRivals approach (doing Object.values for each rival)
function method1(numRivals) {
  let count = 0;
  for (let i = 0; i < numRivals; i++) {
    const arr = Object.values(talentsObj);
    const stars = arr.filter(t => t.prestige > 80);
    if (stars.length > 0) count++;
  }
  return count;
}

// method2: hoist Object.values outside the loop
function method2(numRivals) {
  let count = 0;
  const arr = Object.values(talentsObj);
  for (let i = 0; i < numRivals; i++) {
    const stars = arr.filter(t => t.prestige > 80);
    if (stars.length > 0) count++;
  }
  return count;
}

// method3: hoist + for loop for filtering instead of creating an array inside another array
function method3(numRivals) {
  let count = 0;
  // hoist the filtered array!
  const stars = [];
  for(const id in talentsObj) {
     if(talentsObj[id].prestige > 80) stars.push(talentsObj[id]);
  }

  for (let i = 0; i < numRivals; i++) {
    if (stars.length > 0) count++;
  }
  return count;
}


test('compare advanceRivals', () => {
  const start1 = performance.now();
  for (let i = 0; i < 100; i++) method1(20);
  const t1 = performance.now() - start1;

  const start2 = performance.now();
  for (let i = 0; i < 100; i++) method2(20);
  const t2 = performance.now() - start2;

  const start3 = performance.now();
  for (let i = 0; i < 100; i++) method3(20);
  const t3 = performance.now() - start3;

  console.log(`Method 1 (current): ${t1.toFixed(2)}ms`);
  console.log(`Method 2 (hoist Object.values): ${t2.toFixed(2)}ms`);
  console.log(`Method 3 (hoist filtered array): ${t3.toFixed(2)}ms`);
  expect(true).toBe(true);
});

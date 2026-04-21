import { vi } from 'vitest';
let callCount = 0;
const mock = vi.fn().mockImplementation(() => {
  callCount++;
  if (callCount === 1) return 0.9;
  return 0.1;
});
console.log(mock());
console.log(mock());
console.log(mock());

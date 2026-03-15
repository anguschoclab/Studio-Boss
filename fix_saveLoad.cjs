const fs = require('fs');
const file = 'src/persistence/saveLoad.ts';
let code = fs.readFileSync(file, 'utf8');

const target1 = `    let slots: Record<number, SaveSlotMeta> = {};
    try {
      const slotsData = localStorage.getItem(SLOTS_KEY);
      if (slotsData) {
        slots = JSON.parse(slotsData);
      }
    } catch (e) {
      console.error('Failed to load save slots metadata', e);
    }`;

const target2 = `  let slots: Record<number, SaveSlotMeta> = {};
  try {
    const slotsData = localStorage.getItem(SLOTS_KEY);
    if (slotsData) {
      slots = JSON.parse(slotsData);
    }
  } catch (e) {
    console.error('Failed to get save slots', e);
  }`;

const helper = `function loadSaveSlots(): Record<number, SaveSlotMeta> {
  let slots: Record<number, SaveSlotMeta> = {};
  try {
    const slotsData = localStorage.getItem(SLOTS_KEY);
    if (slotsData) {
      slots = JSON.parse(slotsData);
    }
  } catch (e) {
    console.error('Failed to load save slots metadata', e);
  }
  return slots;
}

export function saveGame`;

code = code.replace(`export function saveGame`, helper);
code = code.replace(target1, `    let slots = loadSaveSlots();`);
code = code.replace(target2, `  let slots = loadSaveSlots();`);

fs.writeFileSync(file, code);

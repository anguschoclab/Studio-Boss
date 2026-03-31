/**
 * Procedural Avatar Generator
 * 
 * Generates deterministic SVG human face avatars from talent demographics.
 * Uses the talent ID as a seed so the same talent always gets the same face.
 * Supports age progression, family resemblance, and demographic accuracy.
 */

import { Talent, TalentDemographics } from '../types/talent.types';

// ─── Deterministic Hash ─────────────────────────────────────────────────────

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/** Mulberry32 seeded PRNG */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededRange(rand: () => number, min: number, max: number): number {
  return min + rand() * (max - min);
}

function seededPick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

// ─── Color Palettes ─────────────────────────────────────────────────────────

interface SkinPalette {
  base: string;
  shadow: string;
  highlight: string;
}

const SKIN_PALETTES: Record<string, SkinPalette[]> = {
  'Caucasian': [
    { base: '#F5D0B0', shadow: '#D4A574', highlight: '#FFE4CC' },
    { base: '#F0C8A0', shadow: '#D09868', highlight: '#FFD8BA' },
    { base: '#E8C0A0', shadow: '#C89470', highlight: '#FFDDC4' },
    { base: '#FDDCBE', shadow: '#DFAE82', highlight: '#FFF0E0' },
  ],
  'Black': [
    { base: '#8D5524', shadow: '#6B3A1A', highlight: '#A66B3A' },
    { base: '#6B4226', shadow: '#4A2E1A', highlight: '#8B5A3A' },
    { base: '#A0714F', shadow: '#7A5335', highlight: '#BA8B65' },
    { base: '#5C3A1E', shadow: '#402810', highlight: '#7A5234' },
  ],
  'Hispanic': [
    { base: '#C68642', shadow: '#A06830', highlight: '#DCA060' },
    { base: '#D4A06A', shadow: '#B08050', highlight: '#E8BA84' },
    { base: '#C69C6D', shadow: '#A07C50', highlight: '#DEB888' },
    { base: '#BA8B5A', shadow: '#9A6B40', highlight: '#D4A574' },
  ],
  'Asian': [
    { base: '#F5DEB3', shadow: '#D4BC8A', highlight: '#FFF0D0' },
    { base: '#F0D5A0', shadow: '#D0B080', highlight: '#FFE8C0' },
    { base: '#E8D0A8', shadow: '#C8B088', highlight: '#FFF0CA' },
    { base: '#FDDCB5', shadow: '#D8B88A', highlight: '#FFF4DA' },
  ],
  'South Asian': [
    { base: '#B07040', shadow: '#8A5530', highlight: '#CA8A58' },
    { base: '#A06535', shadow: '#804D28', highlight: '#BF7F50' },
    { base: '#C08050', shadow: '#9A6238', highlight: '#DA9A68' },
    { base: '#9A6040', shadow: '#7A4830', highlight: '#B47A58' },
  ],
  'Middle Eastern': [
    { base: '#D4A870', shadow: '#B48850', highlight: '#EAC490' },
    { base: '#C89860', shadow: '#A87840', highlight: '#E0B478' },
    { base: '#D0A068', shadow: '#B08048', highlight: '#E8BC88' },
    { base: '#C4945A', shadow: '#A47440', highlight: '#DCB078' },
  ],
  'Mixed': [
    { base: '#C8956A', shadow: '#A87550', highlight: '#E0B088' },
    { base: '#D4A878', shadow: '#B48858', highlight: '#EAC498' },
    { base: '#BA8860', shadow: '#9A6A44', highlight: '#D4A47A' },
    { base: '#C0905C', shadow: '#A07040', highlight: '#DAAA78' },
  ],
};

interface HairColor {
  primary: string;
  secondary: string;
}

const HAIR_COLORS_BY_ETHNICITY: Record<string, HairColor[]> = {
  'Caucasian': [
    { primary: '#3B2314', secondary: '#5A3828' }, // Dark brown
    { primary: '#8B6914', secondary: '#A88430' }, // Dirty blonde
    { primary: '#D4A03A', secondary: '#E8C060' }, // Blonde
    { primary: '#C03020', secondary: '#E04838' }, // Red
    { primary: '#1A1A1A', secondary: '#333333' }, // Black
  ],
  'Black': [
    { primary: '#0A0A0A', secondary: '#222222' },
    { primary: '#1A1008', secondary: '#2A2018' },
    { primary: '#2A1A0E', secondary: '#3A2A1E' },
  ],
  'Hispanic': [
    { primary: '#1A0E08', secondary: '#2A1E18' },
    { primary: '#2A1810', secondary: '#3A2820' },
    { primary: '#0A0A0A', secondary: '#222222' },
  ],
  'Asian': [
    { primary: '#0A0A0A', secondary: '#1A1A1A' },
    { primary: '#1A1008', secondary: '#2A2018' },
    { primary: '#2A1A10', secondary: '#3A2A20' },
  ],
  'South Asian': [
    { primary: '#0A0A0A', secondary: '#1A1A1A' },
    { primary: '#1A0E08', secondary: '#2A1E18' },
  ],
  'Middle Eastern': [
    { primary: '#0A0A0A', secondary: '#1A1A1A' },
    { primary: '#1A0E08', secondary: '#2A1E18' },
    { primary: '#2A1810', secondary: '#3A2820' },
  ],
  'Mixed': [
    { primary: '#1A1008', secondary: '#2A2018' },
    { primary: '#3B2314', secondary: '#5A3828' },
    { primary: '#0A0A0A', secondary: '#222222' },
    { primary: '#8B6914', secondary: '#A88430' },
  ],
};

const EYE_COLORS = [
  '#3B2F2B', // Dark brown
  '#634E34', // Brown 
  '#5B7553', // Green
  '#4682B4', // Blue
  '#6B4423', // Amber
  '#2F4F4F', // Dark gray-green
  '#191970', // Deep blue
] as const;

const GRAY_HAIR: HairColor = { primary: '#A0A0A0', secondary: '#C8C8C8' };
const WHITE_HAIR: HairColor = { primary: '#D0D0D0', secondary: '#E8E8E8' };

// ─── Age Calculation ────────────────────────────────────────────────────────

function getVisualAge(baseAge: number, currentWeek: number): number {
  // Each 52 weeks = 1 year of aging
  const yearsElapsed = Math.floor((currentWeek - 1) / 52);
  return baseAge + yearsElapsed;
}

type AgeBracket = 'child' | 'teen' | 'youngAdult' | 'adult' | 'mature' | 'senior';

function getAgeBracket(age: number): AgeBracket {
  if (age <= 12) return 'child';
  if (age <= 17) return 'teen';
  if (age <= 35) return 'youngAdult';
  if (age <= 55) return 'adult';
  if (age <= 70) return 'mature';
  return 'senior';
}

// ─── Feature Derivation ────────────────────────────────────────────────────

interface AvatarFeatures {
  // Face geometry
  faceWidth: number;      // 0-1
  faceHeight: number;     // 0-1  
  jawWidth: number;       // 0-1
  chinPointiness: number; // 0-1
  foreheadHeight: number; // 0-1
  
  // Eyes
  eyeSize: number;        // 0-1
  eyeSpacing: number;     // 0-1
  eyeSlant: number;       // -1 to 1
  eyeColor: string;
  hasEpicanthicFold: boolean;
  browThickness: number;  // 0-1
  browArch: number;       // 0-1
  
  // Nose
  noseWidth: number;      // 0-1
  noseLength: number;     // 0-1
  noseBridge: number;     // 0-1 (thin to wide bridge)
  
  // Mouth
  mouthWidth: number;     // 0-1
  lipFullness: number;    // 0-1
  
  // Hair
  hairStyle: number;      // 0-5 index
  hairColor: HairColor;
  hairLine: number;       // 0-1 (lower = receding)
  
  // Skin
  skin: SkinPalette;
  
  // Age effects
  wrinkleOpacity: number; // 0-1
  grayAmount: number;     // 0-1
  jowlAmount: number;     // 0-1
  ageBracket: AgeBracket;
  
  // Gender presentation cues
  gender: 'MALE' | 'FEMALE' | 'NON_BINARY';
  hasBeard: boolean;
  beardStyle: number;
}

function deriveFeatures(
  talent: Talent, 
  currentWeek: number = 1
): AvatarFeatures {
  const { demographics } = talent;
  const visualAge = getVisualAge(demographics.age, currentWeek);
  const ageBracket = getAgeBracket(visualAge);
  
  // Primary seed from talent ID
  const primarySeed = hashString(talent.id);
  const rand = seededRandom(primarySeed);
  
  // Family seed for inherited traits (if nepo-baby)
  const familySeed = talent.familyId ? hashString(talent.familyId) : primarySeed;
  const familyRand = seededRandom(familySeed);
  
  // ── Skin ──
  const skinPalettes = SKIN_PALETTES[demographics.ethnicity] || SKIN_PALETTES['Mixed'];
  const skin = seededPick(familyRand, skinPalettes); // Family-inherited
  
  // ── Hair color ──
  const baseHairColors = HAIR_COLORS_BY_ETHNICITY[demographics.ethnicity] || HAIR_COLORS_BY_ETHNICITY['Mixed'];
  let hairColor = seededPick(familyRand, baseHairColors); // Family-inherited base color
  
  // Gray/white hair based on age
  let grayAmount = 0;
  if (visualAge > 40) {
    grayAmount = Math.min(1, (visualAge - 40) / 40); // Fully gray by ~80
    // Add personal variation
    grayAmount *= (0.5 + rand() * 0.5);
  }
  
  if (grayAmount > 0.8) {
    hairColor = WHITE_HAIR;
  } else if (grayAmount > 0.4) {
    hairColor = GRAY_HAIR;
  } else if (grayAmount > 0.15) {
    // Blend toward gray
    hairColor = {
      primary: blendColor(hairColor.primary, GRAY_HAIR.primary, grayAmount),
      secondary: blendColor(hairColor.secondary, GRAY_HAIR.secondary, grayAmount),
    };
  }
  
  // ── Eyes ──
  // Eye color distribution varies by ethnicity
  let eyeColorPool: string[];
  if (['Black', 'Asian', 'South Asian', 'Hispanic'].includes(demographics.ethnicity)) {
    eyeColorPool = ['#3B2F2B', '#634E34', '#3B2F2B', '#6B4423']; // Mostly brown
  } else if (demographics.ethnicity === 'Caucasian') {
    eyeColorPool = [...EYE_COLORS]; // Full range
  } else {
    eyeColorPool = ['#3B2F2B', '#634E34', '#5B7553', '#6B4423'];
  }
  const eyeColor = seededPick(rand, eyeColorPool);
  
  const hasEpicanthicFold = ['Asian'].includes(demographics.ethnicity) || 
    (demographics.ethnicity === 'Mixed' && rand() < 0.3);
  
  // ── Face shape — blend of personal and family traits ──
  const familyFaceWidth = 0.3 + familyRand() * 0.4;  // Family trait
  const personalFaceWidth = 0.3 + rand() * 0.4;       // Personal variation
  const faceWidth = talent.familyId 
    ? familyFaceWidth * 0.6 + personalFaceWidth * 0.4  // 60% family, 40% personal
    : personalFaceWidth;
  
  const familyJawWidth = 0.3 + familyRand() * 0.4;
  const personalJawWidth = 0.3 + rand() * 0.4;
  const jawWidth = talent.familyId
    ? familyJawWidth * 0.6 + personalJawWidth * 0.4
    : personalJawWidth;
    
  const familyChinPointiness = rand() * 0.6;
  const personalChinPointiness = rand() * 0.6;
  const chinPointiness = talent.familyId
    ? familyRand() * 0.6 * 0.6 + personalChinPointiness * 0.4
    : personalChinPointiness;
  
  // Nose — strongly inherited
  const familyNoseWidth = 0.2 + familyRand() * 0.6;
  const personalNoseWidth = 0.2 + rand() * 0.6;
  const noseWidth = talent.familyId
    ? familyNoseWidth * 0.7 + personalNoseWidth * 0.3
    : personalNoseWidth;
  
  const familyNoseBridge = 0.2 + familyRand() * 0.6;
  const personalNoseBridge = 0.2 + rand() * 0.6;
  const noseBridge = talent.familyId
    ? familyNoseBridge * 0.7 + personalNoseBridge * 0.3
    : personalNoseBridge;
  
  // ── Age effects on proportions ──
  let eyeSize = 0.3 + rand() * 0.4;
  let faceHeight = 0.5 + rand() * 0.3;
  let foreheadHeight = 0.3 + rand() * 0.3;
  
  if (ageBracket === 'child') {
    eyeSize = Math.min(1, eyeSize * 1.5);  // Children have proportionally larger eyes
    faceHeight *= 0.85;                       // Rounder face
  } else if (ageBracket === 'teen') {
    eyeSize = Math.min(1, eyeSize * 1.2);
    faceHeight *= 0.92;
  }
  
  // Wrinkles increase with age
  let wrinkleOpacity = 0;
  if (visualAge > 35) wrinkleOpacity = Math.min(1, (visualAge - 35) / 45);
  
  // Jowls / sagging with age
  let jowlAmount = 0;
  if (visualAge > 50) jowlAmount = Math.min(1, (visualAge - 50) / 30);
  
  // ── Hair ──
  const hairLine = demographics.gender === 'MALE' 
    ? Math.max(0.2, 1 - (visualAge > 30 ? (visualAge - 30) * 0.015 * rand() : 0)) // Men may recede
    : 0.9 + rand() * 0.1; // Women generally keep hairline
  
  // Hair styles: 0-2 for male-leaning, 3-5 for female-leaning
  let hairStyle: number;
  if (demographics.gender === 'MALE') {
    hairStyle = Math.floor(rand() * 3);
  } else if (demographics.gender === 'FEMALE') {
    hairStyle = 3 + Math.floor(rand() * 3);
  } else {
    hairStyle = Math.floor(rand() * 6);
  }
  
  // ── Beard (male only, age-dependent) ──
  const hasBeard = demographics.gender === 'MALE' && visualAge >= 18 && rand() < 0.35;
  const beardStyle = Math.floor(rand() * 3);
  
  // ── Gender-based adjustments ──
  let browThickness = 0.3 + rand() * 0.5;
  let lipFullness = 0.3 + rand() * 0.5;
  let mouthWidth = 0.3 + rand() * 0.4;
  
  if (demographics.gender === 'FEMALE') {
    browThickness *= 0.7;   // Thinner brows
    lipFullness *= 1.2;     // Fuller lips
    mouthWidth *= 0.9;
  } else if (demographics.gender === 'MALE') {
    browThickness *= 1.2;
    lipFullness *= 0.85;
  }
  
  // Ethnicity-influenced features
  if (['Black', 'Hispanic'].includes(demographics.ethnicity)) {
    lipFullness = Math.min(1, lipFullness * 1.2);
  }
  if (['Asian', 'South Asian'].includes(demographics.ethnicity)) {
    noseBridge * 0.8; // Slightly flatter bridge
  }
  
  return {
    faceWidth: Math.min(1, Math.max(0, faceWidth)),
    faceHeight: Math.min(1, Math.max(0, faceHeight)),
    jawWidth: Math.min(1, Math.max(0, jawWidth)),
    chinPointiness: Math.min(1, Math.max(0, chinPointiness)),
    foreheadHeight: Math.min(1, Math.max(0, foreheadHeight)),
    eyeSize: Math.min(1, Math.max(0, eyeSize)),
    eyeSpacing: 0.3 + rand() * 0.4,
    eyeSlant: hasEpicanthicFold ? 0.1 + rand() * 0.2 : -0.1 + rand() * 0.2,
    eyeColor,
    hasEpicanthicFold,
    browThickness: Math.min(1, Math.max(0, browThickness)),
    browArch: 0.2 + rand() * 0.5,
    noseWidth: Math.min(1, Math.max(0, noseWidth)),
    noseLength: 0.3 + rand() * 0.4,
    noseBridge: Math.min(1, Math.max(0, noseBridge)),
    mouthWidth: Math.min(1, Math.max(0, mouthWidth)),
    lipFullness: Math.min(1, Math.max(0, lipFullness)),
    hairStyle,
    hairColor,
    hairLine,
    skin,
    wrinkleOpacity,
    grayAmount,
    jowlAmount,
    ageBracket,
    gender: demographics.gender,
    hasBeard,
    beardStyle,
  };
}

// ─── Color Utilities ────────────────────────────────────────────────────────

function blendColor(hex1: string, hex2: string, amount: number): string {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * amount);
  const g = Math.round(g1 + (g2 - g1) * amount);
  const b = Math.round(b1 + (b2 - b1) * amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function darkenColor(hex: string, amount: number): string {
  return blendColor(hex, '#000000', amount);
}

function lightenColor(hex: string, amount: number): string {
  return blendColor(hex, '#FFFFFF', amount);
}

// ─── SVG Rendering ──────────────────────────────────────────────────────────

export function generateAvatarSVG(talent: Talent, currentWeek: number = 1): string {
  const f = deriveFeatures(talent, currentWeek);
  
  // SVG canvas: 200x200 viewBox
  const cx = 100; // Center x
  const cy = 108; // Center y (slightly below midpoint for head room)
  
  // Face dimensions
  const faceW = 58 + f.faceWidth * 24;   // 58-82
  const faceH = 68 + f.faceHeight * 22;  // 68-90
  const jawW = faceW * (0.7 + f.jawWidth * 0.25);
  const chinY = cy + faceH * 0.48;
  const chinPoint = f.chinPointiness * 8;
  
  // Jowl effect (aging)
  const jowlOffset = f.jowlAmount * 4;
  
  const uid = `av-${hashString(talent.id).toString(36)}`;
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">`;
  
  // ── Defs (gradients and filters) ──
  svg += `<defs>`;
  svg += `<radialGradient id="${uid}-skin" cx="45%" cy="35%" r="60%">`;
  svg += `<stop offset="0%" stop-color="${f.skin.highlight}"/>`;
  svg += `<stop offset="60%" stop-color="${f.skin.base}"/>`;
  svg += `<stop offset="100%" stop-color="${f.skin.shadow}"/>`;
  svg += `</radialGradient>`;
  svg += `<clipPath id="${uid}-clip"><ellipse cx="${cx}" cy="${cy}" rx="${faceW/2 + 2}" ry="${faceH/2 + 2}"/></clipPath>`;
  svg += `</defs>`;
  
  // ── Background circle ──
  svg += `<circle cx="100" cy="100" r="98" fill="${darkenColor(f.skin.shadow, 0.6)}" opacity="0.3"/>`;
  
  // ── Neck ──
  const neckW = 22 + f.faceWidth * 8;
  const neckTop = chinY - 8;
  svg += `<rect x="${cx - neckW/2}" y="${neckTop}" width="${neckW}" height="40" rx="8" fill="${f.skin.shadow}"/>`;
  
  // ── Ears ──
  const earY = cy - 4;
  const earH = 16 + f.faceHeight * 6;
  svg += `<ellipse cx="${cx - faceW/2 + 2}" cy="${earY}" rx="6" ry="${earH/2}" fill="${f.skin.base}" stroke="${f.skin.shadow}" stroke-width="0.8"/>`;
  svg += `<ellipse cx="${cx + faceW/2 - 2}" cy="${earY}" rx="6" ry="${earH/2}" fill="${f.skin.base}" stroke="${f.skin.shadow}" stroke-width="0.8"/>`;
  
  // ── Face shape ──
  // Using an ellipse as the base with path modifications for jaw
  svg += `<ellipse cx="${cx}" cy="${cy}" rx="${faceW/2}" ry="${faceH/2}" fill="url(#${uid}-skin)" stroke="${f.skin.shadow}" stroke-width="0.5"/>`;
  
  // Jaw/chin overlay for shape variation
  if (f.chinPointiness > 0.2 || f.jowlAmount > 0) {
    const jawPath = [
      `M ${cx - jawW/2 - jowlOffset} ${cy + faceH * 0.1}`,
      `Q ${cx - jawW/3} ${chinY + 2 + jowlOffset} ${cx} ${chinY + chinPoint}`,
      `Q ${cx + jawW/3} ${chinY + 2 + jowlOffset} ${cx + jawW/2 + jowlOffset} ${cy + faceH * 0.1}`,
    ].join(' ');
    svg += `<path d="${jawPath}" fill="url(#${uid}-skin)" stroke="${f.skin.shadow}" stroke-width="0.3"/>`;
  }
  
  // ── Hair (back layer for some styles) ──
  svg += renderHairBack(f, cx, cy, faceW, faceH, uid);
  
  // ── Eyebrows ──
  const browY = cy - faceH * 0.18;
  const browSpacing = 12 + f.eyeSpacing * 10;
  const browLen = 14 + f.browThickness * 6;
  const browThick = 2 + f.browThickness * 2.5;
  const browArchOffset = f.browArch * 4;
  
  // Left brow
  svg += `<path d="M ${cx - browSpacing - browLen/2} ${browY + 1} Q ${cx - browSpacing} ${browY - browArchOffset} ${cx - browSpacing + browLen/2} ${browY + 1}" stroke="${darkenColor(f.hairColor.primary, 0.2)}" stroke-width="${browThick}" stroke-linecap="round" fill="none"/>`;
  // Right brow
  svg += `<path d="M ${cx + browSpacing - browLen/2} ${browY + 1} Q ${cx + browSpacing} ${browY - browArchOffset} ${cx + browSpacing + browLen/2} ${browY + 1}" stroke="${darkenColor(f.hairColor.primary, 0.2)}" stroke-width="${browThick}" stroke-linecap="round" fill="none"/>`;
  
  // ── Eyes ──
  const eyeY = cy - faceH * 0.08;
  const eyeSpacing = 12 + f.eyeSpacing * 10;
  const eyeW = 8 + f.eyeSize * 7;
  const eyeH = 5 + f.eyeSize * 5;
  const slantOffset = f.eyeSlant * 3;
  
  // Eye whites
  svg += `<ellipse cx="${cx - eyeSpacing}" cy="${eyeY}" rx="${eyeW}" ry="${eyeH}" fill="#FFFDF5" stroke="${f.skin.shadow}" stroke-width="0.5" transform="rotate(${slantOffset} ${cx - eyeSpacing} ${eyeY})"/>`;
  svg += `<ellipse cx="${cx + eyeSpacing}" cy="${eyeY}" rx="${eyeW}" ry="${eyeH}" fill="#FFFDF5" stroke="${f.skin.shadow}" stroke-width="0.5" transform="rotate(${-slantOffset} ${cx + eyeSpacing} ${eyeY})"/>`;
  
  // Irises
  const irisR = eyeH * 0.7;
  svg += `<circle cx="${cx - eyeSpacing}" cy="${eyeY}" r="${irisR}" fill="${f.eyeColor}"/>`;
  svg += `<circle cx="${cx + eyeSpacing}" cy="${eyeY}" r="${irisR}" fill="${f.eyeColor}"/>`;
  
  // Pupils
  const pupilR = irisR * 0.45;
  svg += `<circle cx="${cx - eyeSpacing}" cy="${eyeY}" r="${pupilR}" fill="#0A0A0A"/>`;
  svg += `<circle cx="${cx + eyeSpacing}" cy="${eyeY}" r="${pupilR}" fill="#0A0A0A"/>`;
  
  // Eye highlights
  svg += `<circle cx="${cx - eyeSpacing + irisR * 0.3}" cy="${eyeY - irisR * 0.3}" r="${pupilR * 0.5}" fill="white" opacity="0.7"/>`;
  svg += `<circle cx="${cx + eyeSpacing + irisR * 0.3}" cy="${eyeY - irisR * 0.3}" r="${pupilR * 0.5}" fill="white" opacity="0.7"/>`;
  
  // Upper eyelid line
  svg += `<path d="M ${cx - eyeSpacing - eyeW} ${eyeY} Q ${cx - eyeSpacing} ${eyeY - eyeH - 1} ${cx - eyeSpacing + eyeW} ${eyeY}" stroke="${darkenColor(f.skin.shadow, 0.3)}" stroke-width="1.2" fill="none" transform="rotate(${slantOffset} ${cx - eyeSpacing} ${eyeY})"/>`;
  svg += `<path d="M ${cx + eyeSpacing - eyeW} ${eyeY} Q ${cx + eyeSpacing} ${eyeY - eyeH - 1} ${cx + eyeSpacing + eyeW} ${eyeY}" stroke="${darkenColor(f.skin.shadow, 0.3)}" stroke-width="1.2" fill="none" transform="rotate(${-slantOffset} ${cx + eyeSpacing} ${eyeY})"/>`;
  
  // Epicanthic fold
  if (f.hasEpicanthicFold) {
    svg += `<path d="M ${cx - eyeSpacing - eyeW + 2} ${eyeY + 1} Q ${cx - eyeSpacing - eyeW + 4} ${eyeY - 2} ${cx - eyeSpacing - eyeW + 8} ${eyeY}" stroke="${f.skin.shadow}" stroke-width="0.8" fill="none"/>`;
    svg += `<path d="M ${cx + eyeSpacing + eyeW - 2} ${eyeY + 1} Q ${cx + eyeSpacing + eyeW - 4} ${eyeY - 2} ${cx + eyeSpacing + eyeW - 8} ${eyeY}" stroke="${f.skin.shadow}" stroke-width="0.8" fill="none"/>`;
  }
  
  // ── Nose ──
  const noseY = cy + faceH * 0.08;
  const noseW = 6 + f.noseWidth * 10;
  const noseLen = 10 + f.noseLength * 10;
  const bridgeW = 2 + f.noseBridge * 4;
  
  // Nose bridge line
  svg += `<path d="M ${cx - bridgeW/2} ${eyeY + eyeH + 2} L ${cx - noseW/2} ${noseY + noseLen/2} Q ${cx} ${noseY + noseLen/2 + 3} ${cx + noseW/2} ${noseY + noseLen/2} L ${cx + bridgeW/2} ${eyeY + eyeH + 2}" stroke="${f.skin.shadow}" stroke-width="0.8" fill="none" opacity="0.6"/>`;
  
  // Nose tip/nostrils
  svg += `<ellipse cx="${cx}" cy="${noseY + noseLen/2}" rx="${noseW/2}" ry="${noseW/3}" fill="${f.skin.shadow}" opacity="0.15"/>`;
  // Nostril dots
  svg += `<circle cx="${cx - noseW/3}" cy="${noseY + noseLen/2 + 1}" r="1.5" fill="${f.skin.shadow}" opacity="0.3"/>`;
  svg += `<circle cx="${cx + noseW/3}" cy="${noseY + noseLen/2 + 1}" r="1.5" fill="${f.skin.shadow}" opacity="0.3"/>`;
  
  // ── Mouth ──
  const mouthY = cy + faceH * 0.28;
  const mouthW = 10 + f.mouthWidth * 14;
  const lipH = 2 + f.lipFullness * 4;
  const lipColor = blendColor(f.skin.base, '#C06060', 0.3 + f.lipFullness * 0.2);
  
  // Upper lip
  svg += `<path d="M ${cx - mouthW/2} ${mouthY} Q ${cx - mouthW/4} ${mouthY - lipH} ${cx} ${mouthY - lipH * 0.6} Q ${cx + mouthW/4} ${mouthY - lipH} ${cx + mouthW/2} ${mouthY}" fill="${lipColor}" stroke="${darkenColor(lipColor, 0.2)}" stroke-width="0.3"/>`;
  // Lower lip
  svg += `<path d="M ${cx - mouthW/2} ${mouthY} Q ${cx} ${mouthY + lipH * 1.4} ${cx + mouthW/2} ${mouthY}" fill="${lightenColor(lipColor, 0.1)}" stroke="${darkenColor(lipColor, 0.2)}" stroke-width="0.3"/>`;
  // Mouth line
  svg += `<line x1="${cx - mouthW/2 + 1}" y1="${mouthY}" x2="${cx + mouthW/2 - 1}" y2="${mouthY}" stroke="${darkenColor(lipColor, 0.3)}" stroke-width="0.6" opacity="0.5"/>`;
  
  // ── Beard ──
  if (f.hasBeard) {
    svg += renderBeard(f, cx, cy, faceW, faceH, mouthY, mouthW, chinY);
  }
  
  // ── Wrinkles ──
  if (f.wrinkleOpacity > 0.05) {
    svg += renderWrinkles(f, cx, cy, faceW, faceH, eyeY, browY, mouthY);
  }
  
  // ── Hair (front layer) ──
  svg += renderHairFront(f, cx, cy, faceW, faceH, uid);
  
  // ── Age-specific touches ──
  if (f.ageBracket === 'child') {
    // Rosy cheeks for children
    svg += `<circle cx="${cx - faceW * 0.28}" cy="${cy + faceH * 0.12}" r="8" fill="#FF8888" opacity="0.15"/>`;
    svg += `<circle cx="${cx + faceW * 0.28}" cy="${cy + faceH * 0.12}" r="8" fill="#FF8888" opacity="0.15"/>`;
  }
  
  svg += `</svg>`;
  return svg;
}

// ─── Hair Rendering ─────────────────────────────────────────────────────────

function renderHairBack(
  f: AvatarFeatures, cx: number, cy: number, faceW: number, faceH: number, uid: string
): string {
  let svg = '';
  const topY = cy - faceH / 2;
  
  // Long hair styles (3, 4, 5) need a back layer
  if (f.hairStyle >= 3) {
    const hairLength = f.hairStyle === 3 ? 40 : f.hairStyle === 4 ? 60 : 50;
    svg += `<path d="M ${cx - faceW/2 - 6} ${topY + 15} Q ${cx - faceW/2 - 10} ${topY + hairLength + 30} ${cx - faceW/3} ${topY + hairLength + 50} L ${cx + faceW/3} ${topY + hairLength + 50} Q ${cx + faceW/2 + 10} ${topY + hairLength + 30} ${cx + faceW/2 + 6} ${topY + 15}" fill="${f.hairColor.primary}" opacity="0.9"/>`;
  }
  
  return svg;
}

function renderHairFront(
  f: AvatarFeatures, cx: number, cy: number, faceW: number, faceH: number, uid: string
): string {
  let svg = '';
  const topY = cy - faceH / 2;
  const hairlineY = topY + (1 - f.hairLine) * 15;
  
  switch (f.hairStyle) {
    case 0: // Short cropped (male)
      svg += `<path d="M ${cx - faceW/2 - 3} ${topY + 8} Q ${cx - faceW/2 - 4} ${hairlineY - 12} ${cx} ${hairlineY - 16} Q ${cx + faceW/2 + 4} ${hairlineY - 12} ${cx + faceW/2 + 3} ${topY + 8}" fill="${f.hairColor.primary}"/>`;
      svg += `<path d="M ${cx - faceW/2 - 1} ${topY + 10} Q ${cx - faceW/2 - 2} ${hairlineY - 8} ${cx} ${hairlineY - 12} Q ${cx + faceW/2 + 2} ${hairlineY - 8} ${cx + faceW/2 + 1} ${topY + 10}" fill="${f.hairColor.secondary}" opacity="0.5"/>`;
      break;
      
    case 1: // Side part (male)
      svg += `<path d="M ${cx - faceW/2 - 4} ${topY + 6} Q ${cx - faceW/2 - 6} ${hairlineY - 14} ${cx - faceW/6} ${hairlineY - 20} Q ${cx + faceW/3} ${hairlineY - 18} ${cx + faceW/2 + 5} ${topY + 4}" fill="${f.hairColor.primary}"/>`;
      // Part line accent
      svg += `<line x1="${cx - faceW/6}" y1="${hairlineY - 18}" x2="${cx - faceW/6 + 3}" y2="${topY + 8}" stroke="${f.hairColor.secondary}" stroke-width="0.8" opacity="0.4"/>`;
      break;
      
    case 2: // Textured/curly short (male)
      svg += `<path d="M ${cx - faceW/2 - 5} ${topY + 5} Q ${cx - faceW/2 - 8} ${hairlineY - 18} ${cx} ${hairlineY - 22} Q ${cx + faceW/2 + 8} ${hairlineY - 18} ${cx + faceW/2 + 5} ${topY + 5}" fill="${f.hairColor.primary}"/>`;
      // Texture dots for curly effect
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI;
        const tx = cx + Math.cos(angle) * (faceW/2 - 5);
        const ty = hairlineY - 12 + Math.sin(angle) * 6;
        svg += `<circle cx="${tx}" cy="${ty}" r="3" fill="${f.hairColor.secondary}" opacity="0.4"/>`;
      }
      break;
      
    case 3: // Long straight (female)
      svg += `<path d="M ${cx - faceW/2 - 4} ${topY + 6} Q ${cx} ${hairlineY - 20} ${cx + faceW/2 + 4} ${topY + 6}" fill="${f.hairColor.primary}"/>`;
      // Side drapes
      svg += `<path d="M ${cx - faceW/2 - 6} ${topY + 10} L ${cx - faceW/2 - 8} ${topY + 50} Q ${cx - faceW/2 - 4} ${topY + 55} ${cx - faceW/2} ${topY + 15}" fill="${f.hairColor.primary}" opacity="0.85"/>`;
      svg += `<path d="M ${cx + faceW/2 + 6} ${topY + 10} L ${cx + faceW/2 + 8} ${topY + 50} Q ${cx + faceW/2 + 4} ${topY + 55} ${cx + faceW/2} ${topY + 15}" fill="${f.hairColor.primary}" opacity="0.85"/>`;
      break;
      
    case 4: // Voluminous/wavy (female)
      svg += `<path d="M ${cx - faceW/2 - 8} ${topY + 4} Q ${cx - faceW/4} ${hairlineY - 26} ${cx} ${hairlineY - 24} Q ${cx + faceW/4} ${hairlineY - 26} ${cx + faceW/2 + 8} ${topY + 4}" fill="${f.hairColor.primary}"/>`;
      // Volume on sides
      svg += `<path d="M ${cx - faceW/2 - 8} ${topY + 6} Q ${cx - faceW/2 - 14} ${topY + 35} ${cx - faceW/2 - 10} ${topY + 60} L ${cx - faceW/2 - 2} ${topY + 20}" fill="${f.hairColor.primary}" opacity="0.8"/>`;
      svg += `<path d="M ${cx + faceW/2 + 8} ${topY + 6} Q ${cx + faceW/2 + 14} ${topY + 35} ${cx + faceW/2 + 10} ${topY + 60} L ${cx + faceW/2 + 2} ${topY + 20}" fill="${f.hairColor.primary}" opacity="0.8"/>`;
      break;
      
    case 5: // Up-do / bun (female)
      svg += `<path d="M ${cx - faceW/2 - 3} ${topY + 8} Q ${cx} ${hairlineY - 18} ${cx + faceW/2 + 3} ${topY + 8}" fill="${f.hairColor.primary}"/>`;
      // Bun on top
      svg += `<circle cx="${cx}" cy="${hairlineY - 26}" r="14" fill="${f.hairColor.primary}"/>`;
      svg += `<circle cx="${cx}" cy="${hairlineY - 26}" r="10" fill="${f.hairColor.secondary}" opacity="0.3"/>`;
      break;
  }
  
  return svg;
}

// ─── Beard Rendering ────────────────────────────────────────────────────────

function renderBeard(
  f: AvatarFeatures, cx: number, cy: number, faceW: number, faceH: number, 
  mouthY: number, mouthW: number, chinY: number
): string {
  let svg = '';
  const beardColor = darkenColor(f.hairColor.primary, 0.1);
  
  switch (f.beardStyle) {
    case 0: // Full beard
      svg += `<path d="M ${cx - faceW * 0.38} ${mouthY - 5} Q ${cx - faceW * 0.35} ${chinY + 12} ${cx} ${chinY + 16} Q ${cx + faceW * 0.35} ${chinY + 12} ${cx + faceW * 0.38} ${mouthY - 5}" fill="${beardColor}" opacity="0.7"/>`;
      break;
      
    case 1: // Goatee
      svg += `<path d="M ${cx - mouthW/2 - 2} ${mouthY + 2} Q ${cx} ${chinY + 10} ${cx + mouthW/2 + 2} ${mouthY + 2}" fill="${beardColor}" opacity="0.6"/>`;
      break;
      
    case 2: // Stubble
      for (let i = 0; i < 30; i++) {
        const sx = cx + (Math.sin(i * 7.3) * faceW * 0.3);
        const sy = mouthY + 2 + (Math.cos(i * 5.1) * faceH * 0.12) + Math.abs(Math.sin(i * 3.2)) * 10;
        if (sy < chinY + 8) {
          svg += `<circle cx="${sx}" cy="${sy}" r="0.6" fill="${beardColor}" opacity="0.3"/>`;
        }
      }
      break;
  }
  
  return svg;
}

// ─── Wrinkle Rendering ──────────────────────────────────────────────────────

function renderWrinkles(
  f: AvatarFeatures, cx: number, cy: number, faceW: number, faceH: number,
  eyeY: number, browY: number, mouthY: number
): string {
  let svg = '';
  const opacity = f.wrinkleOpacity * 0.4;
  const wrinkleColor = darkenColor(f.skin.shadow, 0.15);
  
  // Forehead lines
  if (f.wrinkleOpacity > 0.2) {
    const lines = Math.min(3, Math.floor(f.wrinkleOpacity * 4));
    for (let i = 0; i < lines; i++) {
      const ly = browY - 8 - i * 5;
      const lineW = faceW * 0.4;
      svg += `<path d="M ${cx - lineW/2} ${ly} Q ${cx} ${ly - 1.5} ${cx + lineW/2} ${ly}" stroke="${wrinkleColor}" stroke-width="0.6" fill="none" opacity="${opacity}"/>`;
    }
  }
  
  // Crow's feet
  if (f.wrinkleOpacity > 0.3) {
    const cfOpacity = opacity * 0.8;
    // Left eye
    for (let i = 0; i < 2; i++) {
      const startX = cx - faceW * 0.35 - 4;
      svg += `<line x1="${startX}" y1="${eyeY - 2 + i * 3}" x2="${startX - 6}" y2="${eyeY - 4 + i * 4}" stroke="${wrinkleColor}" stroke-width="0.5" opacity="${cfOpacity}"/>`;
    }
    // Right eye
    for (let i = 0; i < 2; i++) {
      const startX = cx + faceW * 0.35 + 4;
      svg += `<line x1="${startX}" y1="${eyeY - 2 + i * 3}" x2="${startX + 6}" y2="${eyeY - 4 + i * 4}" stroke="${wrinkleColor}" stroke-width="0.5" opacity="${cfOpacity}"/>`;
    }
  }
  
  // Nasolabial folds (smile lines)
  if (f.wrinkleOpacity > 0.15) {
    const nlOpacity = opacity * 1.2;
    svg += `<path d="M ${cx - 12} ${eyeY + 12} Q ${cx - 14} ${mouthY - 2} ${cx - 10} ${mouthY + 6}" stroke="${wrinkleColor}" stroke-width="0.6" fill="none" opacity="${nlOpacity}"/>`;
    svg += `<path d="M ${cx + 12} ${eyeY + 12} Q ${cx + 14} ${mouthY - 2} ${cx + 10} ${mouthY + 6}" stroke="${wrinkleColor}" stroke-width="0.6" fill="none" opacity="${nlOpacity}"/>`;
  }
  
  return svg;
}

// ─── Utility ────────────────────────────────────────────────────────────────

/**
 * Returns a compact demographic summary string for display.
 */
export function getDemographicLabel(demographics: TalentDemographics, currentWeek: number = 1): string {
  const age = getVisualAge(demographics.age, currentWeek);
  return `${age}y • ${demographics.gender === 'MALE' ? '♂' : demographics.gender === 'FEMALE' ? '♀' : '⚧'} • ${demographics.ethnicity} • ${demographics.country}`;
}

/**
 * Returns emoji flag approximation for a country.
 */
export function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    'USA': '🇺🇸',
    'UK': '🇬🇧',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Japan': '🇯🇵',
    'Mexico': '🇲🇽',
    'South Korea': '🇰🇷',
    'France': '🇫🇷',
    'India': '🇮🇳',
  };
  return flags[country] || '🌐';
}

/**
 * Returns the visual age of a talent given the current week.
 */
export function getTalentVisualAge(talent: Talent, currentWeek: number = 1): number {
  return getVisualAge(talent.demographics.age, currentWeek);
}

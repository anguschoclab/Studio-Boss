import { Talent } from '../../types/talent.types';
import { 
  AvatarFeatures, AgeBracket
} from './types';
import { 
  hashString, seededRandom, seededRange, seededPick, 
  blendColor, darkenColor, lightenColor
} from './utils';
import { 
  SKIN_PALETTES, HAIR_COLORS, GRAY_HAIR, WHITE_HAIR, 
  EYE_COLORS, CLOTHING_PALETTES 
} from './palettes';

/**
 * Derives visual features from talent demographics and state.
 */
export function deriveFeatures(talent: Talent, currentWeek: number = 1): AvatarFeatures {
  const { demographics, psychology } = talent;
  const seed = hashString(talent.id);
  const rand = seededRandom(seed);
  
  const visualAge = demographics.age + Math.floor((currentWeek - 1) / 52);
  const ageBracket = getAgeBracket(visualAge);
  
  // ── Skin ──
  const ethnicity = demographics.ethnicity || 'Mixed';
  const skinPalettes = SKIN_PALETTES[ethnicity] || SKIN_PALETTES['Mixed'];
  const skin = seededPick(rand, skinPalettes);
  
  // ── Hair ──
  const hairPool = HAIR_COLORS[ethnicity] || HAIR_COLORS['Caucasian'];
  let hairColor = seededPick(rand, hairPool);
  
  // ── Aging effects on hair ──
  // Gradual greying curve. Each talent gets a personal "grey onset" age
  // between 38–52 (driven by their seed) so siblings/peers don't all grey
  // at the same time. Greying then progresses linearly until ~75, where
  // it caps at full white. Pre-onset hair stays the natural color.
  const greyOnset = 38 + rand() * 14;          // 38–52
  const fullWhiteAge = greyOnset + 35;          // ~73–87
  if (visualAge > greyOnset) {
    // 0 at onset, 1 at fullWhiteAge
    const greyProgress = Math.min(1, (visualAge - greyOnset) / (fullWhiteAge - greyOnset));
    if (greyProgress >= 0.95) {
      hairColor = WHITE_HAIR;
    } else {
      // Blend toward grey first (until ~0.6), then toward white past that.
      const targetIsWhite = greyProgress > 0.6;
      const target = targetIsWhite ? WHITE_HAIR : GRAY_HAIR;
      // Re-map progress so 0.6→0 and 1.0→1 when blending into white
      const blendAmount = targetIsWhite
        ? (greyProgress - 0.6) / 0.4
        : greyProgress / 0.6;
      const fromColor = targetIsWhite ? GRAY_HAIR : hairColor;
      hairColor = {
        primary: blendColor(fromColor.primary, target.primary, blendAmount),
        secondary: blendColor(fromColor.secondary, target.secondary, blendAmount),
        shine: blendColor(
          fromColor.shine || fromColor.secondary,
          target.shine || target.secondary,
          blendAmount
        ),
      };
    }
  }

  // ── Hair Style Selection ──
  // Style pools are weighted per ethnicity so that South/East Asian, Black,
  // and Caucasian/Mixed talent draw from culturally appropriate distributions
  // and don't all share the same silhouette. Including a style multiple times
  // is the lightweight way to weight it more heavily.
  // NOTE: 'bald' is intentionally excluded — it produces a featureless
  // silhouette. Recession is expressed via `hairLine` instead.
  const baseMaleStyles = ['short-crop', 'side-part', 'textured-fade', 'buzz-cut', 'slick-back', 'top-knot'];
  const baseFemaleStyles = ['long-straight', 'shoulder-bob', 'pixie', 'ponytail', 'curls-medium', 'wavy-shoulder', 'short-crop'];

  const maleStylesByEthnicity: Record<string, string[]> = {
    'South Asian': [
      'thick-wave', 'thick-wave', 'side-part', 'middle-part',
      'short-crop', 'textured-fade', 'undercut', 'pompadour', 'slick-back',
    ],
    'Asian': [
      'middle-part', 'middle-part', 'mop-top', 'spiky', 'spiky',
      'undercut', 'short-crop', 'textured-fade', 'side-part', 'top-knot',
    ],
    'Black': [
      'textured-fade', 'textured-fade', 'buzz-cut', 'short-crop',
      'top-knot', 'slick-back', 'undercut',
    ],
    'Hispanic': [
      'short-crop', 'side-part', 'textured-fade', 'slick-back',
      'pompadour', 'thick-wave', 'undercut',
    ],
    'Middle Eastern': [
      'thick-wave', 'side-part', 'short-crop', 'textured-fade',
      'slick-back', 'pompadour',
    ],
    'Caucasian': [
      ...baseMaleStyles, 'pompadour', 'middle-part', 'undercut',
    ],
    'Mixed': [
      ...baseMaleStyles, 'thick-wave', 'undercut', 'middle-part', 'pompadour',
    ],
  };

  const malePool = maleStylesByEthnicity[ethnicity] || baseMaleStyles;
  const femalePool = baseFemaleStyles;
  const hairStyle = demographics.gender === 'MALE'
    ? seededPick(rand, malePool)
    : demographics.gender === 'FEMALE'
      ? seededPick(rand, femalePool)
      : seededPick(rand, [...malePool, ...femalePool]);

  // ── Facial Hair ──
  const hasFacialHair = demographics.gender === 'MALE' && visualAge >= 18 && rand() < 0.4;
  const facialHairStyle = seededPick(rand, ['full-beard', 'goatee', 'stubble', 'mustache']);

  // ── Eyes ──
  const eyeColor = seededPick(rand, EYE_COLORS);
  const hasEpicanthicFold = ['Asian', 'South Asian'].includes(ethnicity) || (ethnicity === 'Mixed' && rand() < 0.3);

  // ── Expression based on Mood ──
  let expression: AvatarFeatures['expression'] = 'neutral';
  if (psychology.mood > 75) expression = 'smile';
  else if (psychology.mood > 60) expression = 'smirk';
  else if (psychology.mood < 30) expression = 'frown';
  else if (rand() < 0.05) expression = 'surprised';

  // ── Clothing ──
  // Wardrobe hints at personality: bias clothing type by role + motivation,
  // then tint the picked color (bold ↔ muted) so two creatives don't look
  // identical to two executives.
  const clothingType = pickClothingTypeForTalent(talent, rand);
  const baseColor = seededPick(rand, CLOTHING_PALETTES[clothingType]);
  const clothingColor = tintClothingForPersonality(baseColor, talent, rand);
  const necklineStyle = pickNecklineForTalent(talent, clothingType, rand);

  return {
    seed,
    id: talent.id,
    age: visualAge,
    ageBracket,
    gender: demographics.gender,
    faceShape: seededPick(rand, ['oval', 'square', 'heart', 'round', 'oblong']),
    faceWidth: seededRange(rand, 0.9, 1.1),
    faceHeight: seededRange(rand, 0.9, 1.1),
    jawWidth: seededRange(rand, 0.8, 1.2),
    chinPointiness: rand(),
    cheekBones: rand(),
    skin,
    hasFreckles: rand() < 0.15,
    freckleSeeds: Array.from({ length: 12 }).map(() => rand()),
    eyeSize: seededRange(rand, 0.4, 0.8),
    eyeSpacing: seededRange(rand, 0.2, 0.6),
    eyeSlant: seededRange(rand, -0.5, 0.5),
    eyeColor,
    hasEpicanthicFold,
    browThickness: rand(),
    browArch: rand(),
    isBlinking: false, // controlled by CSS/animation
    noseWidth: rand(),
    noseLength: rand(),
    noseBridge: rand(),
    noseTipShape: seededPick(rand, ['round', 'pointed', 'flat']),
    mouthWidth: rand(),
    lipFullness: rand(),
    expression,
    hairStyle,
    hairColor,
    hairLine: demographics.gender === 'MALE' ? Math.max(0, (visualAge - 30) * 0.015 * rand()) : 0,
    hasFacialHair,
    facialHairStyle,
    facialHairColor: hairColor,
    clothingType,
    clothingColor,
    necklineStyle,
    hasGlasses: rand() < 0.25,
    glassesStyle: seededPick(rand, ['round', 'square', 'rimless']),
    hasEarrings: demographics.gender === 'FEMALE' && rand() < 0.6,
    lightingProfile: seededPick(rand, ['studio', 'dramatic', 'natural']),
    wrinkleOpacity: visualAge > 35 ? Math.min(1, (visualAge - 35) / 50) : 0,
    jowlAmount: visualAge > 55 ? Math.min(1, (visualAge - 55) / 30) : 0,
  };
}

function getAgeBracket(age: number): AgeBracket {
  if (age <= 12) return 'child';
  if (age <= 17) return 'teen';
  if (age <= 35) return 'youngAdult';
  if (age <= 55) return 'adult';
  if (age <= 70) return 'mature';
  return 'senior';
}

/**
 * Picks a clothing archetype that matches the talent's role + drive.
 * Returns a weighted pick so identity still varies but trends correctly:
 *   • producers / showrunners → mostly formal, some creative
 *   • directors / writers     → mostly creative, some casual
 *   • actors                  → mix; high prestige skews high_fashion
 * The talent's motivation profile (legacy=artistry, financial=business)
 * nudges the weights further.
 */
function pickClothingTypeForTalent(
  talent: Talent,
  rand: () => number
): AvatarFeatures['clothingType'] {
  const role = (talent.role || '').toLowerCase();
  const m = talent.motivationProfile;
  // Default weights
  const w: Record<AvatarFeatures['clothingType'], number> = {
    casual: 1, formal: 1, creative: 1, high_fashion: 1,
  };

  if (role.includes('producer') || role.includes('showrunner')) {
    w.formal += 3; w.high_fashion += 1; w.creative += 0.5; w.casual -= 0.5;
  } else if (role.includes('director')) {
    w.creative += 2.5; w.casual += 1.5; w.formal -= 0.3;
  } else if (role.includes('writer')) {
    w.casual += 2; w.creative += 2; w.formal -= 0.5;
  } else if (role.includes('actor')) {
    w.high_fashion += 1.5; w.creative += 1; w.casual += 0.8;
  }

  // Motivation nudges
  if (m) {
    if (m.legacy >= 70) w.creative += 1;        // artistry → expressive
    if (m.financial >= 70) w.formal += 1;        // money → business attire
    if (m.prestige >= 70) w.high_fashion += 1.2; // awards → red carpet
    if (m.aggression >= 70) w.formal += 0.5;
  }
  if (talent.tier === 'A_LIST') w.high_fashion += 1;
  if (talent.tier === 'NEWCOMER') { w.casual += 1; w.high_fashion -= 0.5; }

  // Weighted pick
  const types: AvatarFeatures['clothingType'][] = ['casual', 'formal', 'creative', 'high_fashion'];
  const weights = types.map(t => Math.max(0.1, w[t]));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rand() * total;
  for (let i = 0; i < types.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return types[i];
  }
  return 'casual';
}

/**
 * Tints a base clothing color so two characters in the same archetype
 * still read as different personalities:
 *   • bold (creative / high legacy / high mood) → saturate + slight lift
 *   • muted (executive / financial / formal)    → desaturate + darken
 * Effect is intentionally subtle (≤ ~25% shift) so palette identity holds.
 */
function tintClothingForPersonality(
  baseColor: string,
  talent: Talent,
  rand: () => number
): string {
  const m = talent.motivationProfile;
  const role = (talent.role || '').toLowerCase();
  let boldness = 0; // -1 (muted) ↔ +1 (bold)

  if (role.includes('producer') || role.includes('showrunner')) boldness -= 0.4;
  if (role.includes('director') || role.includes('writer')) boldness += 0.3;
  if (role.includes('actor')) boldness += 0.15;

  if (m) {
    boldness += (m.legacy - 50) / 120;     // artistry → bolder
    boldness -= (m.financial - 50) / 140;  // money-driven → more muted
    boldness += (m.prestige - 50) / 200;
  }
  // Mood gives a small lift/dampen
  if (talent.psychology) {
    boldness += (talent.psychology.mood - 50) / 250;
  }
  // Personal jitter so siblings/peers still differ slightly
  boldness += (rand() - 0.5) * 0.15;

  // Clamp
  boldness = Math.max(-0.6, Math.min(0.6, boldness));

  if (boldness > 0.05) {
    // Bold → lift toward white *slightly* then re-saturate via shadow blend
    // Simpler: lighten a touch (more vivid on dark bases, more pastel on bright)
    return lightenColor(baseColor, boldness * 0.18);
  }
  if (boldness < -0.05) {
    // Muted → darken + blend toward neutral grey
    const darkened = darkenColor(baseColor, Math.abs(boldness) * 0.22);
    return blendColor(darkened, '#5C5C5C', Math.abs(boldness) * 0.25);
  }
  return baseColor;
}

/**
 * Picks a neckline that matches the chosen clothing archetype.
 * Keeps producers in collars/v-necks, writers in hoodies/round, etc.
 */
function pickNecklineForTalent(
  talent: Talent,
  clothingType: AvatarFeatures['clothingType'],
  rand: () => number
): AvatarFeatures['necklineStyle'] {
  const pools: Record<AvatarFeatures['clothingType'], AvatarFeatures['necklineStyle'][]> = {
    formal: ['collar', 'collar', 'v-neck'],
    high_fashion: ['v-neck', 'collar', 'round'],
    creative: ['round', 'v-neck', 'hoodie'],
    casual: ['round', 'round', 'hoodie', 'v-neck'],
  };
  return seededPick(rand, pools[clothingType]);
}

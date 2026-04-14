import { Talent } from '../../types/talent.types';
import {
  AvatarFeatures, AgeBracket
} from './types';
import {
  hashString, seededRandom, seededRange, seededPick,
  blendColor
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
  
  // Aging effects on hair
  if (visualAge > 35) {
    const grayFactor = Math.min(1, (visualAge - 35) / 45) * (0.5 + rand() * 0.5);
    if (grayFactor > 0.8) hairColor = WHITE_HAIR;
    else if (grayFactor > 0.4) hairColor = GRAY_HAIR;
    else if (grayFactor > 0.1) {
      hairColor = {
        primary: blendColor(hairColor.primary, GRAY_HAIR.primary, grayFactor),
        secondary: blendColor(hairColor.secondary, GRAY_HAIR.secondary, grayFactor),
        shine: blendColor(hairColor.shine || hairColor.secondary, GRAY_HAIR.shine || GRAY_HAIR.secondary, grayFactor),
      };
    }
  }

  // Hair Style Selection
  const maleStyles = ['short-crop', 'side-part', 'textured-fade', 'buzz-cut', 'slick-back', 'top-knot', 'bald'];
  const femaleStyles = ['long-straight', 'shoulder-bob', 'pixie', 'ponytail', 'curls-medium', 'wavy-shoulder', 'short-crop'];
  const hairStyle = demographics.gender === 'MALE' 
    ? seededPick(rand, maleStyles) 
    : demographics.gender === 'FEMALE' 
      ? seededPick(rand, femaleStyles) 
      : seededPick(rand, [...maleStyles, ...femaleStyles]);

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
  const clothingType = seededPick(rand, ['casual', 'formal', 'creative', 'high_fashion']) as AvatarFeatures['clothingType'];
  const clothingColor = seededPick(rand, CLOTHING_PALETTES[clothingType]);
  const necklineStyle = seededPick(rand, ['round', 'v-neck', 'collar', 'hoodie']) as AvatarFeatures['necklineStyle'];

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

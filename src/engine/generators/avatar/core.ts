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
 * Optional parentTalent parameter for family resemblance.
 */
export function deriveFeatures(talent: Talent, currentWeek: number = 1, parentTalent?: Talent): AvatarFeatures {
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

  // Hair Style Selection (expanded with ethnic diversity)
  const maleStyles = ['short-crop', 'side-part', 'textured-fade', 'buzz-cut', 'slick-back', 'top-knot', 'bald', 'cornrows', 'dreadlocks', 'mohawk', 'undercut', 'afro-short'];
  const femaleStyles = ['long-straight', 'shoulder-bob', 'pixie', 'ponytail', 'curls-medium', 'wavy-shoulder', 'short-crop', 'box-braids', 'cornrows', 'dreadlocks', 'bun', 'double-bun', 'long-curly', 'bangs'];
  const hairStyle = demographics.gender === 'MALE'
    ? seededPick(rand, maleStyles)
    : demographics.gender === 'FEMALE'
      ? seededPick(rand, femaleStyles)
      : seededPick(rand, [...maleStyles, ...femaleStyles]);

  // ── Facial Hair ──
  const hasFacialHair = demographics.gender === 'MALE' && visualAge >= 18 && rand() < 0.4;
  const facialHairStyle = seededPick(rand, ['full-beard', 'goatee', 'stubble', 'mustache', 'soul-patch', 'mutton-chops', 'van-dyke', 'sideburns', 'chin-strap', 'circle-beard']);

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

  // ── Family Resemblance (if parent provided) ──
  const inheritedFeatures: AvatarFeatures['inheritedFeatures'] = {};
  let parentFeatures: AvatarFeatures | null = null;
  
  if (parentTalent) {
    parentFeatures = deriveFeatures(parentTalent, currentWeek);
    const inheritanceChance = 0.5; // 50% chance to inherit each feature
    
    if (rand() < inheritanceChance) {
      inheritedFeatures.faceShape = true;
    }
    if (rand() < inheritanceChance) {
      inheritedFeatures.eyeColor = true;
    }
    if (rand() < inheritanceChance) {
      inheritedFeatures.noseShape = true;
    }
    if (rand() < inheritanceChance) {
      inheritedFeatures.hairColor = true;
    }
    if (rand() < inheritanceChance) {
      inheritedFeatures.skinTone = true;
    }
  }

  // ── Ethnicity-Specific Feature Tendencies ──
  const ethnicityFaceShapes: Record<string, string[]> = {
    'Asian': ['round', 'oval', 'square', 'oblong'],
    'South Asian': ['oval', 'round', 'heart', 'square'],
    'Caucasian': ['oval', 'heart', 'square', 'oblong'],
    'Black': ['oval', 'round', 'square', 'heart'],
    'Hispanic': ['oval', 'round', 'heart', 'square'],
    'Middle Eastern': ['oval', 'square', 'oblong', 'heart'],
    'Mixed': ['oval', 'square', 'heart', 'round', 'oblong']
  };
  
  const ethnicityNoseBridges: Record<string, string[]> = {
    'Middle Eastern': ['roman', 'straight', 'humped'],
    'Caucasian': ['straight', 'roman', 'button'],
    'Asian': ['straight', 'button', 'concave'],
    'South Asian': ['straight', 'roman', 'button'],
    'Black': ['straight', 'button', 'concave'],
    'Hispanic': ['straight', 'roman', 'button'],
    'Mixed': ['straight', 'roman', 'button', 'concave']
  };

  const ethnicityEyeShapes: Record<string, string[]> = {
    'Asian': ['almond', 'monolid', 'upturned'],
    'South Asian': ['almond', 'round', 'hooded'],
    'Caucasian': ['almond', 'round', 'hooded', 'upturned'],
    'Black': ['almond', 'round', 'deep-set'],
    'Hispanic': ['almond', 'round', 'hooded'],
    'Middle Eastern': ['almond', 'round', 'hooded'],
    'Mixed': ['almond', 'round', 'hooded', 'upturned', 'deep-set']
  };

  // Select face shape with ethnicity bias
  const ethnicityShapeOptions = ethnicityFaceShapes[ethnicity] || ethnicityFaceShapes['Mixed'];
  const allFaceShapes = ['oval', 'square', 'heart', 'round', 'oblong', 'diamond', 'pear', 'inverted-triangle', 'rectangular'];
  const faceShape = inheritedFeatures.faceShape && parentFeatures
    ? parentFeatures.faceShape
    : (rand() < 0.7 ? seededPick(rand, ethnicityShapeOptions) : seededPick(rand, allFaceShapes)) as AvatarFeatures['faceShape'];

  // Select eye shape with ethnicity bias
  const ethnicityEyeOptions = ethnicityEyeShapes[ethnicity] || ethnicityEyeShapes['Mixed'];
  const allEyeShapes = ['almond', 'round', 'hooded', 'monolid', 'deep-set', 'upturned'];
  const eyeShape = inheritedFeatures.faceShape && parentFeatures
    ? (parentFeatures.eyeShape || seededPick(rand, ethnicityEyeOptions))
    : (rand() < 0.6 ? seededPick(rand, ethnicityEyeOptions) : seededPick(rand, allEyeShapes)) as AvatarFeatures['eyeShape'];

  // Select nose bridge with ethnicity bias
  const ethnicityNoseOptions = ethnicityNoseBridges[ethnicity] || ethnicityNoseBridges['Mixed'];
  const allNoseBridges = ['straight', 'roman', 'button', 'concave', 'humped'];
  const noseBridgeShape = inheritedFeatures.noseShape && parentFeatures
    ? (parentFeatures.noseBridgeShape || seededPick(rand, ethnicityNoseOptions))
    : (rand() < 0.5 ? seededPick(rand, ethnicityNoseOptions) : seededPick(rand, allNoseBridges)) as AvatarFeatures['noseBridgeShape'];

  // Select eye color (inherit if applicable)
  const finalEyeColor = inheritedFeatures.eyeColor && parentFeatures
    ? parentFeatures.eyeColor
    : eyeColor;

  // Select nose tip shape
  const allNoseTips = ['round', 'pointed', 'flat', 'bulbous', 'upturned', 'hooked'];
  const noseTipShape = seededPick(rand, allNoseTips) as AvatarFeatures['noseTipShape'];

  // Select lip shape
  const allLipShapes = ['cupid-bow', 'heart-shaped', 'thin', 'full', 'uneven'];
  const lipShape = seededPick(rand, allLipShapes) as AvatarFeatures['lipShape'];

  // Select hair color (inherit if applicable)
  const finalHairColor = inheritedFeatures.hairColor && parentFeatures
    ? parentFeatures.hairColor
    : hairColor;

  // Select skin tone (inherit if applicable)
  const finalSkin = inheritedFeatures.skinTone && parentFeatures
    ? parentFeatures.skin
    : skin;

  // ── Asymmetry ──
  const eyeSizeAsymmetry = seededRange(rand, -0.05, 0.05);
  const browHeightAsymmetry = seededRange(rand, -0.05, 0.05);
  const smileAsymmetry = seededRange(rand, -0.03, 0.03);

  // ── Skin Details ──
  const hasBeautyMark = rand() < 0.1;
  const beautyMarkPosition = hasBeautyMark
    ? { x: seededRange(rand, 0.3, 0.7), y: seededRange(rand, 0.4, 0.8) }
    : { x: 0, y: 0 };
  const hasAgeSpots = visualAge > 50 && rand() < 0.4;
  const hasRosyCheeks = rand() < 0.2;
  const skinTextureOptions: AvatarFeatures['skinTexture'][] = ['smooth', 'pores', 'rough'];
  const skinTexture: AvatarFeatures['skinTexture'] = visualAge > 40
    ? (rand() < 0.5 ? 'pores' : seededPick(rand, skinTextureOptions))
    : seededPick(rand, skinTextureOptions);

  // ── New Accessories ──
  const hasHat = rand() < 0.05;
  const hatStyle = hasHat ? seededPick(rand, ['cap', 'beanie', 'fedora']) as AvatarFeatures['hatStyle'] : 'none';

  const hasPiercing = rand() < 0.08;
  const piercingStyle = hasPiercing ? seededPick(rand, ['nose-ring', 'lip-ring', 'eyebrow']) as AvatarFeatures['piercingStyle'] : 'none';
  
  const hasScars = rand() < 0.03;
  const scarPositions = hasScars 
    ? [`${seededRange(rand, 0.2, 0.8).toFixed(2)},${seededRange(rand, 0.3, 0.7).toFixed(2)}`]
    : [];
  
  const hasMole = rand() < 0.12;
  const molePosition = hasMole 
    ? { x: seededRange(rand, 0.3, 0.7), y: seededRange(rand, 0.4, 0.8) }
    : { x: 0, y: 0 };

  return {
    seed,
    id: talent.id,
    age: visualAge,
    ageBracket,
    gender: demographics.gender,
    faceShape,
    faceWidth: seededRange(rand, 0.9, 1.1),
    faceHeight: seededRange(rand, 0.9, 1.1),
    jawWidth: seededRange(rand, 0.8, 1.2),
    chinPointiness: rand(),
    cheekBones: rand(),
    skin: finalSkin,
    hasFreckles: rand() < 0.15,
    freckleSeeds: Array.from({ length: 12 }).map(() => rand()),
    eyeSize: seededRange(rand, 0.4, 0.8),
    eyeSpacing: seededRange(rand, 0.2, 0.6),
    eyeSlant: seededRange(rand, -0.5, 0.5),
    eyeColor: finalEyeColor,
    hasEpicanthicFold,
    browThickness: rand(),
    browArch: rand(),
    isBlinking: false,
    eyeShape,
    noseWidth: rand(),
    noseLength: rand(),
    noseBridge: rand(),
    noseTipShape,
    noseBridgeShape,
    mouthWidth: rand(),
    lipFullness: rand(),
    expression,
    lipShape,
    hairStyle,
    hairColor: finalHairColor,
    hairLine: demographics.gender === 'MALE' ? Math.max(0, (visualAge - 30) * 0.015 * rand()) : 0,
    hasFacialHair,
    facialHairStyle,
    facialHairColor: finalHairColor,
    clothingType,
    clothingColor,
    necklineStyle,
    hasGlasses: rand() < 0.25,
    glassesStyle: seededPick(rand, ['round', 'square', 'rimless']),
    hasEarrings: demographics.gender === 'FEMALE' && rand() < 0.6,
    hasHat,
    hatStyle,
    hasPiercing,
    piercingStyle,
    hasScars,
    scarPositions,
    hasMole,
    molePosition,
    inheritedFeatures,
    eyeSizeAsymmetry,
    browHeightAsymmetry,
    smileAsymmetry,
    hasBeautyMark,
    beautyMarkPosition,
    hasAgeSpots,
    hasRosyCheeks,
    skinTexture,
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

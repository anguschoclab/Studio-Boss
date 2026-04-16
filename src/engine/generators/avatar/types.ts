/**
 * Core types for the Modular Procedural Avatar System.
 */

export type AgeBracket = 'child' | 'teen' | 'youngAdult' | 'adult' | 'mature' | 'senior';
export type Gender = 'MALE' | 'FEMALE' | 'NON_BINARY';

export interface ColorPalette {
  base: string;
  shadow: string;
  highlight: string;
  accent?: string;
}

export interface HairColor {
  primary: string;
  secondary: string;
  shine?: string;
}

export interface AvatarFeatures {
  // Metadata
  seed: number;
  id: string;
  age: number;
  ageBracket: AgeBracket;
  gender: Gender;
  
  // Face Geometry
  faceShape: 'oval' | 'square' | 'heart' | 'round' | 'oblong' | 'diamond' | 'pear' | 'inverted-triangle' | 'rectangular';
  faceWidth: number;      // 0.8 - 1.2
  faceHeight: number;     // 0.8 - 1.2
  jawWidth: number;       // 0.7 - 1.3
  chinPointiness: number; // 0 - 1
  cheekBones: number;     // 0 - 1
  
  // Skin
  skin: ColorPalette;
  hasFreckles: boolean;
  freckleSeeds: number[];
  
  // Eyes
  eyeSize: number;
  eyeSpacing: number;   // distance from center
  eyeSlant: number;     // angle
  eyeColor: string;
  hasEpicanthicFold: boolean;
  browThickness: number;
  browArch: number;
  isBlinking: boolean;   // for animation
  eyeShape: 'almond' | 'round' | 'hooded' | 'monolid' | 'deep-set' | 'upturned';
  
  // Nose
  noseWidth: number;
  noseLength: number;
  noseBridge: number;
  noseTipShape: 'round' | 'pointed' | 'flat' | 'bulbous' | 'upturned' | 'hooked';
  noseBridgeShape: 'straight' | 'roman' | 'button' | 'concave' | 'humped';
  
  // Mouth
  mouthWidth: number;
  lipFullness: number;
  expression: 'neutral' | 'smile' | 'smirk' | 'frown' | 'surprised';
  lipShape: 'cupid-bow' | 'heart-shaped' | 'thin' | 'full' | 'uneven';
  
  // Hair
  hairStyle: string;     // ID of the hairstyle
  hairColor: HairColor;
  hairLine: number;      // 0-1 (higher = receding)
  
  // Facial Hair
  hasFacialHair: boolean;
  facialHairStyle: string;
  facialHairColor: HairColor;
  
  // Clothing
  clothingType: 'casual' | 'formal' | 'creative' | 'high_fashion';
  clothingColor: string;
  necklineStyle: 'round' | 'v-neck' | 'collar' | 'hoodie';
  
  // Accessories
  hasGlasses: boolean;
  glassesStyle: 'round' | 'square' | 'rimless';
  hasEarrings: boolean;
  hasHat: boolean;
  hatStyle: 'cap' | 'beanie' | 'fedora' | 'none';
  hasPiercing: boolean;
  piercingStyle: 'nose-ring' | 'lip-ring' | 'eyebrow' | 'none';
  hasScars: boolean;
  scarPositions: string[];
  hasMole: boolean;
  molePosition: { x: number; y: number };
  
  // Family Resemblance
  inheritedFeatures: {
    faceShape?: boolean;
    eyeColor?: boolean;
    noseShape?: boolean;
    hairColor?: boolean;
    skinTone?: boolean;
  };
  
  // Asymmetry
  eyeSizeAsymmetry: number;  // -0.1 to 0.1
  browHeightAsymmetry: number; // -0.1 to 0.1
  smileAsymmetry: number; // -0.1 to 0.1
  
  // Skin Details
  hasBeautyMark: boolean;
  beautyMarkPosition: { x: number; y: number };
  hasAgeSpots: boolean;
  hasRosyCheeks: boolean;
  skinTexture: 'smooth' | 'pores' | 'rough';
  
  // Shading & Effects
  lightingProfile: 'studio' | 'dramatic' | 'natural';
  wrinkleOpacity: number;
  jowlAmount: number;
}

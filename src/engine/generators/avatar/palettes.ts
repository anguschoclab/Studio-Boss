import { ColorPalette, HairColor } from './types';

/**
 * Skin Tone Palettes representing a wide range of human diversity.
 */
export const SKIN_PALETTES: Record<string, ColorPalette[]> = {
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

/**
 * Hair Color Palettes grouped by ethnicity.
 */
export const HAIR_COLORS: Record<string, HairColor[]> = {
  'Caucasian': [
    { primary: '#3B2314', secondary: '#5A3828', shine: '#6D4A3A' }, // Dark brown
    { primary: '#8B6914', secondary: '#A88430', shine: '#BFA050' }, // Dirty blonde
    { primary: '#D4A03A', secondary: '#E8C060', shine: '#F0D080' }, // Blonde
    { primary: '#C03020', secondary: '#E04838', shine: '#F06858' }, // Red
    { primary: '#1A1A1A', secondary: '#333333', shine: '#4D4D4D' }, // Black
  ],
  'Black': [
    { primary: '#0A0A0A', secondary: '#222222', shine: '#333333' },
    { primary: '#1A1008', secondary: '#2A2018', shine: '#3A3028' },
    { primary: '#2A1A0E', secondary: '#3A2A1E', shine: '#4A3A2E' },
  ],
  'Hispanic': [
    { primary: '#1A0E08', secondary: '#2A1E18', shine: '#3A2E28' },
    { primary: '#2A1810', secondary: '#3A2820', shine: '#4A3830' },
    { primary: '#0A0A0A', secondary: '#222222', shine: '#333333' },
  ],
  'Asian': [
    { primary: '#0A0A0A', secondary: '#1A1A1A', shine: '#222222' },
    { primary: '#1A1008', secondary: '#2A2018', shine: '#3A3028' },
    { primary: '#2A1A10', secondary: '#3A2A20', shine: '#4A3A30' },
  ],
  'South Asian/Middle Eastern': [
    { primary: '#0A0A0A', secondary: '#1A1A1A', shine: '#222222' },
    { primary: '#1A0E08', secondary: '#2A1E18', shine: '#3A2E28' },
  ],
};

export const GRAY_HAIR: HairColor = { primary: '#A0A0A0', secondary: '#C1C1C1', shine: '#D8D8D8' };
export const WHITE_HAIR: HairColor = { primary: '#D0D0D0', secondary: '#E8E8E8', shine: '#F5F5F5' };

/**
 * Eye Color Palettes.
 */
export const EYE_COLORS = [
  '#3B2F2B', // Dark brown
  '#634E34', // Brown
  '#5B7553', // Green
  '#4682B4', // Blue
  '#7DA7CC', // Light blue
  '#6B4423', // Amber
  '#2F4F4F', // Dark gray-green
];

/**
 * Clothing Color Palettes based on industry archetypes.
 */
export const CLOTHING_PALETTES = {
  casual: ['#4A90E2', '#50E3C2', '#D0021B', '#F5A623', '#7ED321'],
  formal: ['#1A1A1B', '#2C3E50', '#FFFFFF', '#BDC3C7', '#34495E'],
  creative: ['#6236FF', '#833AB4', '#FF0080', '#00DFD8', '#FF4E50'],
  high_fashion: ['#F76B1C', '#101010', '#D4AF37', '#722F37', '#E5E4E2'],
};

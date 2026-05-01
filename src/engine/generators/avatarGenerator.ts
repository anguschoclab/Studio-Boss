/**
 * Procedural Avatar Generator (Refactored)
 * 
 * Generates deterministic SVG human face avatars from talent demographics.
 * This is now a facade for the modular avatar engine.
 */

import { Talent, TalentDemographics } from '../types/talent.types';
import { deriveFeatures } from './avatar/core';
import { renderAvatarSVG } from './avatar/renderer';

/**
 * The primary entry point for generating an avatar SVG string.
 */
export function generateAvatarSVG(talent: Talent, currentWeek: number = 1): string {
  // Use our new modular derivation and rendering logic
  const features = deriveFeatures(talent, currentWeek);
  return renderAvatarSVG(features);
}

/**
 * Returns the visual age of a talent given the current week.
 * Re-exported for backward compatibility.
 */
export function getTalentVisualAge(talent: Talent, currentWeek: number = 1): number {
  return demographicsAge(talent.demographics.age, currentWeek);
}

function demographicsAge(baseAge: number, currentWeek: number): number {
  return baseAge + Math.floor((currentWeek - 1) / 52);
}

/**
 * Returns a compact demographic summary string for display.
 * Re-exported for backward compatibility.
 */
export function getDemographicLabel(demographics: TalentDemographics, currentWeek: number = 1): string {
  const age = demographicsAge(demographics.age, currentWeek);
  const genderIcon = demographics.gender === 'MALE' ? '♂' : demographics.gender === 'FEMALE' ? '♀' : '⚧';
  return `${age}y • ${genderIcon} • ${demographics.ethnicity} • ${demographics.country}`;
}

/**
 * Returns emoji flag approximation for a country.
 * Re-exported for backward compatibility.
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
    'China': '🇨🇳',
    'Italy': '🇮🇹',
    'Germany': '🇩🇪',
    'Brazil': '🇧🇷',
    'Spain': '🇪🇸'
  };
  return flags[country] || '🌐';
}

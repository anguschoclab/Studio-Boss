import { AvatarFeatures } from '../types';

/**
 * Renders facial hair (beards, stubble).
 */
export function renderFacialHair(f: AvatarFeatures, cx: number, cy: number, faceW: number, faceH: number): string {
  if (!f.hasFacialHair) return '';

  const mouthY = cy + faceH * 0.28;
  const chinY = cy + faceH * 0.48;
  const color = f.facialHairColor.primary;
  let svg = '';

  switch (f.facialHairStyle) {
    case 'full-beard':
      svg += `<path d="M ${cx - faceW * 0.38} ${mouthY - 5} Q ${cx - faceW * 0.35} ${chinY + 12} ${cx} ${chinY + 16} Q ${cx + faceW * 0.35} ${chinY + 12} ${cx + faceW * 0.38} ${mouthY - 5}" fill="${color}" opacity="0.8"/>`;
      break;
    case 'goatee':
      svg += `<path d="M ${cx - 15} ${mouthY} Q ${cx} ${chinY + 8} ${cx + 15} ${mouthY} Q ${cx} ${mouthY + 5} ${cx - 15} ${mouthY}" fill="${color}" opacity="0.7"/>`;
      break;
    case 'stubble':
      for (let i = 0; i < 40; i++) {
        const sx = cx + (Math.sin(i * 7.3) * faceW * 0.35);
        const sy = mouthY + 2 + (Math.cos(i * 5.1) * faceH * 0.12) + Math.abs(Math.sin(i * 3.2)) * 10;
        if (sy < chinY + 10) {
          svg += `<circle cx="${sx}" cy="${sy}" r="0.6" fill="${color}" opacity="0.4"/>`;
        }
      }
      break;
    case 'mustache':
      svg += `<path d="M ${cx - 12} ${mouthY - 2} Q ${cx} ${mouthY - 5} ${cx + 12} ${mouthY - 2} Q ${cx} ${mouthY + 2} ${cx - 12} ${mouthY - 2}" fill="${color}" opacity="0.7"/>`;
      break;
  }

  return svg;
}

/**
 * Renders accessories (glasses, earrings).
 */
export function renderAccessories(f: AvatarFeatures, cx: number, cy: number, faceW: number, faceH: number): string {
  let svg = '';

  if (f.hasGlasses) {
    const eyeY = cy - faceH * 0.08;
    const eyeSpacing = 12 + f.eyeSpacing * 10;
    const eyeW = 8 + f.eyeSize * 7;
    const glassSize = eyeW * 1.6;
    const frameColor = '#222222';

    if (f.glassesStyle === 'round') {
      svg += `
        <circle cx="${cx - eyeSpacing}" cy="${eyeY}" r="${glassSize}" stroke="${frameColor}" stroke-width="1.5" fill="none"/>
        <circle cx="${cx + eyeSpacing}" cy="${eyeY}" r="${glassSize}" stroke="${frameColor}" stroke-width="1.5" fill="none"/>
        <path d="M ${cx - eyeSpacing + glassSize} ${eyeY} Q ${cx} ${eyeY - 2} ${cx + eyeSpacing - glassSize} ${eyeY}" stroke="${frameColor}" stroke-width="1.2" fill="none"/>
      `.trim();
    } else {
      svg += `
        <rect x="${cx - eyeSpacing - glassSize}" y="${eyeY - glassSize/2}" width="${glassSize*2}" height="${glassSize}" rx="2" stroke="${frameColor}" stroke-width="1.5" fill="none"/>
        <rect x="${cx + eyeSpacing - glassSize}" y="${eyeY - glassSize/2}" width="${glassSize*2}" height="${glassSize}" rx="2" stroke="${frameColor}" stroke-width="1.5" fill="none"/>
        <path d="M ${cx - eyeSpacing + glassSize} ${eyeY} Q ${cx} ${eyeY - 2} ${cx + eyeSpacing - glassSize} ${eyeY}" stroke="${frameColor}" stroke-width="1.2" fill="none"/>
      `.trim();
    }
  }

  if (f.hasEarrings) {
    const earY = cy - 2;
    svg += `
      <circle cx="${cx - faceW/2 - 4}" cy="${earY + 12}" r="1.5" fill="#FFD700" stroke="#B8860B" stroke-width="0.5"/>
      <circle cx="${cx + faceW/2 + 4}" cy="${earY + 12}" r="1.5" fill="#FFD700" stroke="#B8860B" stroke-width="0.5"/>
    `.trim();
  }

  return svg;
}

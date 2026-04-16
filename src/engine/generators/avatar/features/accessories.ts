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
    case 'soul-patch':
      svg += `<path d="M ${cx - 6} ${mouthY + 4} Q ${cx} ${chinY + 6} ${cx + 6} ${mouthY + 4} Q ${cx} ${mouthY + 6} ${cx - 6} ${mouthY + 4}" fill="${color}" opacity="0.7"/>`;
      break;
    case 'mutton-chops':
      svg += `<path d="M ${cx - faceW * 0.35} ${mouthY - 8} Q ${cx - faceW * 0.4} ${chinY + 8} ${cx - faceW * 0.25} ${chinY + 10} L ${cx - faceW * 0.25} ${mouthY - 5}" fill="${color}" opacity="0.75"/>`;
      svg += `<path d="M ${cx + faceW * 0.35} ${mouthY - 8} Q ${cx + faceW * 0.4} ${chinY + 8} ${cx + faceW * 0.25} ${chinY + 10} L ${cx + faceW * 0.25} ${mouthY - 5}" fill="${color}" opacity="0.75"/>`;
      break;
    case 'van-dyke':
      svg += `<path d="M ${cx - 12} ${mouthY - 2} Q ${cx} ${mouthY - 5} ${cx + 12} ${mouthY - 2} Q ${cx} ${mouthY + 2} ${cx - 12} ${mouthY - 2}" fill="${color}" opacity="0.7"/>`;
      svg += `<path d="M ${cx - 10} ${mouthY + 2} Q ${cx} ${chinY + 8} ${cx + 10} ${mouthY + 2}" fill="${color}" opacity="0.7"/>`;
      break;
    case 'sideburns':
      svg += `<path d="M ${cx - faceW * 0.35} ${mouthY - 10} L ${cx - faceW * 0.32} ${chinY + 5} L ${cx - faceW * 0.25} ${chinY + 5} L ${cx - faceW * 0.25} ${mouthY - 10}" fill="${color}" opacity="0.7"/>`;
      svg += `<path d="M ${cx + faceW * 0.35} ${mouthY - 10} L ${cx + faceW * 0.32} ${chinY + 5} L ${cx + faceW * 0.25} ${chinY + 5} L ${cx + faceW * 0.25} ${mouthY - 10}" fill="${color}" opacity="0.7"/>`;
      break;
    case 'chin-strap':
      svg += `<path d="M ${cx - faceW * 0.35} ${mouthY - 8} Q ${cx - faceW * 0.32} ${chinY + 12} ${cx - faceW * 0.28} ${chinY + 12}" fill="${color}" opacity="0.7"/>`;
      svg += `<path d="M ${cx + faceW * 0.35} ${mouthY - 8} Q ${cx + faceW * 0.32} ${chinY + 12} ${cx + faceW * 0.28} ${chinY + 12}" fill="${color}" opacity="0.7"/>`;
      svg += `<path d="M ${cx - faceW * 0.28} ${chinY + 12} Q ${cx} ${chinY + 14} ${cx + faceW * 0.28} ${chinY + 12}" fill="${color}" opacity="0.7"/>`;
      break;
    case 'circle-beard':
      svg += `<path d="M ${cx - 18} ${mouthY - 4} Q ${cx} ${chinY + 10} ${cx + 18} ${mouthY - 4}" fill="${color}" opacity="0.75"/>`;
      svg += `<path d="M ${cx - 12} ${mouthY - 2} Q ${cx} ${mouthY - 5} ${cx + 12} ${mouthY - 2} Q ${cx} ${mouthY + 2} ${cx - 12} ${mouthY - 2}" fill="${color}" opacity="0.7"/>`;
      break;
  }

  return svg;
}

/**
 * Renders accessories (glasses, earrings, hats, piercings, scars, moles).
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

  // Hats
  if (f.hasHat && f.hatStyle !== 'none') {
    const topY = cy - faceH / 2;
    switch (f.hatStyle) {
      case 'cap':
        svg += `
          <path d="M ${cx - faceW/2 - 8} ${topY - 5} Q ${cx} ${topY - 15} ${cx + faceW/2 + 8} ${topY - 5}" fill="#333" opacity="0.9"/>
          <path d="M ${cx + faceW/2 + 8} ${topY - 5} L ${cx + faceW/2 + 20} ${topY + 2} L ${cx + faceW/2 + 8} ${topY + 2}" fill="#333" opacity="0.9"/>
        `.trim();
        break;
      case 'beanie':
        svg += `
          <path d="M ${cx - faceW/2 - 5} ${topY - 10} Q ${cx} ${topY - 25} ${cx + faceW/2 + 5} ${topY - 10} L ${cx + faceW/2 + 3} ${topY - 5} L ${cx - faceW/2 - 3} ${topY - 5}" fill="#C41E3A" opacity="0.85"/>
        `.trim();
        break;
      case 'fedora':
        svg += `
          <path d="M ${cx - faceW/2 - 6} ${topY - 8} Q ${cx} ${topY - 18} ${cx + faceW/2 + 6} ${topY - 8}" fill="#5D4037" opacity="0.9"/>
          <path d="M ${cx - faceW/2 - 12} ${topY - 5} L ${cx + faceW/2 + 12} ${topY - 5}" stroke="#5D4037" stroke-width="4" fill="none" opacity="0.9"/>
        `.trim();
        break;
    }
  }

  // Piercings
  if (f.hasPiercing && f.piercingStyle !== 'none') {
    const mouthY = cy + faceH * 0.28;
    switch (f.piercingStyle) {
      case 'nose-ring':
        svg += `<circle cx="${cx - 8}" cy="${cy - faceH * 0.02}" r="1.2" fill="#C0C0C0" stroke="#808080" stroke-width="0.3"/>`;
        break;
      case 'lip-ring':
        svg += `<circle cx="${cx - 6}" cy="${mouthY + 2}" r="1" fill="#C0C0C0" stroke="#808080" stroke-width="0.3"/>`;
        break;
      case 'eyebrow':
        svg += `<circle cx="${cx - 15}" cy="${cy - faceH * 0.15}" r="0.8" fill="#C0C0C0" stroke="#808080" stroke-width="0.3"/>`;
        break;
    }
  }

  // Scars
  if (f.hasScars && f.scarPositions.length > 0) {
    f.scarPositions.forEach(pos => {
      const [x, y] = pos.split(',').map(Number);
      svg += `<path d="M ${cx + (x - 0.5) * faceW} ${cy + (y - 0.5) * faceH} L ${cx + (x - 0.5) * faceW + 8} ${cy + (y - 0.5) * faceH - 2}" stroke="#D4A574" stroke-width="1" fill="none" opacity="0.6"/>`;
    });
  }

  // Moles
  if (f.hasMole) {
    svg += `<circle cx="${cx + (f.molePosition.x - 0.5) * faceW}" cy="${cy + (f.molePosition.y - 0.5) * faceH}" r="1.5" fill="#5D4037" opacity="0.8"/>`;
  }

  return svg;
}

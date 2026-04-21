import { AvatarFeatures, ColorPalette } from '../types';
import { blendColor, darkenColor, lightenColor } from '../utils';

/**
 * Renders the mouth with expression-based logic.
 */
export function renderMouth(f: AvatarFeatures, cx: number, cy: number, faceW: number, faceH: number, skin: ColorPalette): string {
  const mouthY = cy + faceH * 0.28;
  const mouthW = 10 + f.mouthWidth * 14;
  const lipH = 2 + f.lipFullness * 4;
  const lipColor = blendColor(skin.base, '#C06060', 0.3 + f.lipFullness * 0.2);
  
  let svg = '';

  switch (f.expression) {
    case 'smile':
      svg += `
        <!-- Upper Lip -->
        <path d="M ${cx - mouthW/2} ${mouthY} Q ${cx} ${mouthY - lipH * 1.2} ${cx + mouthW/2} ${mouthY}" fill="${lipColor}" stroke="${darkenColor(lipColor, 0.2)}" stroke-width="0.3"/>
        <!-- Lower Lip -->
        <path d="M ${cx - mouthW/2} ${mouthY + 1} Q ${cx} ${mouthY + lipH * 2.5} ${cx + mouthW/2} ${mouthY + 1}" fill="${lightenColor(lipColor, 0.1)}" stroke="${darkenColor(lipColor, 0.2)}" stroke-width="0.3"/>
        <!-- Mouth Line -->
        <path d="M ${cx - mouthW/2 + 2} ${mouthY} Q ${cx} ${mouthY + 3} ${cx + mouthW/2 - 2} ${mouthY}" stroke="${darkenColor(lipColor, 0.4)}" stroke-width="0.8" fill="none" opacity="0.6"/>
      `.trim();
      break;

    case 'smirk':
      svg += `
        <path d="M ${cx - mouthW/2} ${mouthY} Q ${cx + mouthW/4} ${mouthY - lipH} ${cx + mouthW/2} ${mouthY - 3}" fill="${lipColor}" stroke="${darkenColor(lipColor, 0.2)}" stroke-width="0.3"/>
        <path d="M ${cx - mouthW/2} ${mouthY + 1} Q ${cx + mouthW/4} ${mouthY + lipH} ${cx + mouthW/2} ${mouthY - 2}" fill="${lightenColor(lipColor, 0.1)}" stroke="${darkenColor(lipColor, 0.2)}" stroke-width="0.3"/>
      `.trim();
      break;

    case 'frown':
      svg += `
        <path d="M ${cx - mouthW/2} ${mouthY + 2} Q ${cx} ${mouthY - lipH} ${cx + mouthW/2} ${mouthY + 2}" fill="${lipColor}" stroke="${darkenColor(lipColor, 0.2)}" stroke-width="0.3"/>
        <path d="M ${cx - mouthW/2} ${mouthY + 3} Q ${cx} ${mouthY + lipH} ${cx + mouthW/2} ${mouthY + 3}" fill="${lightenColor(lipColor, 0.1)}" stroke="${darkenColor(lipColor, 0.2)}" stroke-width="0.3"/>
        <path d="M ${cx - mouthW/2 + 2} ${mouthY + 4} Q ${cx} ${mouthY + 1} ${cx + mouthW/2 - 2} ${mouthY + 4}" stroke="${darkenColor(lipColor, 0.4)}" stroke-width="1" fill="none" opacity="0.5"/>
      `.trim();
      break;

    case 'surprised':
      svg += `
        <ellipse cx="${cx}" cy="${mouthY + 2}" rx="${mouthW * 0.4}" ry="${lipH * 2.5}" fill="${darkenColor(lipColor, 0.4)}"/>
        <path d="M ${cx - mouthW/3} ${mouthY} Q ${cx} ${mouthY - lipH} ${cx + mouthW/3} ${mouthY}" stroke="${lipColor}" stroke-width="2" fill="none"/>
      `.trim();
      break;

    case 'neutral':
    default:
      svg += `
        <path d="M ${cx - mouthW/2} ${mouthY} Q ${cx} ${mouthY - lipH} ${cx + mouthW/2} ${mouthY}" fill="${lipColor}" stroke="${darkenColor(lipColor, 0.2)}" stroke-width="0.3"/>
        <path d="M ${cx - mouthW/2} ${mouthY + 1} Q ${cx} ${mouthY + lipH * 1.5} ${cx + mouthW/2} ${mouthY + 1}" fill="${lightenColor(lipColor, 0.1)}" stroke="${darkenColor(lipColor, 0.2)}" stroke-width="0.3"/>
        <line x1="${cx - mouthW/2 + 1}" y1="${mouthY}" x2="${cx + mouthW/2 - 1}" y2="${mouthY}" stroke="${darkenColor(lipColor, 0.4)}" stroke-width="0.6" opacity="0.5"/>
      `.trim();
      break;
  }

  return svg;
}

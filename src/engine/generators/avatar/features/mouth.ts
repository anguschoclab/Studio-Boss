import { AvatarFeatures, ColorPalette } from '../types';
import { blendColor, darkenColor, lightenColor } from '../utils';

/**
 * Renders the mouth with expression-based logic.
 */
export function renderMouth(f: AvatarFeatures, cx: number, cy: number, faceW: number, faceH: number, skin: ColorPalette): string {
  const mouthY = cy + faceH * 0.28;
  const mouthW = 10 + f.mouthWidth * 14;
  let lipH = 2 + f.lipFullness * 4;
  const lipColor = blendColor(skin.base, '#C06060', 0.3 + f.lipFullness * 0.2);

  // Apply smile asymmetry
  const smileOffset = f.smileAsymmetry * 5;

  // Adjust lip height based on shape
  switch (f.lipShape) {
    case 'thin':
      lipH *= 0.6;
      break;
    case 'full':
      lipH *= 1.4;
      break;
  }

  let svg = '';

  // Helper function to render lips based on shape
  const renderLips = (upperPath: string, lowerPath: string, mouthLine?: string) => {
    return `
      <!-- Upper Lip -->
      <path d="${upperPath}" fill="${lipColor}" stroke="${darkenColor(lipColor, 0.2)}" stroke-width="0.3"/>
      <!-- Lower Lip -->
      <path d="${lowerPath}" fill="${lightenColor(lipColor, 0.1)}" stroke="${darkenColor(lipColor, 0.2)}" stroke-width="0.3"/>
      ${mouthLine ? `<path d="${mouthLine}" stroke="${darkenColor(lipColor, 0.4)}" stroke-width="0.8" fill="none" opacity="0.6"/>` : ''}
    `.trim();
  };

  // Get lip paths based on shape
  const getLipPaths = () => {
    switch (f.lipShape) {
      case 'cupid-bow':
        return {
          upper: `M ${cx - mouthW/2} ${mouthY} Q ${cx - mouthW/4} ${mouthY - lipH * 1.3} ${cx} ${mouthY - lipH * 0.8} Q ${cx + mouthW/4} ${mouthY - lipH * 1.3} ${cx + mouthW/2} ${mouthY}`,
          lower: `M ${cx - mouthW/2} ${mouthY + 1} Q ${cx} ${mouthY + lipH * 2.5} ${cx + mouthW/2} ${mouthY + 1}`,
          mouthLine: `M ${cx - mouthW/2 + 2} ${mouthY} Q ${cx} ${mouthY + 3 + smileOffset} ${cx + mouthW/2 - 2} ${mouthY}`
        };
      case 'heart-shaped':
        return {
          upper: `M ${cx - mouthW/2} ${mouthY} Q ${cx} ${mouthY - lipH * 1.1} ${cx + mouthW/2} ${mouthY}`,
          lower: `M ${cx - mouthW/2} ${mouthY + 1} Q ${cx} ${mouthY + lipH * 3} ${cx + mouthW/2} ${mouthY + 1}`,
          mouthLine: `M ${cx - mouthW/2 + 1} ${mouthY} Q ${cx} ${mouthY + 2 + smileOffset} ${cx + mouthW/2 - 1} ${mouthY}`
        };
      case 'thin':
        return {
          upper: `M ${cx - mouthW/2} ${mouthY} Q ${cx} ${mouthY - lipH * 0.8} ${cx + mouthW/2} ${mouthY}`,
          lower: `M ${cx - mouthW/2} ${mouthY + 1} Q ${cx} ${mouthY + lipH * 1.2} ${cx + mouthW/2} ${mouthY + 1}`,
          mouthLine: `M ${cx - mouthW/2 + 1} ${mouthY} Q ${cx} ${mouthY + 1 + smileOffset} ${cx + mouthW/2 - 1} ${mouthY}`
        };
      case 'full':
        return {
          upper: `M ${cx - mouthW/2} ${mouthY} Q ${cx} ${mouthY - lipH * 1.5} ${cx + mouthW/2} ${mouthY}`,
          lower: `M ${cx - mouthW/2} ${mouthY + 1} Q ${cx} ${mouthY + lipH * 3} ${cx + mouthW/2} ${mouthY + 1}`,
          mouthLine: `M ${cx - mouthW/2 + 2} ${mouthY} Q ${cx} ${mouthY + 4 + smileOffset} ${cx + mouthW/2 - 2} ${mouthY}`
        };
      case 'uneven':
        return {
          upper: `M ${cx - mouthW/2} ${mouthY} Q ${cx - mouthW/4} ${mouthY - lipH * 1.2} ${cx + mouthW/2} ${mouthY}`,
          lower: `M ${cx - mouthW/2} ${mouthY + 1} Q ${cx + mouthW/4} ${mouthY + lipH * 2} ${cx + mouthW/2} ${mouthY + 1}`,
          mouthLine: `M ${cx - mouthW/2 + 1} ${mouthY} Q ${cx} ${mouthY + 3 + smileOffset} ${cx + mouthW/2 - 2} ${mouthY}`
        };
      default:
        return {
          upper: `M ${cx - mouthW/2} ${mouthY} Q ${cx} ${mouthY - lipH} ${cx + mouthW/2} ${mouthY}`,
          lower: `M ${cx - mouthW/2} ${mouthY + 1} Q ${cx} ${mouthY + lipH * 1.5} ${cx + mouthW/2} ${mouthY + 1}`,
          mouthLine: `M ${cx - mouthW/2 + 1} ${mouthY} Q ${cx} ${mouthY + 2 + smileOffset} ${cx + mouthW/2 - 1} ${mouthY}`
        };
    }
  };

  switch (f.expression) {
    case 'smile': {
      const paths = getLipPaths();
      svg += renderLips(paths.upper, paths.lower, paths.mouthLine);
      break;
    }

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
    default: {
      const paths = getLipPaths();
      svg += renderLips(paths.upper, paths.lower, paths.mouthLine);
      break;
    }
  }

  return svg;
}

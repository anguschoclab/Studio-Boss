import { AvatarFeatures, ColorPalette } from '../types';
import { darkenColor } from '../utils';

/**
 * Returns the SVG path for a specific eye shape.
 */
function getEyeShapePath(
  shape: AvatarFeatures['eyeShape'],
  cx: number, cy: number, w: number, h: number,
  skin: ColorPalette
): string {
  switch (shape) {
    case 'almond':
      return `<ellipse cx="${cx}" cy="${cy}" rx="${w}" ry="${h}" fill="#FFFDF5" stroke="${skin.shadow}" stroke-width="0.5"/>`;
    case 'round':
      return `<circle cx="${cx}" cy="${cy}" r="${w}" fill="#FFFDF5" stroke="${skin.shadow}" stroke-width="0.5"/>`;
    case 'hooded':
      return `<path d="M ${cx - w} ${cy - h * 0.3} Q ${cx - w} ${cy + h} ${cx} ${cy + h} Q ${cx + w} ${cy + h} ${cx + w} ${cy - h * 0.3} Q ${cx + w * 0.5} ${cy - h} ${cx} ${cy - h} Q ${cx - w * 0.5} ${cy - h} ${cx - w} ${cy - h * 0.3}" fill="#FFFDF5" stroke="${skin.shadow}" stroke-width="0.5"/>`;
    case 'monolid':
      return `<rect x="${cx - w}" y="${cy - h * 0.8}" width="${w * 2}" height="${h * 1.6}" rx="${w * 0.5}" fill="#FFFDF5" stroke="${skin.shadow}" stroke-width="0.5"/>`;
    case 'deep-set':
      return `<ellipse cx="${cx}" cy="${cy}" rx="${w * 0.85}" ry="${h * 0.85}" fill="#FFFDF5" stroke="${skin.shadow}" stroke-width="0.8"/>`;
    case 'upturned':
      return `<path d="M ${cx - w} ${cy + h * 0.2} Q ${cx - w * 0.7} ${cy - h} ${cx} ${cy - h * 0.8} Q ${cx + w * 0.7} ${cy - h} ${cx + w} ${cy + h * 0.2} Q ${cx + w * 0.5} ${cy + h} ${cx} ${cy + h * 0.8} Q ${cx - w * 0.5} ${cy + h} ${cx - w} ${cy + h * 0.2}" fill="#FFFDF5" stroke="${skin.shadow}" stroke-width="0.5"/>`;
    default:
      return `<ellipse cx="${cx}" cy="${cy}" rx="${w}" ry="${h}" fill="#FFFDF5" stroke="${skin.shadow}" stroke-width="0.5"/>`;
  }
}

/**
 * Renders the eyes, eyebrows, and eyelashes.
 * Includes blinking animation via CSS.
 */
export function renderEyes(f: AvatarFeatures, cx: number, cy: number, faceW: number, faceH: number, skin: ColorPalette): string {
  const eyeY = cy - faceH * 0.08;
  const eyeSpacing = 12 + f.eyeSpacing * 10;
  const eyeW = 8 + f.eyeSize * 7;
  const eyeH = 5 + f.eyeSize * 5;
  const slant = f.eyeSlant * 5;
  const irisR = eyeH * 0.7;
  const pupilR = irisR * 0.45;

  // Apply eye size asymmetry
  const leftEyeW = eyeW * (1 + f.eyeSizeAsymmetry);
  const rightEyeW = eyeW * (1 - f.eyeSizeAsymmetry);
  const leftEyeH = eyeH * (1 + f.eyeSizeAsymmetry * 0.5);
  const rightEyeH = eyeH * (1 - f.eyeSizeAsymmetry * 0.5);

  const browY = cy - faceH * 0.18;
  const browSpacing = 12 + f.eyeSpacing * 10;
  const browLen = 14 + f.browThickness * 6;
  const browThick = 2 + f.browThickness * 2.5;
  const browArch = f.browArch * 5;
  const browColor = darkenColor(f.hairColor.primary, 0.2);

  // Apply brow height asymmetry
  const leftBrowY = browY + f.browHeightAsymmetry * 5;
  const rightBrowY = browY - f.browHeightAsymmetry * 5;

  let svg = '';

  // ── Eyebrows ──
  // Left brow
  svg += `<path d="M ${cx - browSpacing - browLen/2} ${leftBrowY + 1} Q ${cx - browSpacing} ${leftBrowY - browArch} ${cx - browSpacing + browLen/2} ${leftBrowY + 1}" stroke="${browColor}" stroke-width="${browThick}" stroke-linecap="round" fill="none"/>`;
  // Right brow
  svg += `<path d="M ${cx + browSpacing - browLen/2} ${rightBrowY + 1} Q ${cx + browSpacing} ${rightBrowY - browArch} ${cx + browSpacing + browLen/2} ${rightBrowY + 1}" stroke="${browColor}" stroke-width="${browThick}" stroke-linecap="round" fill="none"/>`;

  // Helper function to render eye based on shape
  const renderEye = (eyeX: number, eyeY: number, eW: number, eH: number, rotation: number) => {
    const eyePath = getEyeShapePath(f.eyeShape, eyeX, eyeY, eW, eH, skin);
    const iR = eH * 0.7;
    const pR = iR * 0.45;

    return `
      <g transform="rotate(${rotation} ${eyeX} ${eyeY})">
        ${eyePath}
        <circle cx="${eyeX}" cy="${eyeY}" r="${iR}" fill="${f.eyeColor}"/>
        <circle cx="${eyeX}" cy="${eyeY}" r="${pR}" fill="#0A0A0A"/>
        <circle cx="${eyeX + iR * 0.3}" cy="${eyeY - iR * 0.3}" r="${pR * 0.5}" fill="white" opacity="0.7"/>
        <!-- Eyelid (Blinking Animation) -->
        <path class="av-blink" d="M ${eyeX - eW - 1} ${eyeY - eH - 1} L ${eyeX + eW + 1} ${eyeY - eH - 1} L ${eyeX + eW + 1} ${eyeY + eH + 1} L ${eyeX - eW - 1} ${eyeY + eH + 1} Z" fill="${skin.base}" transform-origin="${eyeX} ${eyeY - eH}" style="transform: scaleY(0); animation: av-blinking 4s infinite;"/>
      </g>
    `;
  };

  // ── Eyes (Left) ──
  svg += renderEye(cx - eyeSpacing, eyeY, leftEyeW, leftEyeH, slant);

  // ── Eyes (Right) ──
  svg += renderEye(cx + eyeSpacing, eyeY, rightEyeW, rightEyeH, -slant);

  // Epicanthic fold
  if (f.hasEpicanthicFold) {
    svg += `<path d="M ${cx - eyeSpacing - eyeW + 2} ${eyeY + 1} Q ${cx - eyeSpacing - eyeW + 4} ${eyeY - 2} ${cx - eyeSpacing - eyeW + 8} ${eyeY}" stroke="${skin.shadow}" stroke-width="0.8" fill="none"/>`;
    svg += `<path d="M ${cx + eyeSpacing + eyeW - 2} ${eyeY + 1} Q ${cx + eyeSpacing + eyeW - 4} ${eyeY - 2} ${cx + eyeSpacing + eyeW - 8} ${eyeY}" stroke="${skin.shadow}" stroke-width="0.8" fill="none"/>`;
  }

  return svg;
}

/**
 * CSS for blinking animation.
 */
export const EYE_ANIMATION_CSS = `
  @keyframes av-blinking {
    0%, 90%, 100% { transform: scaleY(0); }
    95% { transform: scaleY(1.2); }
  }
`;

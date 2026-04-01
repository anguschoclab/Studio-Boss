import { AvatarFeatures, ColorPalette } from '../types';
import { darkenColor } from '../utils';

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
  
  const browY = cy - faceH * 0.18;
  const browSpacing = 12 + f.eyeSpacing * 10;
  const browLen = 14 + f.browThickness * 6;
  const browThick = 2 + f.browThickness * 2.5;
  const browArch = f.browArch * 5;
  const browColor = darkenColor(f.hairColor.primary, 0.2);

  let svg = '';

  // ── Eyebrows ──
  // Left brow
  svg += `<path d="M ${cx - browSpacing - browLen/2} ${browY + 1} Q ${cx - browSpacing} ${browY - browArch} ${cx - browSpacing + browLen/2} ${browY + 1}" stroke="${browColor}" stroke-width="${browThick}" stroke-linecap="round" fill="none"/>`;
  // Right brow
  svg += `<path d="M ${cx + browSpacing - browLen/2} ${browY + 1} Q ${cx + browSpacing} ${browY - browArch} ${cx + browSpacing + browLen/2} ${browY + 1}" stroke="${browColor}" stroke-width="${browThick}" stroke-linecap="round" fill="none"/>`;

  // ── Eyes (Left) ──
  svg += `
    <g transform="rotate(${slant} ${cx - eyeSpacing} ${eyeY})">
      <ellipse cx="${cx - eyeSpacing}" cy="${eyeY}" rx="${eyeW}" ry="${eyeH}" fill="#FFFDF5" stroke="${skin.shadow}" stroke-width="0.5"/>
      <circle cx="${cx - eyeSpacing}" cy="${eyeY}" r="${irisR}" fill="${f.eyeColor}"/>
      <circle cx="${cx - eyeSpacing}" cy="${eyeY}" r="${pupilR}" fill="#0A0A0A"/>
      <circle cx="${cx - eyeSpacing + irisR * 0.3}" cy="${eyeY - irisR * 0.3}" r="${pupilR * 0.5}" fill="white" opacity="0.7"/>
      <!-- Eyelid (Blinking Animation) -->
      <path class="av-blink" d="M ${cx - eyeSpacing - eyeW - 1} ${eyeY - eyeH - 1} L ${cx - eyeSpacing + eyeW + 1} ${eyeY - eyeH - 1} L ${cx - eyeSpacing + eyeW + 1} ${eyeY + eyeH + 1} L ${cx - eyeSpacing - eyeW - 1} ${eyeY + eyeH + 1} Z" fill="${skin.base}" transform-origin="${cx - eyeSpacing} ${eyeY - eyeH}" style="transform: scaleY(0); animation: av-blinking 4s infinite;"/>
    </g>
  `;

  // ── Eyes (Right) ──
  svg += `
    <g transform="rotate(${-slant} ${cx + eyeSpacing} ${eyeY})">
      <ellipse cx="${cx + eyeSpacing}" cy="${eyeY}" rx="${eyeW}" ry="${eyeH}" fill="#FFFDF5" stroke="${skin.shadow}" stroke-width="0.5"/>
      <circle cx="${cx + eyeSpacing}" cy="${eyeY}" r="${irisR}" fill="${f.eyeColor}"/>
      <circle cx="${cx + eyeSpacing}" cy="${eyeY}" r="${pupilR}" fill="#0A0A0A"/>
      <circle cx="${cx + eyeSpacing + irisR * 0.3}" cy="${eyeY - irisR * 0.3}" r="${pupilR * 0.5}" fill="white" opacity="0.7"/>
      <!-- Eyelid (Blinking Animation) -->
      <path class="av-blink" d="M ${cx + eyeSpacing - eyeW - 1} ${eyeY - eyeH - 1} L ${cx + eyeSpacing + eyeW + 1} ${eyeY - eyeH - 1} L ${cx + eyeSpacing + eyeW + 1} ${eyeY + eyeH + 1} L ${cx + eyeSpacing - eyeW - 1} ${eyeY + eyeH + 1} Z" fill="${skin.base}" transform-origin="${cx + eyeSpacing} ${eyeY - eyeH}" style="transform: scaleY(0); animation: av-blinking 4s infinite;"/>
    </g>
  `;

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

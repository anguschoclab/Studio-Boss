import { AvatarFeatures, ColorPalette } from '../types';
import { darkenColor } from '../utils';

/**
 * Renders the neck and clothing for the avatar.
 */
export function renderClothing(f: AvatarFeatures, cx: number, cy: number, faceW: number, faceH: number, skin: ColorPalette): string {
  const neckW = 28 + f.faceWidth * 10;
  const chinY = cy + faceH * 0.48;
  const neckTop = chinY - 10;
  const neckBottom = neckTop + 50;
  const color = f.clothingColor;
  const shadowColor = darkenColor(color, 0.2);

  let svg = '';

  // ── Neck ──
  svg += `<rect x="${cx - neckW/2}" y="${neckTop}" width="${neckW}" height="${30 + neckTop}" rx="10" fill="${skin.shadow}"/>`;

  // ── Shoulders & Clothing ──
  // The 'av-breathe' class provides the subtle breathing animation
  svg += `<g class="av-breathe" style="animation: av-breathing 6s ease-in-out infinite;">`;

  switch (f.necklineStyle) {
    case 'collar':
      svg += `
        <!-- Dress Shirt / Blazer -->
        <path d="M ${cx - faceW} ${neckBottom} Q ${cx - faceW/2} ${neckTop - 5} ${cx} ${neckTop + 10} Q ${cx + faceW/2} ${neckTop - 5} ${cx + faceW} ${neckBottom} L ${cx + faceW} ${neckBottom + 80} L ${cx - faceW} ${neckBottom + 80} Z" fill="${color}"/>
        <path d="M ${cx - faceW} ${neckBottom} Q ${cx - faceW/2} ${neckTop - 5} ${cx} ${neckTop + 10} L ${cx} ${neckBottom + 80}" stroke="${shadowColor}" stroke-width="2" fill="none"/>
        <!-- Collars -->
        <path d="M ${cx} ${neckTop + 10} L ${cx - 20} ${neckBottom} L ${cx - 5} ${neckBottom + 5} Z" fill="${lighten(color, 0.1)}" stroke="${shadowColor}"/>
        <path d="M ${cx} ${neckTop + 10} L ${cx + 20} ${neckBottom} L ${cx + 5} ${neckBottom + 5} Z" fill="${lighten(color, 0.1)}" stroke="${shadowColor}"/>
      `.trim();
      break;

    case 'v-neck':
      svg += `
        <path d="M ${cx - faceW} ${neckBottom} Q ${cx - faceW/2} ${neckTop - 5} ${cx} ${neckTop + 15} Q ${cx + faceW/2} ${neckTop - 5} ${cx + faceW} ${neckBottom} L ${cx + faceW} ${neckBottom + 80} L ${cx - faceW} ${neckBottom + 80} Z" fill="${color}"/>
        <path d="M ${cx - faceW/2} ${neckTop - 5} L ${cx} ${neckTop + 15} L ${cx + faceW/2} ${neckTop - 5}" stroke="${shadowColor}" stroke-width="4" fill="none"/>
      `.trim();
      break;

    case 'hoodie':
      svg += `
        <path d="M ${cx - faceW - 5} ${neckBottom} Q ${cx - faceW/2} ${neckTop - 10} ${cx} ${neckTop + 5} Q ${cx + faceW/2} ${neckTop - 10} ${cx + faceW + 5} ${neckBottom} L ${cx + faceW} ${neckBottom + 80} L ${cx - faceW} ${neckBottom + 80} Z" fill="${color}"/>
        <circle cx="${cx - 15}" cy="${neckTop + 25}" r="3" fill="white" opacity="0.5"/>
        <circle cx="${cx + 15}" cy="${neckTop + 25}" r="3" fill="white" opacity="0.5"/>
      `.trim();
      break;

    case 'round':
    default:
      svg += `
        <path d="M ${cx - faceW} ${neckBottom} Q ${cx - faceW/2} ${neckTop - 5} ${cx} ${neckTop + 5} Q ${cx + faceW/2} ${neckTop - 5} ${cx + faceW} ${neckBottom} L ${cx + faceW} ${neckBottom + 80} L ${cx - faceW} ${neckBottom + 80} Z" fill="${color}"/>
        <path d="M ${cx - faceW/2} ${neckTop - 5} Q ${cx} ${neckTop + 5} ${cx + faceW/2} ${neckTop - 5}" stroke="${shadowColor}" stroke-width="6" fill="none" opacity="0.3"/>
      `.trim();
      break;
  }

  svg += `</g>`;

  return svg;
}

function lighten(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

export const CLOTHING_ANIMATION_CSS = `
  @keyframes av-breathing {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(1.5px); }
  }
`;

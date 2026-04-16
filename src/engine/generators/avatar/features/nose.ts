import { AvatarFeatures, ColorPalette } from '../types';
import { darkenColor } from '../utils';

/**
 * Renders the nose with defined bridge and tip shapes.
 */
export function renderNose(f: AvatarFeatures, cx: number, cy: number, faceW: number, faceH: number, skin: ColorPalette): string {
  const noseY = cy + faceH * 0.08;
  const noseW = 6 + f.noseWidth * 10;
  const noseLen = 10 + f.noseLength * 10;
  const bridgeW = 2 + f.noseBridge * 4;
  const shadowColor = darkenColor(skin.shadow, 0.1);
  const eyeY = cy - faceH * 0.08;
  const eyeH = 5 + f.eyeSize * 5;

  let svg = '';

  // ── Nose Bridge ──
  switch (f.noseBridgeShape) {
    case 'roman':
      svg += `<path d="M ${cx - bridgeW/2} ${eyeY + eyeH + 2} Q ${cx - bridgeW/2 - 1} ${noseY - 3} ${cx - noseW/2} ${noseY + noseLen/2}" stroke="${skin.shadow}" stroke-width="0.8" fill="none" opacity="0.6"/>`;
      svg += `<path d="M ${cx} ${eyeY + eyeH + 2} Q ${cx} ${noseY - 2} ${cx} ${noseY + noseLen/2}" stroke="${skin.shadow}" stroke-width="1" fill="none" opacity="0.4"/>`;
      break;
    case 'button':
      svg += `<path d="M ${cx - bridgeW/2} ${eyeY + eyeH + 2} Q ${cx - bridgeW/2 - 3} ${noseY + 2} ${cx - noseW/2} ${noseY + noseLen/2}" stroke="${skin.shadow}" stroke-width="0.8" fill="none" opacity="0.6"/>`;
      break;
    case 'concave':
      svg += `<path d="M ${cx - bridgeW/2} ${eyeY + eyeH + 2} Q ${cx - bridgeW/2 + 2} ${noseY + 4} ${cx - noseW/2} ${noseY + noseLen/2}" stroke="${skin.shadow}" stroke-width="0.8" fill="none" opacity="0.6"/>`;
      break;
    case 'humped':
      svg += `<path d="M ${cx - bridgeW/2} ${eyeY + eyeH + 2} Q ${cx - bridgeW/2 - 2} ${noseY - 2} ${cx - bridgeW/2 + 2} ${noseY} ${cx - noseW/2} ${noseY + noseLen/2}" stroke="${skin.shadow}" stroke-width="0.8" fill="none" opacity="0.6"/>`;
      break;
    case 'straight':
    default:
      svg += `<path d="M ${cx - bridgeW/2} ${eyeY + eyeH + 2} Q ${cx - bridgeW/2 - 2} ${noseY} ${cx - noseW/2} ${noseY + noseLen/2}" stroke="${skin.shadow}" stroke-width="0.8" fill="none" opacity="0.6"/>`;
      break;
  }

  // ── Nose Tip ──
  switch (f.noseTipShape) {
    case 'pointed':
      svg += `
        <path d="M ${cx - noseW/2} ${noseY + noseLen/2} Q ${cx} ${noseY + noseLen/2 + 5} ${cx + noseW/2} ${noseY + noseLen/2}" stroke="${skin.shadow}" stroke-width="1.2" fill="none"/>
        <path d="M ${cx - 2} ${noseY + noseLen/2 + 1} L ${cx} ${noseY + noseLen/2 + 4} L ${cx + 2} ${noseY + noseLen/2 + 1}" stroke="${shadowColor}" stroke-width="0.5" fill="none" opacity="0.4"/>
      `.trim();
      break;

    case 'flat':
      svg += `
        <ellipse cx="${cx}" cy="${noseY + noseLen/2}" rx="${noseW/2 + 2}" ry="${noseW/4}" fill="${skin.shadow}" opacity="0.1"/>
        <path d="M ${cx - noseW/2 - 1} ${noseY + noseLen/2} Q ${cx} ${noseY + noseLen/2 + 2} ${cx + noseW/2 + 1} ${noseY + noseLen/2}" stroke="${skin.shadow}" stroke-width="1.5" fill="none" opacity="0.8"/>
      `.trim();
      break;

    case 'bulbous':
      svg += `
        <circle cx="${cx}" cy="${noseY + noseLen/2}" r="${noseW/2.2}" fill="${skin.shadow}" opacity="0.15"/>
        <path d="M ${cx - noseW/2} ${noseY + noseLen/2} Q ${cx} ${noseY + noseLen/2 + 3} ${cx + noseW/2} ${noseY + noseLen/2}" stroke="${skin.shadow}" stroke-width="1.2" fill="none"/>
      `.trim();
      break;

    case 'upturned':
      svg += `
        <path d="M ${cx - noseW/2} ${noseY + noseLen/2 + 2} Q ${cx} ${noseY + noseLen/2 - 1} ${cx + noseW/2} ${noseY + noseLen/2 + 2}" stroke="${skin.shadow}" stroke-width="1.2" fill="none"/>
        <circle cx="${cx}" cy="${noseY + noseLen/2 - 1}" r="${noseW/3}" fill="${skin.shadow}" opacity="0.1"/>
      `.trim();
      break;

    case 'hooked':
      svg += `
        <path d="M ${cx - noseW/2} ${noseY + noseLen/2} Q ${cx} ${noseY + noseLen/2 + 6} ${cx + noseW/2 + 2} ${noseY + noseLen/2}" stroke="${skin.shadow}" stroke-width="1.2" fill="none"/>
        <path d="M ${cx} ${noseY + noseLen/2} Q ${cx + 2} ${noseY + noseLen/2 + 4} ${cx + 2} ${noseY + noseLen/2 + 2}" stroke="${shadowColor}" stroke-width="0.5" fill="none" opacity="0.4"/>
      `.trim();
      break;

    case 'round':
    default:
      svg += `
        <circle cx="${cx}" cy="${noseY + noseLen/2}" r="${noseW/3}" fill="${skin.shadow}" opacity="0.2"/>
        <path d="M ${cx - noseW/2} ${noseY + noseLen/2} Q ${cx} ${noseY + noseLen/2 + 4} ${cx + noseW/2} ${noseY + noseLen/2}" stroke="${skin.shadow}" stroke-width="1.2" fill="none"/>
      `.trim();
      break;
  }

  // ── Nostrils ──
  svg += `
    <circle cx="${cx - noseW/3}" cy="${noseY + noseLen/2 + 1}" r="1.5" fill="${shadowColor}" opacity="0.4"/>
    <circle cx="${cx + noseW/3}" cy="${noseY + noseLen/2 + 1}" r="1.5" fill="${shadowColor}" opacity="0.4"/>
  `.trim();

  return svg;
}

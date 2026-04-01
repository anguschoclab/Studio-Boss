import { AvatarFeatures, HairColor } from '../types';

/**
 * Renders the back layer of the hair (for long styles).
 */
export function renderHairBack(f: AvatarFeatures, cx: number, cy: number, faceW: number, faceH: number): string {
  const topY = cy - faceH / 2;
  const color = f.hairColor.primary;

  switch (f.hairStyle) {
    case 'long-straight':
    case 'long-wavy':
      return `<path d="M ${cx - faceW/2 - 5} ${topY + 15} Q ${cx - faceW/2 - 10} ${topY + 80} ${cx - faceW/3} ${topY + 110} L ${cx + faceW/3} ${topY + 110} Q ${cx + faceW/2 + 10} ${topY + 80} ${cx + faceW/2 + 5} ${topY + 15}" fill="${color}" opacity="0.9"/>`;
    case 'shoulder-bob':
      return `<path d="M ${cx - faceW/2 - 4} ${topY + 20} Q ${cx - faceW/2 - 8} ${topY + 50} ${cx} ${topY + 60} Q ${cx + faceW/2 + 8} ${topY + 50} ${cx + faceW/2 + 4} ${topY + 20}" fill="${color}"/>`;
    default:
      return '';
  }
}

/**
 * Renders the front layer of the hair.
 */
export function renderHairFront(f: AvatarFeatures, cx: number, cy: number, faceW: number, faceH: number): string {
  const topY = cy - faceH / 2;
  const hl = f.hairLine; // 0-1
  const color = f.hairColor.primary;
  const secondary = f.hairColor.secondary;
  const shine = f.hairColor.shine || f.hairColor.secondary;

  switch (f.hairStyle) {
    case 'short-crop':
      return `
        <path d="M ${cx - faceW/2 - 2} ${topY + 10} Q ${cx} ${topY - 15 - hl*5} ${cx + faceW/2 + 2} ${topY + 10} Q ${cx + faceW/2} ${topY + 20} ${cx} ${topY + 25 - hl*10} Q ${cx - faceW/2} ${topY + 20} ${cx - faceW/2 - 2} ${topY + 10}" fill="${color}"/>
        <path d="M ${cx - faceW/3} ${topY - 5} Q ${cx} ${topY - 10} ${cx + faceW/3} ${topY - 5}" stroke="${shine}" stroke-width="2" opacity="0.3" fill="none"/>
      `.trim();

    case 'side-part':
      return `
        <path d="M ${cx - faceW/2 - 4} ${topY + 5} Q ${cx - faceW/4} ${topY - 22} ${cx + faceW/2 + 4} ${topY + 5} Q ${cx + faceW/2} ${topY + 20} ${cx} ${topY + 20} Q ${cx - faceW/2} ${topY + 20} ${cx - faceW/2 - 4} ${topY + 5}" fill="${color}"/>
        <line x1="${cx - faceW/6}" y1="${topY - 18}" x2="${cx - faceW/6 + 2}" y2="${topY + 5}" stroke="${secondary}" stroke-width="1.5" opacity="0.4"/>
      `.trim();

    case 'textured-fade':
      let circles = '';
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI;
        const tx = cx + Math.cos(ang) * (faceW/2);
        const ty = topY + Math.sin(ang) * 5;
        circles += `<circle cx="${tx}" cy="${ty}" r="4" fill="${color}"/>`;
      }
      return `
        <path d="M ${cx - faceW/2} ${topY + 10} Q ${cx} ${topY - 10} ${cx + faceW/2} ${topY + 10}" fill="${color}"/>
        ${circles}
      `.trim();

    case 'long-straight':
      return `
        <path d="M ${cx - faceW/2 - 6} ${topY + 10} Q ${cx} ${topY - 25} ${cx + faceW/2 + 6} ${topY + 10} L ${cx + faceW/2 + 8} ${topY + 90} Q ${cx} ${topY + 100} ${cx - faceW/2 - 8} ${topY + 90} Z" fill="${color}"/>
        <path d="M ${cx - faceW/6} ${topY - 15} Q ${cx} ${topY - 20} ${cx + faceW/6} ${topY - 15}" stroke="${shine}" stroke-width="3" opacity="0.2" fill="none"/>
      `.trim();

    case 'top-knot':
      return `
        <circle cx="${cx}" cy="${topY - 18}" r="14" fill="${color}"/>
        <path d="M ${cx - faceW/2} ${topY + 15} Q ${cx} ${topY - 10} ${cx + faceW/2} ${topY + 15}" fill="${color}"/>
      `.trim();

    case 'afro-round':
      return `<circle cx="${cx}" cy="${cy - 20}" r="${faceW * 0.65}" fill="${color}" opacity="0.95"/>`;

    case 'buzz-cut':
      return `<path d="M ${cx - faceW/2} ${topY + 15} Q ${cx} ${topY - 8} ${cx + faceW/2} ${topY + 15}" fill="${color}" opacity="0.4"/>`;

    case 'pixie':
      return `
        <path d="M ${cx - faceW/2 - 2} ${topY + 5} Q ${cx} ${topY - 20} ${cx + faceW/2 + 2} ${topY + 5} Q ${cx + faceW/2} ${topY + 15} ${cx} ${topY + 15} Q ${cx - faceW/2} ${topY + 15} ${cx - faceW/2 - 2} ${topY + 5}" fill="${color}"/>
        <path d="M ${cx - faceW/2} ${topY + 10} L ${cx - faceW/2 - 5} ${topY + 25}" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
        <path d="M ${cx + faceW/2} ${topY + 10} L ${cx + faceW/2 + 5} ${topY + 25}" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      `.trim();

    case 'ponytail':
      return `
        <path d="M ${cx - faceW/2} ${topY + 15} Q ${cx} ${topY - 15} ${cx + faceW/2} ${topY + 15}" fill="${color}"/>
        <path d="M ${cx + faceW/2} ${topY} Q ${cx + faceW/2 + 20} ${topY + 10} ${cx + faceW/2 + 10} ${topY + 60}" fill="${color}" stroke="${secondary}" stroke-width="1"/>
      `.trim();

    case 'curls-medium':
      let curls = '';
      for (let i = 0; i < 15; i++) {
        const x = cx - faceW/2 + (i/15) * faceW;
        const y = topY + (Math.sin(i * 1.5) * 5);
        curls += `<circle cx="${x}" cy="${y}" r="6" fill="${color}"/>`;
      }
      return `
        <path d="M ${cx - faceW/2 - 5} ${topY + 10} Q ${cx} ${topY - 20} ${cx + faceW/2 + 5} ${topY + 10}" fill="${color}"/>
        ${curls}
      `.trim();

    case 'slick-back':
      return `
        <path d="M ${cx - faceW/2} ${topY + 10} Q ${cx} ${topY - 25} ${cx + faceW/2} ${topY + 10} L ${cx + faceW/2 - 5} ${topY + 15} Q ${cx} ${topY + 10} ${cx - faceW/2 + 5} ${topY + 15} Z" fill="${color}"/>
        <path d="M ${cx - 10} ${topY - 10} Q ${cx} ${topY - 15} ${cx + 10} ${topY - 10}" stroke="${shine}" stroke-width="1.5" opacity="0.3" fill="none"/>
      `.trim();

    case 'wavy-shoulder':
      return `
        <path d="M ${cx - faceW/2 - 8} ${topY + 10} Q ${cx} ${topY - 30} ${cx + faceW/2 + 8} ${topY + 10} Q ${cx + faceW/2 + 15} ${topY + 40} ${cx + faceW/2} ${topY + 70} Q ${cx} ${topY + 65} ${cx - faceW/2} ${topY + 70} Q ${cx - faceW/2 - 15} ${topY + 40} ${cx - faceW/2 - 8} ${topY + 10}" fill="${color}"/>
      `.trim();

    case 'bald':
    default:
      return '';
  }
}

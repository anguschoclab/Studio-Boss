import { AvatarFeatures } from '../types';

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
    case 'wavy-shoulder':
      return `<path d="M ${cx - faceW/2 - 6} ${topY + 18} Q ${cx - faceW/2 - 14} ${topY + 60} ${cx - faceW/3} ${topY + 80} L ${cx + faceW/3} ${topY + 80} Q ${cx + faceW/2 + 14} ${topY + 60} ${cx + faceW/2 + 6} ${topY + 18}" fill="${color}" opacity="0.9"/>`;
    case 'half-up':
      return `<path d="M ${cx - faceW/2 - 4} ${topY + 16} Q ${cx - faceW/2 - 10} ${topY + 70} ${cx - faceW/3} ${topY + 95} L ${cx + faceW/3} ${topY + 95} Q ${cx + faceW/2 + 10} ${topY + 70} ${cx + faceW/2 + 4} ${topY + 16}" fill="${color}" opacity="0.9"/>`;
    case 'braids':
      return `<path d="M ${cx - faceW/2 - 2} ${topY + 16} Q ${cx} ${topY + 30} ${cx + faceW/2 + 2} ${topY + 16} L ${cx + faceW/2 - 4} ${topY + 50} L ${cx - faceW/2 + 4} ${topY + 50} Z" fill="${color}" opacity="0.85"/>`;
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

    case 'textured-fade': {
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
    }

    case 'long-straight':
      // Crown + bangs + thin side-frames only. Body sits in `renderHairBack`
      // so a filled Z path can't cover the face.
      return `
        <path d="M ${cx - faceW/2 - 6} ${topY + 10} Q ${cx} ${topY - 25} ${cx + faceW/2 + 6} ${topY + 10} Q ${cx + faceW/2} ${topY + 18} ${cx} ${topY + 12} Q ${cx - faceW/2} ${topY + 18} ${cx - faceW/2 - 6} ${topY + 10} Z" fill="${color}"/>
        <path d="M ${cx - faceW/2 - 6} ${topY + 10} L ${cx - faceW/2 - 4} ${topY + 50}" stroke="${color}" stroke-width="6" stroke-linecap="round" opacity="0.95"/>
        <path d="M ${cx + faceW/2 + 6} ${topY + 10} L ${cx + faceW/2 + 4} ${topY + 50}" stroke="${color}" stroke-width="6" stroke-linecap="round" opacity="0.95"/>
        <path d="M ${cx - faceW/6} ${topY - 15} Q ${cx} ${topY - 20} ${cx + faceW/6} ${topY - 15}" stroke="${shine}" stroke-width="3" opacity="0.2" fill="none"/>
      `.trim();

    case 'top-knot':
      return `
        <circle cx="${cx}" cy="${topY - 18}" r="14" fill="${color}"/>
        <path d="M ${cx - faceW/2} ${topY + 15} Q ${cx} ${topY - 10} ${cx + faceW/2} ${topY + 15}" fill="${color}"/>
      `.trim();

    case 'afro-round': {
      // Donut silhouette around the head — never fills the face.
      const r = faceW * 0.7;
      const ringCy = cy - 18;
      let ring = '';
      for (let i = 0; i < 18; i++) {
        const ang = (i / 18) * Math.PI * 2;
        // skip the lower-front arc so the face stays clear
        if (ang > Math.PI * 0.25 && ang < Math.PI * 0.75) continue;
        const tx = cx + Math.cos(ang) * (r * 0.85);
        const ty = ringCy + Math.sin(ang) * (r * 0.75);
        ring += `<circle cx="${tx}" cy="${ty}" r="9" fill="${color}"/>`;
      }
      return ring;
    }

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

    case 'curls-medium': {
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
    }

    case 'slick-back':
      return `
        <path d="M ${cx - faceW/2} ${topY + 10} Q ${cx} ${topY - 25} ${cx + faceW/2} ${topY + 10} L ${cx + faceW/2 - 5} ${topY + 15} Q ${cx} ${topY + 10} ${cx - faceW/2 + 5} ${topY + 15} Z" fill="${color}"/>
        <path d="M ${cx - 10} ${topY - 10} Q ${cx} ${topY - 15} ${cx + 10} ${topY - 10}" stroke="${shine}" stroke-width="1.5" opacity="0.3" fill="none"/>
      `.trim();

    case 'wavy-shoulder':
      // Front = crown + soft side wisps. Body sits in the back layer.
      return `
        <path d="M ${cx - faceW/2 - 8} ${topY + 10} Q ${cx} ${topY - 28} ${cx + faceW/2 + 8} ${topY + 10} Q ${cx + faceW/2} ${topY + 22} ${cx} ${topY + 14} Q ${cx - faceW/2} ${topY + 22} ${cx - faceW/2 - 8} ${topY + 10} Z" fill="${color}"/>
        <path d="M ${cx - faceW/2 - 6} ${topY + 14} Q ${cx - faceW/2 - 14} ${topY + 36} ${cx - faceW/2 - 6} ${topY + 56}" stroke="${color}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.95"/>
        <path d="M ${cx + faceW/2 + 6} ${topY + 14} Q ${cx + faceW/2 + 14} ${topY + 36} ${cx + faceW/2 + 6} ${topY + 56}" stroke="${color}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.95"/>
      `.trim();

    case 'undercut': {
      // Long on top, very short / shaved on the sides — popular South/East Asian style
      const sweep = `<path d="M ${cx - faceW/2 - 2} ${topY + 12} Q ${cx - faceW/4} ${topY - 22} ${cx + faceW/2 + 6} ${topY - 5} Q ${cx + faceW/3} ${topY + 10} ${cx} ${topY + 18} Q ${cx - faceW/2} ${topY + 18} ${cx - faceW/2 - 2} ${topY + 12}" fill="${color}"/>`;
      const sideShade = `<path d="M ${cx - faceW/2 - 2} ${topY + 12} Q ${cx - faceW/2} ${topY + 22} ${cx - faceW/2 + 4} ${topY + 28} L ${cx - faceW/2 + 4} ${topY + 14} Z" fill="${secondary}" opacity="0.7"/>` +
        `<path d="M ${cx + faceW/2 - 4} ${topY + 14} L ${cx + faceW/2 - 4} ${topY + 28} Q ${cx + faceW/2} ${topY + 22} ${cx + faceW/2 + 2} ${topY + 12} Z" fill="${secondary}" opacity="0.7"/>`;
      return `${sideShade}${sweep}`;
    }

    case 'middle-part': {
      // Curtain-style — common in K-pop / J-pop and South Asian youth presets
      return `
        <path d="M ${cx - faceW/2 - 4} ${topY + 8} Q ${cx} ${topY - 22} ${cx + faceW/2 + 4} ${topY + 8} L ${cx + faceW/2} ${topY + 22} Q ${cx + faceW/4} ${topY + 18} ${cx + 1} ${topY + 6} L ${cx - 1} ${topY + 6} Q ${cx - faceW/4} ${topY + 18} ${cx - faceW/2} ${topY + 22} Z" fill="${color}"/>
        <line x1="${cx}" y1="${topY - 14}" x2="${cx}" y2="${topY + 6}" stroke="${secondary}" stroke-width="1.2" opacity="0.55"/>
      `.trim();
    }

    case 'mop-top': {
      // Bowl/mop shape — Beatles-esque, fits younger Asian presets
      return `
        <path d="M ${cx - faceW/2 - 4} ${topY + 22} Q ${cx - faceW/2 - 6} ${topY - 5} ${cx} ${topY - 18} Q ${cx + faceW/2 + 6} ${topY - 5} ${cx + faceW/2 + 4} ${topY + 22} Q ${cx + faceW/3} ${topY + 18} ${cx} ${topY + 14} Q ${cx - faceW/3} ${topY + 18} ${cx - faceW/2 - 4} ${topY + 22} Z" fill="${color}"/>
        <path d="M ${cx - faceW/3} ${topY + 4} Q ${cx} ${topY - 8} ${cx + faceW/3} ${topY + 4}" stroke="${shine}" stroke-width="2" opacity="0.25" fill="none"/>
      `.trim();
    }

    case 'thick-wave': {
      // Thick wavy hair with volume — common in South Asian male presets
      return `
        <path d="M ${cx - faceW/2 - 4} ${topY + 14} Q ${cx - faceW/3} ${topY - 18} ${cx} ${topY - 22} Q ${cx + faceW/3} ${topY - 18} ${cx + faceW/2 + 4} ${topY + 14} Q ${cx + faceW/3} ${topY + 8} ${cx + faceW/8} ${topY + 12} Q ${cx} ${topY + 6} ${cx - faceW/8} ${topY + 12} Q ${cx - faceW/3} ${topY + 8} ${cx - faceW/2 - 4} ${topY + 14} Z" fill="${color}"/>
        <path d="M ${cx - faceW/4} ${topY - 6} Q ${cx - faceW/8} ${topY - 12} ${cx} ${topY - 8}" stroke="${shine}" stroke-width="1.5" opacity="0.35" fill="none"/>
        <path d="M ${cx} ${topY - 8} Q ${cx + faceW/8} ${topY - 12} ${cx + faceW/4} ${topY - 6}" stroke="${shine}" stroke-width="1.5" opacity="0.35" fill="none"/>
      `.trim();
    }

    case 'spiky': {
      // Anime-inspired spiky cut for younger East Asian male presets
      let spikes = '';
      const spikeCount = 7;
      for (let i = 0; i < spikeCount; i++) {
        const sx = cx - faceW/2 + (i / (spikeCount - 1)) * faceW;
        const peak = topY - 8 - ((i % 2 === 0) ? 6 : 2);
        spikes += `<path d="M ${sx - 6} ${topY + 6} L ${sx} ${peak} L ${sx + 6} ${topY + 6} Z" fill="${color}"/>`;
      }
      return `
        <path d="M ${cx - faceW/2 - 2} ${topY + 14} Q ${cx} ${topY - 4} ${cx + faceW/2 + 2} ${topY + 14}" fill="${color}"/>
        ${spikes}
      `.trim();
    }

    case 'pompadour': {
      // High volume on top, tapered sides
      return `
        <path d="M ${cx - faceW/2 - 2} ${topY + 14} Q ${cx - faceW/4} ${topY - 30} ${cx + faceW/4} ${topY - 28} Q ${cx + faceW/2 + 2} ${topY - 4} ${cx + faceW/2 + 2} ${topY + 14} Q ${cx + faceW/3} ${topY + 12} ${cx} ${topY + 18} Q ${cx - faceW/3} ${topY + 12} ${cx - faceW/2 - 2} ${topY + 14} Z" fill="${color}"/>
        <path d="M ${cx - faceW/6} ${topY - 22} Q ${cx} ${topY - 28} ${cx + faceW/6} ${topY - 22}" stroke="${shine}" stroke-width="2" opacity="0.4" fill="none"/>
      `.trim();
    }

    case 'bun': {
      // Smooth crown pulled back into a bun on top.
      const bunY = topY - 14;
      return `
        <path d="M ${cx - faceW/2 - 2} ${topY + 14} Q ${cx} ${topY - 12} ${cx + faceW/2 + 2} ${topY + 14} Q ${cx + faceW/2} ${topY + 22} ${cx} ${topY + 14} Q ${cx - faceW/2} ${topY + 22} ${cx - faceW/2 - 2} ${topY + 14} Z" fill="${color}"/>
        <ellipse cx="${cx}" cy="${bunY}" rx="13" ry="11" fill="${color}"/>
        <ellipse cx="${cx - 3}" cy="${bunY - 3}" rx="6" ry="4" fill="${shine}" opacity="0.35"/>
      `.trim();
    }

    case 'half-up': {
      // Front = crown + small top knot. Length sits in the back layer.
      return `
        <path d="M ${cx - faceW/2 - 4} ${topY + 8} Q ${cx} ${topY - 24} ${cx + faceW/2 + 4} ${topY + 8} Q ${cx + faceW/2} ${topY + 20} ${cx} ${topY + 14} Q ${cx - faceW/2} ${topY + 20} ${cx - faceW/2 - 4} ${topY + 8} Z" fill="${color}"/>
        <ellipse cx="${cx}" cy="${topY - 6}" rx="10" ry="7" fill="${color}"/>
        <path d="M ${cx - faceW/6} ${topY - 16} Q ${cx} ${topY - 22} ${cx + faceW/6} ${topY - 16}" stroke="${shine}" stroke-width="2" opacity="0.3" fill="none"/>
      `.trim();
    }

    case 'braids': {
      // Crown + 2 long braids draping in front of the shoulders.
      const crown = `<path d="M ${cx - faceW/2 - 4} ${topY + 12} Q ${cx} ${topY - 22} ${cx + faceW/2 + 4} ${topY + 12} Q ${cx + faceW/2} ${topY + 22} ${cx} ${topY + 14} Q ${cx - faceW/2} ${topY + 22} ${cx - faceW/2 - 4} ${topY + 12} Z" fill="${color}"/>`;
      const braidL = `<path d="M ${cx - faceW/2 - 2} ${topY + 18} Q ${cx - faceW/2 - 6} ${topY + 50} ${cx - faceW/2 + 2} ${topY + 80}" stroke="${color}" stroke-width="7" stroke-linecap="round" fill="none"/>`;
      const braidR = `<path d="M ${cx + faceW/2 + 2} ${topY + 18} Q ${cx + faceW/2 + 6} ${topY + 50} ${cx + faceW/2 - 2} ${topY + 80}" stroke="${color}" stroke-width="7" stroke-linecap="round" fill="none"/>`;
      let knots = '';
      for (let i = 1; i <= 4; i++) {
        const t = i / 5;
        const yL = topY + 18 + t * 60;
        const xL = cx - faceW/2 - 2 + (t * 4) - (t > 0.5 ? (t - 0.5) * 8 : 0);
        const yR = topY + 18 + t * 60;
        const xR = cx + faceW/2 + 2 - (t * 4) + (t > 0.5 ? (t - 0.5) * 8 : 0);
        knots += `<ellipse cx="${xL}" cy="${yL}" rx="4" ry="2.5" fill="${secondary}" opacity="0.55"/>`;
        knots += `<ellipse cx="${xR}" cy="${yR}" rx="4" ry="2.5" fill="${secondary}" opacity="0.55"/>`;
      }
      return `${crown}${braidL}${braidR}${knots}`;
    }

    case 'afro': {
      // Donut silhouette of curl-circles around the head — never fills the face.
      const r = faceW * 0.78;
      const ringCy = cy - 16;
      let ring = '';
      for (let i = 0; i < 22; i++) {
        const ang = (i / 22) * Math.PI * 2;
        // skip the lower-front arc so the face stays clear
        if (ang > Math.PI * 0.25 && ang < Math.PI * 0.75) continue;
        const tx = cx + Math.cos(ang) * (r * 0.9);
        const ty = ringCy + Math.sin(ang) * (r * 0.78);
        ring += `<circle cx="${tx}" cy="${ty}" r="11" fill="${color}"/>`;
      }
      return `
        ${ring}
        <path d="M ${cx - faceW/2} ${topY + 18} Q ${cx} ${topY + 6} ${cx + faceW/2} ${topY + 18}" fill="${color}"/>
        <path d="M ${cx - faceW/2 - 2} ${topY + 12} Q ${cx} ${topY + 2} ${cx + faceW/2 + 2} ${topY + 12}" stroke="${shine}" stroke-width="2" opacity="0.25" fill="none"/>
      `.trim();
    }

    case 'bald':
    default:
      return '';
  }
}

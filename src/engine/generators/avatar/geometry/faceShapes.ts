import { ColorPalette } from '../types';

/**
 * Returns the SVG path for a specific face shape.
 * cx, cy: Center coordinates
 * w, h: Width and Height
 */
export function getFaceShapePath(
  shape: 'oval' | 'square' | 'heart' | 'round' | 'oblong' | 'diamond' | 'pear' | 'inverted-triangle' | 'rectangular',
  cx: number, cy: number, w: number, h: number,
  jawWidth: number, chinPointiness: number
): string {
  const rx = w / 2;
  const ry = h / 2;
  const jw = rx * jawWidth;
  const cp = chinPointiness * 10;

  switch (shape) {
    case 'square':
      return `
        M ${cx - rx} ${cy - ry * 0.5}
        Q ${cx - rx} ${cy - ry} ${cx} ${cy - ry}
        Q ${cx + rx} ${cy - ry} ${cx + rx} ${cy - ry * 0.5}
        L ${cx + rx} ${cy + ry * 0.3}
        Q ${cx + rx} ${cy + ry} ${cx + jw/2} ${cy + ry + cp/2}
        L ${cx - jw/2} ${cy + ry + cp/2}
        Q ${cx - rx} ${cy + ry} ${cx - rx} ${cy + ry * 0.3}
        Z
      `.replace(/\s+/g, ' ').trim();
    
    case 'heart':
      return `
        M ${cx} ${cy - ry}
        C ${cx + rx * 1.2} ${cy - ry} ${cx + rx * 1.2} ${cy} ${cx} ${cy + ry + cp}
        C ${cx - rx * 1.2} ${cy} ${cx - rx * 1.2} ${cy - ry} ${cx} ${cy - ry}
        Z
      `.replace(/\s+/g, ' ').trim();

    case 'round':
      return `
        M ${cx - rx} ${cy}
        A ${rx} ${ry} 0 1 1 ${cx + rx} ${cy}
        A ${rx} ${ry} 0 1 1 ${cx - rx} ${cy}
        Z
      `.replace(/\s+/g, ' ').trim();

    case 'oblong':
      return `
        M ${cx - rx * 0.8} ${cy - ry}
        L ${cx + rx * 0.8} ${cy - ry}
        Q ${cx + rx} ${cy} ${cx + rx * 0.8} ${cy + ry}
        L ${cx - rx * 0.8} ${cy + ry}
        Q ${cx - rx} ${cy} ${cx - rx * 0.8} ${cy - ry}
        Z
      `.replace(/\s+/g, ' ').trim();

    case 'diamond':
      return `
        M ${cx} ${cy - ry}
        L ${cx + rx * 0.7} ${cy}
        L ${cx} ${cy + ry + cp}
        L ${cx - rx * 0.7} ${cy}
        Z
      `.replace(/\s+/g, ' ').trim();

    case 'pear':
      return `
        M ${cx - rx * 0.6} ${cy - ry}
        Q ${cx - rx} ${cy - ry * 0.5} ${cx - rx * 0.8} ${cy}
        L ${cx + jw/2} ${cy + ry + cp}
        L ${cx - jw/2} ${cy + ry + cp}
        L ${cx + rx * 0.8} ${cy}
        Q ${cx + rx} ${cy - ry * 0.5} ${cx + rx * 0.6} ${cy - ry}
        Q ${cx} ${cy - ry * 1.2} ${cx - rx * 0.6} ${cy - ry}
        Z
      `.replace(/\s+/g, ' ').trim();

    case 'inverted-triangle':
      return `
        M ${cx - rx} ${cy - ry * 0.5}
        L ${cx + rx} ${cy - ry * 0.5}
        L ${cx + jw/2} ${cy + ry + cp}
        L ${cx - jw/2} ${cy + ry + cp}
        Z
      `.replace(/\s+/g, ' ').trim();

    case 'rectangular':
      return `
        M ${cx - rx} ${cy - ry * 0.4}
        L ${cx + rx} ${cy - ry * 0.4}
        L ${cx + rx} ${cy + ry * 0.3}
        Q ${cx + rx} ${cy + ry} ${cx + jw/2} ${cy + ry + cp/2}
        L ${cx - jw/2} ${cy + ry + cp/2}
        Q ${cx - rx} ${cy + ry} ${cx - rx} ${cy + ry * 0.3}
        Z
      `.replace(/\s+/g, ' ').trim();

    case 'oval':
    default:
      return `
        M ${cx - rx} ${cy - ry * 0.2}
        C ${cx - rx} ${cy - ry * 1.1} ${cx + rx} ${cy - ry * 1.1} ${cx + rx} ${cy - ry * 0.2}
        C ${cx + rx} ${cy + ry * 0.8} ${cx + jw/2} ${cy + ry + cp} ${cx} ${cy + ry + cp}
        C ${cx - jw/2} ${cy + ry + cp} ${cx - rx} ${cy + ry * 0.8} ${cx - rx} ${cy - ry * 0.2}
        Z
      `.replace(/\s+/g, ' ').trim();
  }
}

/**
 * Renders the ears for the avatar.
 */
export function renderEars(cx: number, cy: number, faceW: number, faceH: number, skin: ColorPalette): string {
  const earW = 8;
  const earH = 22;
  const earY = cy - 2;
  return `
    <ellipse cx="${cx - faceW/2 - 2}" cy="${earY}" rx="${earW}" ry="${earH/2}" fill="${skin.base}" stroke="${skin.shadow}" stroke-width="0.5"/>
    <ellipse cx="${cx + faceW/2 + 2}" cy="${earY}" rx="${earW}" ry="${earH/2}" fill="${skin.base}" stroke="${skin.shadow}" stroke-width="0.5"/>
  `.trim();
}

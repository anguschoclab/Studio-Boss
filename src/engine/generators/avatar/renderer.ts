import { AvatarFeatures } from './types';
import { getFaceShapePath, renderEars } from './geometry/faceShapes';
import { renderHairBack, renderHairFront } from './features/hairStyles';
import { renderEyes, EYE_ANIMATION_CSS } from './features/eyes';
import { renderMouth } from './features/mouth';
import { renderNose } from './features/nose';
import { renderClothing, CLOTHING_ANIMATION_CSS } from './features/clothing';
import { renderFacialHair, renderAccessories } from './features/accessories';
import { darkenColor } from './utils';

/**
 * Assembles the full SVG for the procedural avatar.
 */
export function renderAvatarSVG(f: AvatarFeatures): string {
  const cx = 100;
  const cy = 100;
  const faceW = (68 + (f.faceWidth - 1) * 40) * f.faceWidth;
  const faceH = (78 + (f.faceHeight - 1) * 36) * f.faceHeight;
  const uid = `av-${f.seed.toString(36)}`;
  
  const facePath = getFaceShapePath(f.faceShape, cx, cy, faceW, faceH, f.jawWidth, f.chinPointiness);
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">`;
  
  // ── CSS Animations ──
  svg += `<style>
    ${EYE_ANIMATION_CSS}
    ${CLOTHING_ANIMATION_CSS}
    .av-skin { transition: fill 0.3s ease; }
    .av-breathe { transform-box: fill-box; transform-origin: center bottom; }
  </style>`;

  // ── Defs (Filters & Gradients) ──
  svg += `<defs>`;
  // Skin Gradient
  svg += `<radialGradient id="${uid}-skin" cx="45%" cy="35%" r="60%">
    <stop offset="0%" stop-color="${f.skin.highlight}"/>
    <stop offset="60%" stop-color="${f.skin.base}"/>
    <stop offset="100%" stop-color="${f.skin.shadow}"/>
  </radialGradient>`;
  
  // Lighting Filter (Soft volume)
  svg += `<filter id="${uid}-glow" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
    <feOffset in="blur" dx="1" dy="1" result="offsetBlur"/>
    <feComposite in="SourceGraphic" in2="offsetBlur" operator="over"/>
  </filter>`;

  // Shadow Filter (Depth)
  svg += `<filter id="${uid}-shadow">
    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
  </filter>`;
  
  svg += `</defs>`;

  // ── Background & Canvas ──
  svg += `<circle cx="100" cy="100" r="95" fill="${darkenColor(f.skin.shadow, 0.4)}" opacity="0.1"/>`;

  // ── Layered Rendering ──
  
  // 1. Clothing (Shoulders/Neck) - includes breathing animation
  svg += renderClothing(f, cx, cy, faceW, faceH, f.skin);
  
  // 2. Ears
  svg += renderEars(cx, cy, faceW, faceH, f.skin);
  
  // 3. Hair Back
  svg += renderHairBack(f, cx, cy, faceW, faceH);
  
  // 4. Face Base
  svg += `<path d="${facePath}" fill="url(#${uid}-skin)" stroke="${f.skin.shadow}" stroke-width="0.5" filter="url(#${uid}-shadow)"/>`;
  
  // 5. Features
  svg += renderNose(f, cx, cy, faceW, faceH, f.skin);
  svg += renderMouth(f, cx, cy, faceW, faceH, f.skin);
  svg += renderEyes(f, cx, cy, faceW, faceH, f.skin);
  svg += renderFacialHair(f, cx, cy, faceW, faceH);
  
  // 6. Accessories
  svg += renderAccessories(f, cx, cy, faceW, faceH);
  
  // 7. Hair Front
  svg += renderHairFront(f, cx, cy, faceW, faceH);

  // 8. Overlays & Aging
  if (f.wrinkleOpacity > 0.1) {
    svg += renderWrinkleLines(f, cx, cy, faceW, faceH);
  }

  // Final Lighting Overlay (Rim Light)
  svg += `<ellipse cx="100" cy="80" rx="90" ry="85" stroke="white" stroke-width="0.5" opacity="0.1" pointer-events="none"/>`;

  svg += `</svg>`;
  return svg;
}

function renderWrinkleLines(f: AvatarFeatures, cx: number, cy: number, faceW: number, faceH: number): string {
  const opacity = f.wrinkleOpacity * 0.3;
  const shadow = f.skin.shadow;
  const browY = cy - faceH * 0.18;
  const eyeY = cy - faceH * 0.08;
  const mouthY = cy + faceH * 0.28;

  let lines = '';
  // Forehead
  if (f.age >= 40) {
    lines += `<path d="M ${cx - faceW/4} ${browY - 8} Q ${cx} ${browY - 10} ${cx + faceW/4} ${browY - 8}" stroke="${shadow}" stroke-width="0.5" opacity="${opacity}"/>`;
    lines += `<path d="M ${cx - faceW/5} ${browY - 14} Q ${cx} ${browY - 16} ${cx + faceW/5} ${browY - 14}" stroke="${shadow}" stroke-width="0.5" opacity="${opacity * 0.7}"/>`;
  }
  // Laugh lines
  if (f.age >= 50) {
    lines += `<path d="M ${cx - 15} ${eyeY + 15} Q ${cx - 18} ${mouthY} ${cx - 12} ${mouthY + 5}" stroke="${shadow}" stroke-width="0.8" fill="none" opacity="${opacity * 1.5}"/>`;
    lines += `<path d="M ${cx + 15} ${eyeY + 15} Q ${cx + 18} ${mouthY} ${cx + 12} ${mouthY + 5}" stroke="${shadow}" stroke-width="0.8" fill="none" opacity="${opacity * 1.5}"/>`;
  }
  return lines;
}

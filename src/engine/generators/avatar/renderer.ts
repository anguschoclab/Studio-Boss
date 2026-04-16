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

  // 9. Skin Details
  svg += renderSkinDetails(f, cx, cy, faceW, faceH);

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
  const chinY = cy + faceH * 0.48;

  let lines = '';
  // Forehead
  if (f.age >= 40) {
    lines += `<path d="M ${cx - faceW/4} ${browY - 8} Q ${cx} ${browY - 10} ${cx + faceW/4} ${browY - 8}" stroke="${shadow}" stroke-width="0.5" opacity="${opacity}"/>`;
    lines += `<path d="M ${cx - faceW/5} ${browY - 14} Q ${cx} ${browY - 16} ${cx + faceW/5} ${browY - 14}" stroke="${shadow}" stroke-width="0.5" opacity="${opacity * 0.7}"/>`;
  }
  // Crow's feet (around eyes)
  if (f.age >= 45) {
    lines += `<path d="M ${cx - faceW/3} ${eyeY} Q ${cx - faceW/3 - 5} ${eyeY - 5} ${cx - faceW/3 - 3} ${eyeY - 8}" stroke="${shadow}" stroke-width="0.4" fill="none" opacity="${opacity * 0.8}"/>`;
    lines += `<path d="M ${cx + faceW/3} ${eyeY} Q ${cx + faceW/3 + 5} ${eyeY - 5} ${cx + faceW/3 + 3} ${eyeY - 8}" stroke="${shadow}" stroke-width="0.4" fill="none" opacity="${opacity * 0.8}"/>`;
  }
  // Laugh lines
  if (f.age >= 50) {
    lines += `<path d="M ${cx - 15} ${eyeY + 15} Q ${cx - 18} ${mouthY} ${cx - 12} ${mouthY + 5}" stroke="${shadow}" stroke-width="0.8" fill="none" opacity="${opacity * 1.5}"/>`;
    lines += `<path d="M ${cx + 15} ${eyeY + 15} Q ${cx + 18} ${mouthY} ${cx + 12} ${mouthY + 5}" stroke="${shadow}" stroke-width="0.8" fill="none" opacity="${opacity * 1.5}"/>`;
  }
  // Marionette lines (mouth to chin)
  if (f.age >= 55) {
    lines += `<path d="M ${cx - 10} ${mouthY + 5} Q ${cx - 12} ${chinY} ${cx - 8} ${chinY + 3}" stroke="${shadow}" stroke-width="0.6" fill="none" opacity="${opacity * 1.2}"/>`;
    lines += `<path d="M ${cx + 10} ${mouthY + 5} Q ${cx + 12} ${chinY} ${cx + 8} ${chinY + 3}" stroke="${shadow}" stroke-width="0.6" fill="none" opacity="${opacity * 1.2}"/>`;
  }
  // Jowl rendering
  if (f.jowlAmount > 0.1) {
    const jowlOpacity = f.jowlAmount * 0.4;
    lines += `<path d="M ${cx - faceW/3} ${chinY} Q ${cx - faceW/3 + 3} ${chinY + 5} ${cx - faceW/4} ${chinY + 2}" fill="${f.skin.shadow}" opacity="${jowlOpacity}"/>`;
    lines += `<path d="M ${cx + faceW/3} ${chinY} Q ${cx + faceW/3 - 3} ${chinY + 5} ${cx + faceW/4} ${chinY + 2}" fill="${f.skin.shadow}" opacity="${jowlOpacity}"/>`;
  }
  return lines;
}

function renderSkinDetails(f: AvatarFeatures, cx: number, cy: number, faceW: number, faceH: number): string {
  let details = '';
  const mouthY = cy + faceH * 0.28;

  // Beauty mark
  if (f.hasBeautyMark) {
    details += `<circle cx="${cx + (f.beautyMarkPosition.x - 0.5) * faceW}" cy="${cy + (f.beautyMarkPosition.y - 0.5) * faceH}" r="1.2" fill="#5D4037" opacity="0.7"/>`;
  }

  // Age spots
  if (f.hasAgeSpots) {
    for (let i = 0; i < 3; i++) {
      const spotX = cx + (Math.random() - 0.5) * faceW * 0.6;
      const spotY = cy + (Math.random() - 0.3) * faceH * 0.6;
      details += `<circle cx="${spotX}" cy="${spotY}" r="${1 + Math.random() * 1.5}" fill="#8B7355" opacity="0.3"/>`;
    }
  }

  // Rosy cheeks
  if (f.hasRosyCheeks) {
    const cheekY = cy + faceH * 0.1;
    details += `<ellipse cx="${cx - faceW * 0.3}" cy="${cheekY}" rx="8" ry="5" fill="#FFB6C1" opacity="0.15"/>`;
    details += `<ellipse cx="${cx + faceW * 0.3}" cy="${cheekY}" rx="8" ry="5" fill="#FFB6C1" opacity="0.15"/>`;
  }

  // Skin texture
  if (f.skinTexture === 'pores') {
    for (let i = 0; i < 15; i++) {
      const texX = cx + (Math.random() - 0.5) * faceW * 0.8;
      const texY = cy + (Math.random() - 0.3) * faceH * 0.8;
      details += `<circle cx="${texX}" cy="${texY}" r="0.3" fill="${f.skin.shadow}" opacity="0.1"/>`;
    }
  } else if (f.skinTexture === 'rough') {
    for (let i = 0; i < 25; i++) {
      const texX = cx + (Math.random() - 0.5) * faceW * 0.8;
      const texY = cy + (Math.random() - 0.3) * faceH * 0.8;
      details += `<circle cx="${texX}" cy="${texY}" r="0.4" fill="${f.skin.shadow}" opacity="0.15"/>`;
    }
  }

  return details;
}

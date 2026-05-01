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

  // ── Composition transform ──
  // Shift the entire portrait up and scale down slightly so:
  //   • eyes land at ~40% from the top (rule-of-thirds for portraits)
  //   • the top of the head clears the frame with breathing room
  //   • shoulders/neckline are always visible at the bottom
  // This guarantees consistent framing across all avatars regardless of
  // randomized faceWidth/faceHeight.
  svg += `<g transform="translate(0, -10) scale(0.88) translate(13.6, 13.6)">`;

  // ── Layered Rendering ──
  
  // 1. Clothing (Shoulders/Neck) - includes breathing animation
  svg += renderClothing(f, cx, cy, faceW, faceH, f.skin);
  
  // 2. Ears
  svg += renderEars(cx, cy, faceW, faceH, f.skin);
  
  // 3. Hair Back
  svg += renderHairBack(f, cx, cy, faceW, faceH);
  
  // 4. Face Base
  // Subtle outer skin halo so pale-skinned talent with white/grey/blond hair
  // don't blend into the background. Rendered just behind the face so it
  // reads as a soft rim shadow rather than an outline.
  svg += `<path d="${facePath}" fill="none" stroke="${darkenColor(f.skin.shadow, 0.35)}" stroke-width="3" opacity="0.45" transform="translate(0.5, 1)"/>`;
  svg += `<path d="${facePath}" fill="url(#${uid}-skin)" stroke="${f.skin.shadow}" stroke-width="0.5" filter="url(#${uid}-shadow)"/>`;

  // 4b. Jowls (mild sagging at jawline) — ramps in 45-70
  if (f.age >= 45) {
    svg += renderJowls(f, cx, cy, faceW, faceH);
  }
  
  // 5. Features
  svg += renderNose(f, cx, cy, faceW, faceH, f.skin);
  svg += renderMouth(f, cx, cy, faceW, faceH, f.skin);
  svg += renderEyes(f, cx, cy, faceW, faceH, f.skin);
  svg += renderFacialHair(f, cx, cy, faceW, faceH);
  
  // 6. Accessories
  svg += renderAccessories(f, cx, cy, faceW, faceH);
  
  // 7. Hair Front
  svg += renderHairFront(f, cx, cy, faceW, faceH);

  // 8. Overlays & Aging — gradual wrinkles + crow's feet, ramping 45-70
  if (f.age >= 45) {
    svg += renderWrinkleLines(f, cx, cy, faceW, faceH);
  }

  // Final Lighting Overlay (Rim Light)
  svg += `<ellipse cx="100" cy="80" rx="90" ry="85" stroke="white" stroke-width="0.5" opacity="0.1" pointer-events="none"/>`;

  svg += `</g>`; // close composition transform
  svg += `</svg>`;
  return svg;
}

function renderWrinkleLines(f: AvatarFeatures, cx: number, cy: number, faceW: number, faceH: number): string {
  // Gradual ramp 45 → 70 (then plateaus). Matches the greying curve cadence.
  const t = Math.max(0, Math.min(1, (f.age - 45) / 25));
  if (t <= 0) return '';
  const shadow = f.skin.shadow;
  const browY = cy - faceH * 0.18;
  const eyeY = cy - faceH * 0.08;
  const mouthY = cy + faceH * 0.28;

  let lines = '';

  // Forehead lines — fade in from 45, deepen through 70
  const foreheadOp = 0.10 + t * 0.20;
  lines += `<path d="M ${cx - faceW/4} ${browY - 8} Q ${cx} ${browY - 10} ${cx + faceW/4} ${browY - 8}" stroke="${shadow}" stroke-width="0.5" fill="none" opacity="${foreheadOp.toFixed(2)}"/>`;
  if (t > 0.4) {
    lines += `<path d="M ${cx - faceW/5} ${browY - 14} Q ${cx} ${browY - 16} ${cx + faceW/5} ${browY - 14}" stroke="${shadow}" stroke-width="0.5" fill="none" opacity="${(foreheadOp * 0.7).toFixed(2)}"/>`;
  }

  // Crow's feet — appear early (~47), fan out from outer eye corners
  if (t > 0.08) {
    const crowOp = (0.15 + t * 0.25).toFixed(2);
    const eyeOuterL = cx - faceW * 0.32;
    const eyeOuterR = cx + faceW * 0.32;
    const ey = eyeY;
    // Left
    lines += `<path d="M ${eyeOuterL} ${ey} l -6 -3" stroke="${shadow}" stroke-width="0.5" fill="none" opacity="${crowOp}" stroke-linecap="round"/>`;
    lines += `<path d="M ${eyeOuterL} ${ey + 2} l -7 0"  stroke="${shadow}" stroke-width="0.5" fill="none" opacity="${crowOp}" stroke-linecap="round"/>`;
    lines += `<path d="M ${eyeOuterL} ${ey + 4} l -6 3"  stroke="${shadow}" stroke-width="0.5" fill="none" opacity="${crowOp}" stroke-linecap="round"/>`;
    // Right (mirror)
    lines += `<path d="M ${eyeOuterR} ${ey} l 6 -3"     stroke="${shadow}" stroke-width="0.5" fill="none" opacity="${crowOp}" stroke-linecap="round"/>`;
    lines += `<path d="M ${eyeOuterR} ${ey + 2} l 7 0"  stroke="${shadow}" stroke-width="0.5" fill="none" opacity="${crowOp}" stroke-linecap="round"/>`;
    lines += `<path d="M ${eyeOuterR} ${ey + 4} l 6 3"  stroke="${shadow}" stroke-width="0.5" fill="none" opacity="${crowOp}" stroke-linecap="round"/>`;
  }

  // Nasolabial / laugh lines — show from ~50
  if (t > 0.2) {
    const laughOp = (0.20 + t * 0.30).toFixed(2);
    lines += `<path d="M ${cx - 15} ${eyeY + 15} Q ${cx - 18} ${mouthY} ${cx - 12} ${mouthY + 5}" stroke="${shadow}" stroke-width="0.8" fill="none" opacity="${laughOp}" stroke-linecap="round"/>`;
    lines += `<path d="M ${cx + 15} ${eyeY + 15} Q ${cx + 18} ${mouthY} ${cx + 12} ${mouthY + 5}" stroke="${shadow}" stroke-width="0.8" fill="none" opacity="${laughOp}" stroke-linecap="round"/>`;
  }

  return lines;
}

/**
 * Mild jowls — soft sagging shadow at the jawline. Ramps in between
 * ages 45-70 and plateaus, mirroring the greying curve cadence.
 */
function renderJowls(f: AvatarFeatures, cx: number, cy: number, faceW: number, faceH: number): string {
  const t = Math.max(0, Math.min(1, (f.age - 45) / 25));
  if (t <= 0) return '';
  const op = (0.12 + t * 0.18).toFixed(2);
  const shadow = f.skin.shadow;
  const jawY = cy + faceH * 0.30;
  const jawX = faceW * 0.42;
  // Subtle filled crescents along the lower jaw
  let s = '';
  s += `<path d="M ${cx - jawX} ${jawY} Q ${cx - jawX * 0.6} ${jawY + 8 + t * 4} ${cx - jawX * 0.2} ${jawY + 4}" stroke="${shadow}" stroke-width="1" fill="none" opacity="${op}" stroke-linecap="round"/>`;
  s += `<path d="M ${cx + jawX} ${jawY} Q ${cx + jawX * 0.6} ${jawY + 8 + t * 4} ${cx + jawX * 0.2} ${jawY + 4}" stroke="${shadow}" stroke-width="1" fill="none" opacity="${op}" stroke-linecap="round"/>`;
  return s;
}

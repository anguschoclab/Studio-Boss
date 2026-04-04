/**
 * Generates Studio Boss PWA icons using Canvas API (Node.js built-in via canvas package,
 * or falls back to writing raw PNG bytes using a pure-JS encoder).
 *
 * Run: node scripts/generate-icons.mjs
 */

import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

const sizes = [
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32,  name: 'favicon-32x32.png' },
];

function drawIcon(canvas) {
  const size = canvas.width;
  const ctx = canvas.getContext('2d');
  const pad = size * 0.08;
  const r = size * 0.18;

  // Background gradient: deep navy → near-black
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#0a0e1a');
  bg.addColorStop(1, '#111827');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, r);
  ctx.fill();

  // Film reel circle (outer)
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.32;
  const innerR = size * 0.12;
  const spokW = size * 0.055;

  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = size * 0.04;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.stroke();

  // Spokes (6 spokes like a film reel)
  ctx.strokeStyle = '#818cf8';
  ctx.lineWidth = spokW;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * innerR * 1.1, cy + Math.sin(angle) * innerR * 1.1);
    ctx.lineTo(cx + Math.cos(angle) * outerR * 0.82, cy + Math.sin(angle) * outerR * 0.82);
    ctx.stroke();
  }

  // Center hub
  const hubGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
  hubGrad.addColorStop(0, '#818cf8');
  hubGrad.addColorStop(1, '#4f46e5');
  ctx.fillStyle = hubGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fill();

  // "SB" text in center
  ctx.fillStyle = '#fff';
  ctx.font = `900 ${Math.round(innerR * 1.1)}px -apple-system, "SF Pro Display", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SB', cx, cy + size * 0.01);

  // Top strip: "STUDIO BOSS" text
  if (size >= 192) {
    ctx.fillStyle = 'rgba(99,102,241,0.15)';
    ctx.fillRect(pad, pad, size - pad * 2, size * 0.12);

    ctx.fillStyle = '#a5b4fc';
    ctx.font = `800 ${Math.round(size * 0.065)}px -apple-system, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('STUDIO BOSS', cx, pad + size * 0.06);
  }

  // Subtle glow ring
  const glow = ctx.createRadialGradient(cx, cy, outerR * 0.9, cx, cy, outerR * 1.3);
  glow.addColorStop(0, 'rgba(99,102,241,0.15)');
  glow.addColorStop(1, 'rgba(99,102,241,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR * 1.3, 0, Math.PI * 2);
  ctx.fill();
}

let hasCanvas = false;
try {
  const { createCanvas: cc } = await import('canvas');
  hasCanvas = true;
} catch {}

if (hasCanvas) {
  const { createCanvas: cc } = await import('canvas');
  for (const { size, name } of sizes) {
    const canvas = cc(size, size);
    drawIcon(canvas);
    const buf = canvas.toBuffer('image/png');
    writeFileSync(`public/${name}`, buf);
    console.log(`✅ Generated public/${name} (${size}x${size})`);
  }
} else {
  console.log('canvas package not found — using SVG icon fallback');
  // Write an SVG that browsers can use as icon source
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0e1a"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <radialGradient id="hub" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="92" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="164" stroke="#6366f1" stroke-width="20" fill="none"/>
  <circle cx="256" cy="256" r="62" fill="url(#hub)"/>
  <g stroke="#818cf8" stroke-width="28" stroke-linecap="round">
    <line x1="256" y1="194" x2="256" y2="112"/>
    <line x1="313" y1="211" x2="380" y2="171"/>
    <line x1="313" y1="301" x2="380" y2="341"/>
    <line x1="256" y1="318" x2="256" y2="400"/>
    <line x1="199" y1="301" x2="132" y2="341"/>
    <line x1="199" y1="211" x2="132" y2="171"/>
  </g>
  <text x="256" y="270" font-family="-apple-system,Arial,sans-serif" font-weight="900" font-size="58" fill="white" text-anchor="middle">SB</text>
  <text x="256" y="82" font-family="-apple-system,Arial,sans-serif" font-weight="800" font-size="34" fill="#a5b4fc" text-anchor="middle">STUDIO BOSS</text>
</svg>`;
  writeFileSync('public/icon.svg', svg);
  console.log('✅ Generated public/icon.svg (SVG fallback)');
  // Copy SVG as all PNG names too (browsers accept SVG for many icon uses)
  for (const { name } of sizes) {
    writeFileSync(`public/${name}`, svg);
    console.log(`ℹ️  Wrote SVG data to public/${name} (PNG generation requires: bun add canvas)`);
  }
}

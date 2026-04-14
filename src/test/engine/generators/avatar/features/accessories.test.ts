import { describe, it, expect } from 'vitest';
import { renderFacialHair, renderAccessories } from '@/engine/generators/avatar/features/accessories';
import { AvatarFeatures } from '@/engine/generators/avatar/types';

describe('accessories generator', () => {
  const mockFeatures: Partial<AvatarFeatures> = {
    hasFacialHair: false,
    facialHairStyle: 'full-beard',
    facialHairColor: { primary: '#442211', secondary: '#331100' },
    hasGlasses: false,
    glassesStyle: 'round',
    eyeSpacing: 0.5,
    eyeSize: 0.5,
    hasEarrings: false,
  };

  const cx = 100;
  const cy = 100;
  const faceW = 70;
  const faceH = 80;

  describe('renderFacialHair', () => {
    it('returns empty string when hasFacialHair is false', () => {
      const svg = renderFacialHair(mockFeatures as AvatarFeatures, cx, cy, faceW, faceH);
      expect(svg).toBe('');
    });

    it('renders full-beard with correct color and opacity', () => {
      const features = { ...mockFeatures, hasFacialHair: true, facialHairStyle: 'full-beard' } as AvatarFeatures;
      const svg = renderFacialHair(features, cx, cy, faceW, faceH);
      expect(svg).toContain('<path');
      expect(svg).toContain('fill="#442211"');
      expect(svg).toContain('opacity="0.8"');
    });

    it('renders goatee with correct color and opacity', () => {
      const features = { ...mockFeatures, hasFacialHair: true, facialHairStyle: 'goatee' } as AvatarFeatures;
      const svg = renderFacialHair(features, cx, cy, faceW, faceH);
      expect(svg).toContain('<path');
      expect(svg).toContain('fill="#442211"');
      expect(svg).toContain('opacity="0.7"');
    });

    it('renders stubble with circles and correct opacity', () => {
      const features = { ...mockFeatures, hasFacialHair: true, facialHairStyle: 'stubble' } as AvatarFeatures;
      const svg = renderFacialHair(features, cx, cy, faceW, faceH);
      expect(svg).toContain('<circle');
      expect(svg).toContain('fill="#442211"');
      expect(svg).toContain('opacity="0.4"');
    });

    it('renders mustache with correct color and opacity', () => {
      const features = { ...mockFeatures, hasFacialHair: true, facialHairStyle: 'mustache' } as AvatarFeatures;
      const svg = renderFacialHair(features, cx, cy, faceW, faceH);
      expect(svg).toContain('<path');
      expect(svg).toContain('fill="#442211"');
      expect(svg).toContain('opacity="0.7"');
    });
  });

  describe('renderAccessories', () => {
    it('renders round glasses with circles', () => {
      const features = { ...mockFeatures, hasGlasses: true, glassesStyle: 'round' } as AvatarFeatures;
      const svg = renderAccessories(features, cx, cy, faceW, faceH);
      expect(svg).toContain('<circle');
      expect(svg).not.toContain('<rect');
    });

    it('renders square glasses with rects', () => {
      const features = { ...mockFeatures, hasGlasses: true, glassesStyle: 'square' } as AvatarFeatures;
      const svg = renderAccessories(features, cx, cy, faceW, faceH);
      expect(svg).toContain('<rect');
      expect(svg).not.toContain('<circle');
    });

    it('renders earrings with gold color', () => {
      const features = { ...mockFeatures, hasEarrings: true } as AvatarFeatures;
      const svg = renderAccessories(features, cx, cy, faceW, faceH);
      expect(svg).toContain('<circle');
      expect(svg).toContain('fill="#FFD700"');
    });

    it('renders both glasses and earrings', () => {
      const features = { ...mockFeatures, hasGlasses: true, glassesStyle: 'round', hasEarrings: true } as AvatarFeatures;
      const svg = renderAccessories(features, cx, cy, faceW, faceH);
      expect(svg).toContain('fill="#FFD700"'); // earrings
      expect(svg).toContain('stroke="#222222"'); // glasses frame
    });
  });
});

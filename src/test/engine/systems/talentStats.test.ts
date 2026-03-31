import { describe, it, expect } from 'vitest';
import { applyAwardBoostsToTalent } from '../../../engine/systems/talentStats';
import { TalentProfile, Award } from '../../../engine/types';

describe('applyAwardBoostsToTalent', () => {
  const baseTalent: TalentProfile = {
    id: 't1',
    name: 'Test Actor',
    roles: ['actor'],
    prestige: 50,
    fee: 1000000,
    draw: 50,
    temperament: 'Pro',
    accessLevel: 'insider'
  };

  const baseAward: Award = {
    id: 'a1',
    projectId: 'p1',
    name: 'Award',
    category: 'Best Actor',
    body: 'Academy Awards',
    status: 'won',
    year: 2024
  };

  describe('Wins', () => {
    it('calculates boosts for a prestigious major win (e.g. Academy Award Best Actor)', () => {
      const award: Award = { ...baseAward, category: 'Best Actor', body: 'Academy Awards', status: 'won' };
      const boosts = applyAwardBoostsToTalent(baseTalent, award, 1.0, true);

      expect(boosts.prestigeBoost).toBeCloseTo(63);
      expect(boosts.egoBoost).toBeCloseTo(162);
      expect(boosts.drawBoost).toBeCloseTo(27);
      expect(boosts.feeMultiplier).toBeCloseTo(11.8);
    });

    it('calculates boosts for a Cannes equivalent supporting win', () => {
      const award: Award = { ...baseAward, category: 'Best Supporting Actor', body: 'Cannes Film Festival', status: 'won' };
      const boosts = applyAwardBoostsToTalent(baseTalent, award, 1.0, false);

      expect(boosts.prestigeBoost).toBeCloseTo(49);
      expect(boosts.egoBoost).toBeCloseTo(126);
      expect(boosts.drawBoost).toBeCloseTo(21);
      expect(boosts.feeMultiplier).toBeCloseTo(9.4);
    });

    it('calculates boosts for a Sundance equivalent standard category win', () => {
      const award: Award = { ...baseAward, category: 'Best Screenplay', body: 'Sundance Film Festival', status: 'won' };
      const boosts = applyAwardBoostsToTalent(baseTalent, award, 1.0, false);

      expect(boosts.prestigeBoost).toBeCloseTo(27);
      expect(boosts.egoBoost).toBeCloseTo(108);
      expect(boosts.drawBoost).toBeCloseTo(63);
      expect(boosts.feeMultiplier).toBeCloseTo(8.2);
    });

    it('calculates boosts for a standard non-prestige win', () => {
      const award: Award = { ...baseAward, category: 'Best Original Song', body: 'Golden Globes', status: 'won' };
      const boosts = applyAwardBoostsToTalent(baseTalent, award, 1.0, false);

      expect(boosts.prestigeBoost).toBeCloseTo(10);
      expect(boosts.egoBoost).toBeCloseTo(20);
      expect(boosts.drawBoost).toBeCloseTo(8);
      expect(boosts.feeMultiplier).toBeCloseTo(2.0);
    });
  });

  describe('Nominations', () => {
    it('calculates boosts for a prestigious major nomination', () => {
      const award: Award = { ...baseAward, category: 'Best Director', body: 'Academy Awards', status: 'nominated' };
      const boosts = applyAwardBoostsToTalent(baseTalent, award, 1.0, true);

      expect(boosts.prestigeBoost).toBeCloseTo(18);
      expect(boosts.egoBoost).toBeCloseTo(72);
      expect(boosts.drawBoost).toBeCloseTo(9);
      expect(boosts.feeMultiplier).toBeCloseTo(4.6);
    });

    it('calculates boosts for a Sundance equivalent supporting nomination', () => {
      const award: Award = { ...baseAward, category: 'Best Supporting Actress', body: 'SXSW Film Festival', status: 'nominated' };
      const boosts = applyAwardBoostsToTalent(baseTalent, award, 1.0, false);

      expect(boosts.prestigeBoost).toBeCloseTo(11.2);
      expect(boosts.egoBoost).toBeCloseTo(35);
      expect(boosts.drawBoost).toBeCloseTo(16.8);
      expect(boosts.feeMultiplier).toBeCloseTo(3.1);
    });

    it('calculates boosts for a standard nomination', () => {
      const award: Award = { ...baseAward, category: 'Best Score', body: 'BAFTAs', status: 'nominated' };
      const boosts = applyAwardBoostsToTalent(baseTalent, award, 1.0, false);

      expect(boosts.prestigeBoost).toBeCloseTo(4);
      expect(boosts.egoBoost).toBeCloseTo(10);
      expect(boosts.drawBoost).toBeCloseTo(2);
      expect(boosts.feeMultiplier).toBeCloseTo(1.3);
    });
  });

  describe('Multiplier parameter', () => {
    it('applies the external multiplier parameter correctly', () => {
      const award: Award = { ...baseAward, category: 'Best Director', body: 'Academy Awards', status: 'won' };
      const boosts = applyAwardBoostsToTalent(baseTalent, award, 0.5, true);

      expect(boosts.prestigeBoost).toBeCloseTo(31.5);
      expect(boosts.egoBoost).toBeCloseTo(81);
      expect(boosts.drawBoost).toBeCloseTo(13.5);
      expect(boosts.feeMultiplier).toBeCloseTo(6.4);
    });
  });
});

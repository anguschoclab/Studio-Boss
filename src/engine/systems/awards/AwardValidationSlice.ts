import { AwardBody, AwardCategory } from '@/engine/types';
import { CANNES_EQUIVALENTS, SUNDANCE_EQUIVALENTS } from '../../data/awards.data';

export function isCannesEquivalentFestival(body: AwardBody | string): boolean {
  return CANNES_EQUIVALENTS.includes(body as AwardBody);
}

export function isSundanceEquivalentFestival(body: AwardBody | string): boolean {
  return SUNDANCE_EQUIVALENTS.includes(body as AwardBody);
}

export function isMajorCategoryNomination(category: AwardCategory | string): boolean {
  const majorCategories = [
    'Best Picture', 'Best Series', 'Best Drama Series', 'Best Comedy Series', 'Best Limited Series',
    'Best Director', 'Best Actor', 'Best Actress', 'Best Actor (Drama)', 'Best Actress (Drama)', 
    'Best Actor (Comedy)', 'Best Actress (Comedy)',
    'Palme d\'Or', 'Golden Lion', 'Golden Bear', 'Grand Jury Prize'
  ];
  return majorCategories.includes(category as string);
}

export function isSupportingCategoryNomination(category: AwardCategory | string): boolean {
  return ['Best Supporting Actor', 'Best Supporting Actress', 'Best Supporting Actor (TV)', 'Best Supporting Actress (TV)'].includes(category as string);
}

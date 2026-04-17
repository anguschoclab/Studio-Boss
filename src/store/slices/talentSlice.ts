import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import {
  createTalentContractSlice,
  TalentContractSlice
} from './talentContractSlice';
import {
  createTalentMarketplaceSlice,
  TalentMarketplaceSlice
} from './talentMarketplaceSlice';
import {
  createTalentStatsSlice,
  TalentStatsSlice
} from './talentStatsSlice';

export type TalentSlice = TalentContractSlice & TalentMarketplaceSlice & TalentStatsSlice;

export const createTalentSlice: StateCreator<GameStore, [], [], TalentSlice> = (...args) => ({
  ...createTalentContractSlice(...args),
  ...createTalentMarketplaceSlice(...args),
  ...createTalentStatsSlice(...args)
});

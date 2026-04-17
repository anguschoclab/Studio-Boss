import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import {
  createProjectCreationSlice,
  ProjectCreationSlice
} from './projectCreationSlice';
import {
  createProjectWorkflowSlice,
  ProjectWorkflowSlice
} from './projectWorkflowSlice';
import {
  createProjectIPSlice,
  ProjectIPSlice
} from './projectIPSlice';
import {
  createProjectEventsSlice,
  ProjectEventsSlice
} from './projectEventsSlice';
import {
  createProjectUtilsSlice,
  ProjectUtilsSlice
} from './projectUtilsSlice';

export type ProjectSlice = ProjectCreationSlice & ProjectWorkflowSlice & ProjectIPSlice & ProjectEventsSlice & ProjectUtilsSlice;

export const createProjectSlice: StateCreator<GameStore, [], [], ProjectSlice> = (...args) => ({
  ...createProjectCreationSlice(...args),
  ...createProjectWorkflowSlice(...args),
  ...createProjectIPSlice(...args),
  ...createProjectEventsSlice(...args),
  ...createProjectUtilsSlice(...args)
});

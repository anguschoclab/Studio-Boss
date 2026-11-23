import { StateCreator } from "zustand";
import { GameStore } from "../gameStore";
import { Bookmark } from "@/engine/types";

export interface BookmarkSlice {
  toggleBookmark: (id: string, type: "project" | "talent") => void;
  isBookmarked: (id: string, type: "project" | "talent") => boolean;
  getBookmarkedProjects: () => string[];
  getBookmarkedTalent: () => string[];
}

export const createBookmarkSlice: StateCreator<GameStore, [], [], BookmarkSlice> = (set, get) => ({
  toggleBookmark: (id, type) => {
    set((s) => {
      if (!s.gameState) return s;
      const bookmarks = s.gameState.studio.bookmarks || [];
      const existingIndex = bookmarks.findIndex((b) => b.id === id && b.type === type);
      let nextBookmarks: Bookmark[];
      if (existingIndex >= 0) {
        nextBookmarks = bookmarks.filter((_, i) => i !== existingIndex);
      } else {
        nextBookmarks = [...bookmarks, { id, type, createdAtWeek: s.gameState.week }];
      }
      return {
        gameState: {
          ...s.gameState,
          studio: {
            ...s.gameState.studio,
            bookmarks: nextBookmarks,
          },
        },
      };
    });
  },

  isBookmarked: (id, type) => {
    const state = get().gameState;
    if (!state) return false;
    return (state.studio.bookmarks || []).some((b) => b.id === id && b.type === type);
  },

  getBookmarkedProjects: () => {
    const state = get().gameState;
    if (!state) return [];
    const bookmarks = state.studio.bookmarks || [];
    const ids: string[] = [];
    // ⚡ Bolt Optimization: Replaced chained .filter().map() with single-pass loop
    for (let i = 0; i < bookmarks.length; i++) {
      if (bookmarks[i].type === "project") ids.push(bookmarks[i].id);
    }
    return ids;
  },

  getBookmarkedTalent: () => {
    const state = get().gameState;
    if (!state) return [];
    const bookmarks = state.studio.bookmarks || [];
    const ids: string[] = [];
    // ⚡ Bolt Optimization: Replaced chained .filter().map() with single-pass loop
    for (let i = 0; i < bookmarks.length; i++) {
      if (bookmarks[i].type === "talent") ids.push(bookmarks[i].id);
    }
    return ids;
  },
});

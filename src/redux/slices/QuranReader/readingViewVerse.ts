import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export type ReadingViewVerseState = {
  hoveredVerseKey: string | null;
  selectedVerseKey: string | null;
  // FORK: hide-ayah — ayah currently revealed by holding Alt (transient, never persisted)
  keyboardRevealedVerseKey: string | null;
};

export const initialState: ReadingViewVerseState = {
  hoveredVerseKey: null,
  selectedVerseKey: null,
  keyboardRevealedVerseKey: null,
};

/**
 * This slice keep track of the current hovered and selected verses in the reading mode.
 *
 */
const readingViewVerse = createSlice({
  name: SliceName.READING_VIEW_HOVERED_VERSE,
  initialState,
  reducers: {
    setReadingViewHoveredVerseKey: (state, { payload }: PayloadAction<string | null>) => {
      return {
        ...state,
        hoveredVerseKey: payload,
      };
    },
    setReadingViewSelectedVerseKey: (state, { payload }: PayloadAction<string | null>) => {
      return {
        ...state,
        selectedVerseKey: payload,
      };
    },
    // FORK: hide-ayah — pin/clear the Alt-keyboard-revealed ayah
    setKeyboardRevealedVerseKey: (state, { payload }: PayloadAction<string | null>) => {
      return {
        ...state,
        keyboardRevealedVerseKey: payload,
      };
    },
    clearAllHighlights: () => {
      return {
        hoveredVerseKey: null,
        selectedVerseKey: null,
        keyboardRevealedVerseKey: null,
      };
    },
  },
});

export const selectReadingViewHoveredVerseKey = (state: RootState) =>
  state.readingViewVerse.hoveredVerseKey;

export const selectReadingViewSelectedVerseKey = (state: RootState) =>
  state.readingViewVerse.selectedVerseKey;

// FORK: hide-ayah
export const selectKeyboardRevealedVerseKey = (state: RootState) =>
  state.readingViewVerse.keyboardRevealedVerseKey;

export const {
  setReadingViewHoveredVerseKey,
  setReadingViewSelectedVerseKey,
  clearAllHighlights,
  setKeyboardRevealedVerseKey, // FORK: hide-ayah
} = readingViewVerse.actions;
export default readingViewVerse.reducer;

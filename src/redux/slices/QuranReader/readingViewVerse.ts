import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export type ReadingViewVerseState = {
  hoveredVerseKey: string | null;
  selectedVerseKey: string | null;
  // FORK: hide-ayah — line currently revealed by mouse hover ("Page{page}-Line{line}" key)
  hideAyahHoveredLineKey: string | null;
  // FORK: hide-ayah — anchor line revealed by holding a modifier while playing/paused (transient).
  // The anchor line plus its neighbors (same page, ±1) are revealed by consumers.
  keyboardRevealedLineKey: string | null;
  // FORK: hide-ayah — mushaf page revealed by holding a modifier when nothing has played (transient)
  keyboardRevealedPageNumber: number | null;
};

export const initialState: ReadingViewVerseState = {
  hoveredVerseKey: null,
  selectedVerseKey: null,
  hideAyahHoveredLineKey: null,
  keyboardRevealedLineKey: null,
  keyboardRevealedPageNumber: null,
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
    // FORK: hide-ayah — set/clear the hover-revealed line
    setHideAyahHoveredLineKey: (state, { payload }: PayloadAction<string | null>) => {
      return {
        ...state,
        hideAyahHoveredLineKey: payload,
      };
    },
    // FORK: hide-ayah — pin/clear the modifier-revealed anchor line (playing/paused states)
    setKeyboardRevealedLineKey: (state, { payload }: PayloadAction<string | null>) => {
      return {
        ...state,
        keyboardRevealedLineKey: payload,
        keyboardRevealedPageNumber: null,
      };
    },
    // FORK: hide-ayah — pin/clear the modifier-revealed page (never-played state)
    setKeyboardRevealedPageNumber: (state, { payload }: PayloadAction<number | null>) => {
      return {
        ...state,
        keyboardRevealedPageNumber: payload,
        keyboardRevealedLineKey: null,
      };
    },
    clearAllHighlights: () => {
      return {
        ...initialState,
      };
    },
  },
});

export const selectReadingViewHoveredVerseKey = (state: RootState) =>
  state.readingViewVerse.hoveredVerseKey;

export const selectReadingViewSelectedVerseKey = (state: RootState) =>
  state.readingViewVerse.selectedVerseKey;

// FORK: hide-ayah
export const selectHideAyahHoveredLineKey = (state: RootState) =>
  state.readingViewVerse.hideAyahHoveredLineKey;

// FORK: hide-ayah
export const selectKeyboardRevealedLineKey = (state: RootState) =>
  state.readingViewVerse.keyboardRevealedLineKey;

// FORK: hide-ayah
export const selectKeyboardRevealedPageNumber = (state: RootState) =>
  state.readingViewVerse.keyboardRevealedPageNumber;

export const {
  setReadingViewHoveredVerseKey,
  setReadingViewSelectedVerseKey,
  clearAllHighlights,
  setHideAyahHoveredLineKey, // FORK: hide-ayah
  setKeyboardRevealedLineKey, // FORK: hide-ayah
  setKeyboardRevealedPageNumber, // FORK: hide-ayah
} = readingViewVerse.actions;
export default readingViewVerse.reducer;

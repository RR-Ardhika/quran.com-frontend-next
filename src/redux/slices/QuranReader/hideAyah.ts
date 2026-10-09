import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export type HideAyahState = {
  isHideAyahEnabled: boolean;
  /**
   * FORK: harder memorization mode — also blur the inline word-by-word translation/
   * transliteration so the wbw line can't be used as a cue. Only meaningful while
   * `isHideAyahEnabled` is on.
   */
  isHideWbwEnabled: boolean;
};

const initialState: HideAyahState = {
  isHideAyahEnabled: false,
  isHideWbwEnabled: false,
};

// FORK: hide-ayah memorization mode. When enabled, Arabic glyph words in
// Reading (mushaf) view are blurred; word-by-word translation stays visible
// as a cue. Hovering/tapping a word reveals its whole ayah.
export const hideAyahSlice = createSlice({
  name: SliceName.HIDE_AYAH,
  initialState,
  reducers: {
    setIsHideAyahEnabled: (state: HideAyahState, action: PayloadAction<boolean>) => ({
      ...state,
      isHideAyahEnabled: action.payload,
      // FORK: wbw blur is a sub-mode of hide-ayah; turning hide-ayah off resets it so we
      // never leave a stale "on" that does nothing.
      isHideWbwEnabled: action.payload ? state.isHideWbwEnabled : false,
    }),
    toggleIsHideAyahEnabled: (state: HideAyahState) => ({
      ...state,
      isHideAyahEnabled: !state.isHideAyahEnabled,
      isHideWbwEnabled: !state.isHideAyahEnabled ? state.isHideWbwEnabled : false,
    }),
    // FORK: harder mode — blur word-by-word as well
    setIsHideWbwEnabled: (state: HideAyahState, action: PayloadAction<boolean>) => ({
      ...state,
      isHideWbwEnabled: action.payload,
    }),
  },
});

export const { setIsHideAyahEnabled, toggleIsHideAyahEnabled, setIsHideWbwEnabled } =
  hideAyahSlice.actions;

export const selectIsHideAyahEnabled = (state: RootState) => state.hideAyah.isHideAyahEnabled;

export const selectIsHideWbwEnabled = (state: RootState) => state.hideAyah.isHideWbwEnabled;

export default hideAyahSlice.reducer;

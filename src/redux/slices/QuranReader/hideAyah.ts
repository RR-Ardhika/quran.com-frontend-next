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
  /**
   * FORK: hide-ayah blur strength in px — the text-shadow radius of the obscured glyph
   * (and wbw, in harder mode). 10 is the original hard-coded value.
   */
  blurStrength: number;
};

export const HIDE_AYAH_BLUR_MIN = 4;
export const HIDE_AYAH_BLUR_MAX = 24;
export const HIDE_AYAH_BLUR_DEFAULT = 10;

const initialState: HideAyahState = {
  isHideAyahEnabled: false,
  isHideWbwEnabled: false,
  blurStrength: HIDE_AYAH_BLUR_DEFAULT,
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
    // FORK: blur strength — clamped so a persisted/foreign value can't break the range
    setBlurStrength: (state: HideAyahState, action: PayloadAction<number>) => ({
      ...state,
      blurStrength: Math.min(
        HIDE_AYAH_BLUR_MAX,
        Math.max(HIDE_AYAH_BLUR_MIN, Math.round(action.payload)),
      ),
    }),
  },
});

export const {
  setIsHideAyahEnabled,
  toggleIsHideAyahEnabled,
  setIsHideWbwEnabled,
  setBlurStrength,
} = hideAyahSlice.actions;

export const selectIsHideAyahEnabled = (state: RootState) => state.hideAyah.isHideAyahEnabled;

export const selectIsHideWbwEnabled = (state: RootState) => state.hideAyah.isHideWbwEnabled;

// FORK: fall back to the default so state persisted before this existed still renders
export const selectHideAyahBlurStrength = (state: RootState) =>
  state.hideAyah.blurStrength ?? HIDE_AYAH_BLUR_DEFAULT;

export default hideAyahSlice.reducer;

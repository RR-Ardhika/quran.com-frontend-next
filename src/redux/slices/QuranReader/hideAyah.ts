import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/redux/RootState';
import SliceName from '@/redux/types/SliceName';

export type HideAyahState = {
  isHideAyahEnabled: boolean;
};

const initialState: HideAyahState = {
  isHideAyahEnabled: false,
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
    }),
    toggleIsHideAyahEnabled: (state: HideAyahState) => ({
      ...state,
      isHideAyahEnabled: !state.isHideAyahEnabled,
    }),
  },
});

export const { setIsHideAyahEnabled, toggleIsHideAyahEnabled } = hideAyahSlice.actions;

export const selectIsHideAyahEnabled = (state: RootState) => state.hideAyah.isHideAyahEnabled;

export default hideAyahSlice.reducer;

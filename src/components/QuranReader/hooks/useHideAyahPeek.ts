// FORK: hide-ayah — shared peek-reveal logic (used by the keyboard peek and the
// touch peek button in the audio player).
//
// Peek resolves its target once when invoked and pins it until cleared:
//   - recitation playing/paused → the audio player's current (= last-played) ayah
//   - recitation never started   → the whole mushaf page at the top of the viewport
import { useCallback, useContext } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import { useDispatch } from 'react-redux';

import {
  setKeyboardRevealedPageNumber,
  setKeyboardRevealedVerseKey,
} from '@/redux/slices/QuranReader/readingViewVerse';
import { makeVerseKey } from '@/utils/verse';
import { selectIsAudioPlayerVisible } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

// Lines intersecting the viewport above this offset are considered hidden behind the navbar.
const NAVBAR_OFFSET_PX = 80;

/**
 * Find the topmost Reading-view line intersecting the viewport (below the navbar).
 *
 * @returns {HTMLElement | null} the line element, or null when no line is in view
 */
const getTopmostVisibleLine = (): HTMLElement | null => {
  const lines = document.querySelectorAll<HTMLElement>('[data-verse-key]');
  for (let i = 0; i < lines.length; i += 1) {
    const rect = lines[i].getBoundingClientRect();
    if (rect.bottom > NAVBAR_OFFSET_PX && rect.top < window.innerHeight) {
      return lines[i];
    }
  }
  return null;
};

/**
 * Peek reveal for hide-ayah mode: `peek` pins a reveal target, `clear` removes it.
 *
 * @returns {{ peek: () => void, clear: () => void }} peek controls
 */
const useHideAyahPeek = (): { peek: () => void; clear: () => void } => {
  const dispatch = useDispatch();
  const audioService = useContext(AudioPlayerMachineContext);
  const isAudioPlayerVisible = useXstateSelector(audioService, selectIsAudioPlayerVisible);

  const peek = useCallback(() => {
    const snapshot = audioService.getSnapshot();
    const { surah, ayahNumber } = snapshot.context;
    if (isAudioPlayerVisible && surah && ayahNumber) {
      // Playing/paused: pin the current (= last-played) ayah.
      dispatch(setKeyboardRevealedVerseKey(makeVerseKey(String(surah), ayahNumber)));
      return;
    }
    // Never played: reveal the whole page at the top of the viewport.
    const topLine = getTopmostVisibleLine();
    if (topLine?.dataset.page) {
      dispatch(setKeyboardRevealedPageNumber(Number(topLine.dataset.page)));
    }
  }, [dispatch, audioService, isAudioPlayerVisible]);

  const clear = useCallback(() => {
    dispatch(setKeyboardRevealedVerseKey(null));
    dispatch(setKeyboardRevealedPageNumber(null));
  }, [dispatch]);

  return { peek, clear };
};

export default useHideAyahPeek;

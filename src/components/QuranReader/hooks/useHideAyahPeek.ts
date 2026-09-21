// FORK: hide-ayah — shared peek-reveal logic (used by the keyboard peek and the
// touch peek button in the audio player).
//
// Peek resolves its target once when invoked and pins it until cleared:
//   - recitation playing/paused → the line containing the currently-playing word,
//     plus its neighbor lines (same page, ±1) revealed by consumers
//   - recitation never started   → the whole mushaf page at the top of the viewport
import { useCallback, useContext } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import { useDispatch } from 'react-redux';

import {
  setKeyboardRevealedPageNumber,
  setKeyboardRevealedLineKey,
} from '@/redux/slices/QuranReader/readingViewVerse';
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
 * Resolve the Reading-view line element containing the currently-playing word.
 * Word spans carry `data-word-location="surah:ayah:position"` (QuranWord) and live
 * inside the line container, which carries `data-verse-key` and `id={lineKey}`.
 *
 * @returns {HTMLElement | null} the line element, or null when the word is not rendered
 */
const getPlayingWordLine = (
  surah: number,
  ayahNumber: number,
  wordPosition: number,
): HTMLElement | null => {
  const wordEl = document.querySelector<HTMLElement>(
    `[data-word-location="${surah}:${ayahNumber}:${wordPosition}"]`,
  );
  return wordEl?.closest<HTMLElement>('[data-verse-key]') ?? null;
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
    const { surah, ayahNumber, wordLocation } = snapshot.context;
    if (isAudioPlayerVisible && surah && ayahNumber) {
      // Playing/paused: pin the line containing the currently-playing word.
      // Consumers reveal that line plus its neighbors (same page, ±1).
      // wordLocation can be unset/0 between verses or before the first word
      // event, and the word span may be unrendered (its page virtualized out)
      // — fall back to the ayah's first word, then to a whole-page reveal.
      const tryWord = (wordPosition: number) => {
        const lineEl = getPlayingWordLine(surah, ayahNumber, wordPosition);
        if (lineEl?.id) {
          dispatch(setKeyboardRevealedLineKey(lineEl.id));
          return true;
        }
        return false;
      };
      const wordPosition = Number(wordLocation);
      if (wordPosition && tryWord(wordPosition)) return;
      if (tryWord(1)) return;
    }
    // Never played (or playing word not rendered): reveal the whole page at the
    // top of the viewport.
    const topLine = getTopmostVisibleLine();
    if (topLine?.dataset.page) {
      dispatch(setKeyboardRevealedPageNumber(Number(topLine.dataset.page)));
    }
  }, [dispatch, audioService, isAudioPlayerVisible]);

  const clear = useCallback(() => {
    dispatch(setKeyboardRevealedLineKey(null));
    dispatch(setKeyboardRevealedPageNumber(null));
  }, [dispatch]);

  return { peek, clear };
};

export default useHideAyahPeek;

// FORK: hide-ayah — hold-to-peek keyboard reveal.
//
// Holding Alt / Ctrl / Shift / Meta (Windows/Command) reveals content without the mouse
//   - recitation playing/paused → the audio player's current (= last-played) ayah
//   - recitation never started   → the whole mushaf page at the top of the viewport
// The target is resolved once at keydown and pinned while held, so it never
// chases the reciter. A window blur while a key is held clears the reveal so it
// can never get stuck.
import { useCallback, useContext, useEffect } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import { useDispatch, useSelector } from 'react-redux';

import { selectIsHideAyahEnabled } from '@/redux/slices/QuranReader/hideAyah';
import {
  setKeyboardRevealedPageNumber,
  setKeyboardRevealedVerseKey,
} from '@/redux/slices/QuranReader/readingViewVerse';
import { makeVerseKey } from '@/utils/verse';
import { selectIsAudioPlayerVisible } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

// Lines intersecting the viewport above this offset are considered hidden behind the navbar.
const NAVBAR_OFFSET_PX = 80;

// FORK: modifier keys that trigger the peek reveal (Alt, Ctrl, Shift, Windows/Command).
const REVEAL_KEYS = new Set(['Alt', 'Control', 'Shift', 'Meta']);

const isTypingTarget = (el: Element | null): boolean => {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || (el as HTMLElement).isContentEditable;
};

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
 * Hold-modifier-to-reveal for hide-ayah mode. Mount once in ReadingView.
 */
const useHideAyahKeyboardReveal = (): void => {
  const dispatch = useDispatch();
  const isHideAyahEnabled = useSelector(selectIsHideAyahEnabled);
  const audioService = useContext(AudioPlayerMachineContext);
  const isAudioPlayerVisible = useXstateSelector(audioService, selectIsAudioPlayerVisible);

  const revealTarget = useCallback(() => {
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

  useEffect(() => {
    if (!isHideAyahEnabled) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!REVEAL_KEYS.has(event.key) || event.repeat || isTypingTarget(document.activeElement))
        return;
      event.preventDefault();
      revealTarget();
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (REVEAL_KEYS.has(event.key)) clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clear);
      clear();
    };
  }, [isHideAyahEnabled, revealTarget, clear]);
};

export default useHideAyahKeyboardReveal;

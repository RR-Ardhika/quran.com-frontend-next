// FORK: hide-ayah — hold-to-peek keyboard reveal.
//
// Holding Alt reveals exactly one ayah (release re-hides it), mirroring mouse
// hover for keyboard-only reading:
//   - recitation playing/paused → the audio player's current (= last-played) ayah
//   - recitation never started   → the topmost visible ayah in the viewport
// The target is resolved once at keydown and pinned while held, so it never
// chases the reciter. A window blur while Alt is held clears the reveal so it
// can never get stuck.
import { useContext, useEffect } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import { useDispatch, useSelector } from 'react-redux';

import { selectIsHideAyahEnabled } from '@/redux/slices/QuranReader/hideAyah';
import { setKeyboardRevealedVerseKey } from '@/redux/slices/QuranReader/readingViewVerse';
import { makeVerseKey } from '@/utils/verse';
import { selectIsAudioPlayerVisible } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

// Lines intersecting the viewport above this offset are considered hidden behind the navbar.
const NAVBAR_OFFSET_PX = 80;

const isTypingTarget = (el: Element | null): boolean => {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || (el as HTMLElement).isContentEditable;
};

/**
 * Find the topmost Reading-view line intersecting the viewport (below the
 * navbar) and return the verse key of its first word.
 *
 * @returns {string | null} verse key, or null when no line is in view
 */
const getTopmostVisibleVerseKey = (): string | null => {
  const lines = document.querySelectorAll<HTMLElement>('[data-verse-key]');
  for (let i = 0; i < lines.length; i += 1) {
    const rect = lines[i].getBoundingClientRect();
    if (rect.bottom > NAVBAR_OFFSET_PX && rect.top < window.innerHeight) {
      return lines[i].dataset.verseKey;
    }
  }
  return null;
};

/**
 * Hold-Alt-to-reveal for hide-ayah mode. Mount once in ReadingView.
 */
const useHideAyahKeyboardReveal = (): void => {
  const dispatch = useDispatch();
  const isHideAyahEnabled = useSelector(selectIsHideAyahEnabled);
  const audioService = useContext(AudioPlayerMachineContext);
  const isAudioPlayerVisible = useXstateSelector(audioService, selectIsAudioPlayerVisible);

  useEffect(() => {
    if (!isHideAyahEnabled) return undefined;

    const resolveTargetVerseKey = (): string | null => {
      if (isAudioPlayerVisible) {
        const { surah, ayahNumber } = audioService.getSnapshot().context;
        if (surah && ayahNumber) return makeVerseKey(String(surah), ayahNumber);
      }
      return getTopmostVisibleVerseKey();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Alt' || event.repeat || isTypingTarget(document.activeElement)) return;
      event.preventDefault();
      dispatch(setKeyboardRevealedVerseKey(resolveTargetVerseKey()));
    };
    const clear = () => dispatch(setKeyboardRevealedVerseKey(null));
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Alt') clear();
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
  }, [dispatch, isHideAyahEnabled, isAudioPlayerVisible, audioService]);
};

export default useHideAyahKeyboardReveal;

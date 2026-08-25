// FORK: hide-ayah — hold-to-peek keyboard reveal.
//
// Holding Alt / Ctrl / Shift / Meta (Windows/Command) reveals content without the mouse
// (see useHideAyahPeek for how the target is resolved). The target is pinned while held,
// so it never chases the reciter. A window blur while a key is held clears the reveal so
// it can never get stuck.
import { useEffect } from 'react';

import { useSelector } from 'react-redux';

import useHideAyahPeek from './useHideAyahPeek';

import { selectIsHideAyahEnabled } from '@/redux/slices/QuranReader/hideAyah';

// FORK: modifier keys that trigger the peek reveal (Alt, Ctrl, Shift, Windows/Command).
const REVEAL_KEYS = new Set(['Alt', 'Control', 'Shift', 'Meta']);

const isTypingTarget = (el: Element | null): boolean => {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || (el as HTMLElement).isContentEditable;
};

/**
 * Hold-modifier-to-reveal for hide-ayah mode. Mount once in ReadingView.
 */
const useHideAyahKeyboardReveal = (): void => {
  const isHideAyahEnabled = useSelector(selectIsHideAyahEnabled);
  const { peek, clear } = useHideAyahPeek();

  useEffect(() => {
    if (!isHideAyahEnabled) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!REVEAL_KEYS.has(event.key) || event.repeat || isTypingTarget(document.activeElement)) {
        return;
      }
      event.preventDefault();
      peek();
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
  }, [isHideAyahEnabled, peek, clear]);
};

export default useHideAyahKeyboardReveal;

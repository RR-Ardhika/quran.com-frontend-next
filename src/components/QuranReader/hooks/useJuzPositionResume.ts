// FORK: hide-ayah (QUR-006) — juz-mode position resume.
//
// On a juz page mount, if the persisted last-read verse belongs to the juz being
// viewed, instantly scroll it into view (block: center). The value is read
// directly from the redux-persist localStorage entry instead of the store because
// the reader's intersection observer dispatches setLastReadVerse for the top-most
// verses right after mount, racing (and clobbering) the persisted value in the
// store; localStorage is not affected by that race.
//
// When the last-read verse is in another juz (or unset), the page opens at the
// top as usual — no cross-juz jumping.
import { useEffect } from 'react';

import { getJuzNumberByHizb } from '@/utils/juz';

// How long to keep looking for the target verse line before giving up
// (pages load lazily; fonts shift layout). ~10s.
const MAX_ATTEMPTS = 40;
const ATTEMPT_INTERVAL_MS = 250;

type PersistedLastReadVerse = {
  verseKey: string;
  hizb: string;
};

/**
 * Read the persisted last-read verse straight from the redux-persist
 * localStorage entry (`persist:root`; slice values are JSON-encoded strings).
 *
 * @returns {PersistedLastReadVerse | null} the persisted verse, or null
 */
const getPersistedLastReadVerse = (): PersistedLastReadVerse | null => {
  try {
    const root = JSON.parse(localStorage.getItem('persist:root'));
    const tracker = root?.readingTracker ? JSON.parse(root.readingTracker) : null;
    const lastReadVerse = tracker?.lastReadVerse;
    if (lastReadVerse?.verseKey && lastReadVerse?.hizb) {
      return { verseKey: lastReadVerse.verseKey, hizb: lastReadVerse.hizb };
    }
  } catch (error) {
    // corrupted/missing storage — fall through to null
  }
  return null;
};

/**
 * Restore the juz scroll position on mount. No-op when not resumable.
 *
 * @param {string} juzId the juz currently being viewed
 */
const useJuzPositionResume = (juzId: string): void => {
  useEffect(() => {
    const lastReadVerse = getPersistedLastReadVerse();
    if (!lastReadVerse) return undefined;

    // Only restore when the last-read verse belongs to the juz being viewed.
    if (getJuzNumberByHizb(Number(lastReadVerse.hizb)) !== Number(juzId)) {
      return undefined;
    }

    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      const lineEl = document.querySelector<HTMLElement>(
        `[data-verse-key="${lastReadVerse.verseKey}"]`,
      );
      if (lineEl) {
        clearInterval(timer);
        // instant jump, verse centered (behavior defaults to 'auto' = instant)
        lineEl.scrollIntoView({ block: 'center' });
      } else if (attempts >= MAX_ATTEMPTS) {
        clearInterval(timer);
      }
    }, ATTEMPT_INTERVAL_MS);

    return () => {
      clearInterval(timer);
    };
  }, [juzId]);
};

export default useJuzPositionResume;

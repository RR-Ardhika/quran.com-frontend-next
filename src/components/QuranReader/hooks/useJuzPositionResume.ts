// FORK: hide-ayah (QUR-006) — juz-mode position resume.
//
// On a juz page mount, if the persisted last-read verse belongs to the juz being
// viewed, scroll it into view by driving the reader's virtualized scroll
// machinery (scrollToVerseTarget) directly — Virtuoso can jump to any page
// depth, even lazily-unloaded ones, unlike DOM polling.
//
// The value is read directly from the redux-persist localStorage entry instead
// of the store because the reader's intersection observer dispatches
// setLastReadVerse for the top-most verses right after mount, racing (and
// clobbering) the persisted value in the store; localStorage is not affected by
// that race.
//
// When the last-read verse is in another juz (or unset), the page opens at the
// top as usual — no cross-juz jumping.
import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import { shallowEqual, useSelector } from 'react-redux';
import { VirtuosoHandle } from 'react-virtuoso';

import scrollToVerseTarget from '../ReadingView/hooks/scrollToVerseTarget';
import useFetchVersePageNumber from '../ReadingView/hooks/useFetchVersePageNumber';

import { selectNavbar } from '@/redux/slices/navbar';
import { selectPinnedVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import { MushafLines, QuranFont, QuranReaderDataType } from '@/types/QuranReader';
import { getJuzNumberByHizb } from '@/utils/juz';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import { VersesResponse } from 'types/ApiResponses';
import LookupRecord from 'types/LookupRecord';
import Verse from 'types/Verse';

// How long to keep trying before giving up (lookup/fonts may still be loading). ~10s.
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
 * Restore the juz scroll position on mount. No-op when not a juz page or not
 * resumable.
 *
 * @param {QuranReaderDataType} quranReaderDataType
 * @param {number | string} resourceId the juz id when on a juz page
 * @param {React.MutableRefObject<VirtuosoHandle>} virtuosoRef
 * @param {Record<number, LookupRecord>} pagesVersesRange
 * @param {Verse[]} verses
 * @param {VersesResponse} initialData
 * @param {boolean} isUsingDefaultFont
 * @param {QuranFont} quranFont
 * @param {MushafLines} mushafLines
 */
const useJuzPositionResume = (
  quranReaderDataType: QuranReaderDataType,
  resourceId: number | string,
  virtuosoRef: React.MutableRefObject<VirtuosoHandle>,
  pagesVersesRange: Record<number, LookupRecord>,
  verses: Verse[],
  initialData: VersesResponse,
  isUsingDefaultFont: boolean,
  quranFont: QuranFont,
  mushafLines: MushafLines,
): void => {
  const router = useRouter();
  const isJuz = quranReaderDataType === QuranReaderDataType.Juz;

  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  const pinnedVerses = useSelector(selectPinnedVerses);
  const hasPinnedVerses = pinnedVerses.length > 0;
  const hasPinnedVersesRef = useRef(hasPinnedVerses);
  hasPinnedVersesRef.current = hasPinnedVerses;
  const isNavbarVisibleRef = useRef(isNavbarVisible);
  isNavbarVisibleRef.current = isNavbarVisible;

  const fetchVersePageNumber = useFetchVersePageNumber(quranFont, mushafLines);

  useEffect(() => {
    if (!isJuz) return undefined;

    // The browser's native scroll restoration (fires after load with the
    // previous scroll position) fights our programmatic jump — opt out while
    // we manage the position ourselves.
    window.history.scrollRestoration = 'manual';

    if (!isJuz) return undefined;

    // startingVerse is a chapter-page feature; a stale value left in the URL
    // (e.g. after a reload) would scroll the juz page to the wrong verse — strip it.
    if (router.query.startingVerse) {
      const restQuery = { ...router.query };
      delete restQuery.startingVerse;
      router.replace({ pathname: router.pathname, query: restQuery }, undefined, {
        shallow: true,
      });
    }

    const lastReadVerse = getPersistedLastReadVerse();
    // FORK DEBUG (QUR-006)
    // eslint-disable-next-line no-console
    console.log('[QUR-006 RESUME] mount juz', resourceId, 'persisted:', lastReadVerse);
    if (!lastReadVerse) return undefined;

    // Only restore when the last-read verse belongs to the juz being viewed.
    const lastReadJuz = getJuzNumberByHizb(Number(lastReadVerse.hizb));
    if (lastReadJuz !== Number(resourceId)) {
      // eslint-disable-next-line no-console
      console.log('[QUR-006 RESUME] different juz — skipping');
      return undefined;
    }

    const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(lastReadVerse.verseKey);

    // Resolve the page locally from the juz's page lookup (all pages of the juz
    // are there), so we don't wait on the API fallback. Cross-chapter pages are
    // handled by the range comparison.
    const resolvePageLocally = (): number | undefined => {
      const targetChapter = Number(chapterId);
      const targetVerse = Number(verseNumber);
      const entry = Object.entries(pagesVersesRange).find((pageEntry) => {
        const [fromCh, fromVerse] = pageEntry[1].from.split(':').map(Number);
        const [toCh, toVerse] = pageEntry[1].to.split(':').map(Number);
        const afterFrom =
          targetChapter > fromCh || (targetChapter === fromCh && targetVerse >= fromVerse);
        const beforeTo = targetChapter < toCh || (targetChapter === toCh && targetVerse <= toVerse);
        return afterFrom && beforeTo;
      });
      return entry ? Number(entry[0]) : undefined;
    };
    const localPage = resolvePageLocally();
    // FORK DEBUG (QUR-006)
    // eslint-disable-next-line no-console
    console.log('[QUR-006 RESUME] local page for', lastReadVerse.verseKey, ':', localPage);
    // Wrap the fetcher: prefer the locally-resolved page, fall back to the API.
    const fetchPage = (chapterIdArg: string, verseNumberArg: number) =>
      localPage
        ? Promise.resolve({ verses: [{ pageNumber: localPage }] })
        : fetchVersePageNumber(chapterIdArg, verseNumberArg);
    const target = {
      chapterId,
      verseNumber: Number(verseNumber),
      verseKey: lastReadVerse.verseKey,
      isChapterNumericFormat: false,
    };
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (attempts > MAX_ATTEMPTS) {
        clearInterval(timer);
        return;
      }
      scrollToVerseTarget({
        target,
        virtuosoRef,
        pagesVersesRange,
        verses,
        isUsingDefaultFont,
        initialDataFirstPage: initialData.verses[0]?.pageNumber,
        hasPinnedVerses: hasPinnedVersesRef.current,
        isNavbarVisible: isNavbarVisibleRef.current,
        fetchVersePageNumber: fetchPage,
      }).then((didScroll) => {
        // FORK DEBUG (QUR-006)
        // eslint-disable-next-line no-console
        console.log(`[QUR-006 RESUME] attempt ${attempts} → didScroll:`, didScroll);
        if (didScroll) {
          clearInterval(timer);
          // Virtuoso jumps by index using estimated item heights before the list
          // has measured real ones, so the first jump lands short of the target.
          // Re-scroll once the list settles to correct the accumulated offset.
          const correct = (delay: number) =>
            setTimeout(() => {
              scrollToVerseTarget({
                target,
                virtuosoRef,
                pagesVersesRange,
                verses,
                isUsingDefaultFont,
                initialDataFirstPage: initialData.verses[0]?.pageNumber,
                hasPinnedVerses: hasPinnedVersesRef.current,
                isNavbarVisible: isNavbarVisibleRef.current,
                fetchVersePageNumber: fetchPage,
              });
            }, delay);
          correct(500);
          correct(1500);
        }
      });
    }, ATTEMPT_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      window.history.scrollRestoration = 'auto';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJuz, resourceId]);
};

export default useJuzPositionResume;

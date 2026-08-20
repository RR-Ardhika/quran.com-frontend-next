/* eslint-disable max-lines */ // FORK: hide-ayah — delegation handlers pushed the file past the upstream cap
import { memo, RefObject, useCallback, useContext, useRef } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import classNames from 'classnames';
import { shallowEqual, useSelector, useDispatch, useStore } from 'react-redux';

import { QURAN_READER_OBSERVER_ID } from '../observer';
import { verseFontChanged } from '../utils/memoization';

import styles from './Line.module.scss';

import ChapterHeader from '@/components/chapters/ChapterHeader';
import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import VerseText from '@/components/Verse/VerseText';
import { DATA_ATTRIBUTE_WORD_LOCATION } from '@/dls/QuranWord/QuranWord';
import useNavbarAutoHide from '@/hooks/useNavbarAutoHide';
import useIntersectionObserver from '@/hooks/useObserveElement';
import useScroll, { SMOOTH_SCROLL_TO_CENTER } from '@/hooks/useScrollToElement';
import { RootState } from '@/redux/RootState';
import { selectEnableAutoScrolling } from '@/redux/slices/AudioPlayer/state';
// FORK: hide-ayah — line-level delegated hover
import { selectIsHideAyahEnabled } from '@/redux/slices/QuranReader/hideAyah';
import { selectInlineDisplayWordByWordPreferences } from '@/redux/slices/QuranReader/readingPreferences';
import {
  selectReadingViewHoveredVerseKey,
  setReadingViewHoveredVerseKey,
} from '@/redux/slices/QuranReader/readingViewVerse';
import { selectStudyModeIsOpen } from '@/redux/slices/QuranReader/studyMode';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { getWordDataByLocation } from '@/utils/verse';
import { selectIsAudioPlayerVisible } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import Word from 'types/Word';

export type LineProps = {
  words: Word[];
  lineKey: string;
  isBigTextLayout: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  quranReaderStyles: QuranReaderStyles;
  pageIndex: number;
  lineIndex: number;
  // eslint-disable-next-line react/no-unused-prop-types
  bookmarksRangeUrl: string | null;
  pageHeaderChapterId?: string;
};

const Line = ({
  lineKey,
  words,
  isBigTextLayout,
  pageIndex,
  lineIndex,
  pageHeaderChapterId,
}: LineProps) => {
  const audioService = useContext(AudioPlayerMachineContext);
  const isHighlighted = useXstateSelector(audioService, (state) => {
    // Don't highlight when audio player is closed
    if (!selectIsAudioPlayerVisible(state)) return false;

    const { surah, ayahNumber } = state.context;
    const verseKeys = words.map((word) => word.verseKey);
    return verseKeys.includes(`${surah}:${ayahNumber}`);
  });

  const [scrollToSelectedItem, selectedItemRef]: [() => void, RefObject<HTMLDivElement>] =
    useScroll(SMOOTH_SCROLL_TO_CENTER);

  // Register with intersection observer for page tracking
  const observerRef = useRef<HTMLDivElement | null>(null);
  useIntersectionObserver(observerRef, QURAN_READER_OBSERVER_ID);

  // Merge refs for both auto-scroll and observer
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Update both refs
      if (selectedItemRef) {
        (selectedItemRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
      observerRef.current = node;
    },
    [selectedItemRef],
  );
  const { isActive } = useOnboarding();
  const isStudyModeOpen = useSelector(selectStudyModeIsOpen);
  const enableAutoScrolling =
    useSelector(selectEnableAutoScrolling, shallowEqual) && !isActive && !isStudyModeOpen;
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectInlineDisplayWordByWordPreferences,
    shallowEqual,
  );

  // Use the custom hook for navbar auto-hide functionality
  useNavbarAutoHide(isHighlighted && enableAutoScrolling, scrollToSelectedItem, [
    enableAutoScrolling,
    isHighlighted,
    scrollToSelectedItem,
  ]);
  const firstWordData = getWordDataByLocation(words[0].location);
  const shouldShowChapterHeader = firstWordData[1] === '1' && firstWordData[2] === '1';
  const isWordByWordLayout = showWordByWordTranslation || showWordByWordTransliteration;

  // Get data from first word for page tracking
  const firstWord = words[0];
  const { verseKey, pageNumber, hizbNumber } = firstWord;
  const chapterId = firstWordData[0];

  // FORK: hide-ayah — delegated hover. mouseover bubbles up from any word (or its wbw
  // text); the pointer sitting in gaps between words fires nothing, so the revealed ayah
  // stays revealed anywhere inside the line. Only leaving the whole line clears it.
  // store.getState() avoids re-rendering every Line on each hover change.
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const isHideAyahEnabled = useSelector(selectIsHideAyahEnabled);
  const onLineMouseOver = useCallback(
    (event: React.MouseEvent) => {
      if (!isHideAyahEnabled) return;
      const wordElement = (event.target as Element).closest?.(`[${DATA_ATTRIBUTE_WORD_LOCATION}]`);
      if (!wordElement) return;
      const wordLocation = wordElement.getAttribute(DATA_ATTRIBUTE_WORD_LOCATION);
      const [chapter, verse] = getWordDataByLocation(wordLocation);
      const hoveredVerseKey = `${chapter}:${verse}`;
      if (selectReadingViewHoveredVerseKey(store.getState()) !== hoveredVerseKey) {
        dispatch(setReadingViewHoveredVerseKey(hoveredVerseKey));
      }
    },
    [dispatch, store, isHideAyahEnabled],
  );
  const onLineMouseLeave = useCallback(() => {
    if (isHideAyahEnabled) dispatch(setReadingViewHoveredVerseKey(null));
  }, [dispatch, isHideAyahEnabled]);

  return (
    <div
      ref={mergedRef}
      id={lineKey}
      data-verse-key={verseKey}
      data-page={pageNumber}
      data-chapter-id={chapterId}
      data-hizb={hizbNumber}
      className={classNames(styles.container, {
        [styles.highlighted]: isHighlighted,
        [styles.mobileInline]: isBigTextLayout,
      })}
    >
      {shouldShowChapterHeader && chapterId !== pageHeaderChapterId && (
        <ChapterHeader chapterId={firstWordData[0]} isTranslationView={false} />
      )}
      <div
        // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events -- FORK: hide-ayah hover reveal; keyboard equivalent is the Alt-hold peek
        onMouseOver={onLineMouseOver} // FORK: hide-ayah
        onMouseLeave={onLineMouseLeave} // FORK: hide-ayah
        className={classNames(styles.line, {
          [styles.mobileInline]: isBigTextLayout,
          [styles.fixedWidth]: !isWordByWordLayout,
        })}
      >
        <VerseText
          words={words}
          isReadingMode
          isHighlighted={isHighlighted}
          shouldShowH1ForSEO={pageIndex === 0 && lineIndex === 0}
        />
      </div>
    </div>
  );
};

/**
 * Since we are passing words and it's an array
 * even if the same words are passed, their reference will change
 * on fetching a new page and since Memo only does shallow comparison,
 * we need to use custom comparing logic:
 *
 *  1. Check if the line keys are the same.
 *  2. Check if isBigTextLayout values are the same.
 *  3. Check if bookmarksRangeUrl values are the same.
 *  4. Check if pageHeaderChapterId values are the same.
 *  5. Check if the font changed.
 *
 * If the above conditions are met, it's safe to assume that the result
 * of both renders are the same.
 *
 * @param {LineProps} prevProps
 * @param {LineProps} nextProps
 * @returns {boolean}
 */
const areLinesEqual = (prevProps: LineProps, nextProps: LineProps): boolean =>
  prevProps.lineKey === nextProps.lineKey &&
  prevProps.isBigTextLayout === nextProps.isBigTextLayout &&
  prevProps.bookmarksRangeUrl === nextProps.bookmarksRangeUrl &&
  prevProps.pageHeaderChapterId === nextProps.pageHeaderChapterId &&
  !verseFontChanged(
    prevProps.quranReaderStyles,
    nextProps.quranReaderStyles,
    prevProps.words,
    nextProps.words,
  );

export default memo(Line, areLinesEqual);

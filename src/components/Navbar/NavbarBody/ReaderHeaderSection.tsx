/* eslint-disable react/no-multi-comp */
// FORK: QUR-005 — merged always-visible header.
// These components absorb the reader pieces of the old QuranReader/ContextMenu
// so they can live inside the Navbar (the single merged header):
// - ReaderHeaderMiddle: chapter nav, page info, reading-mode toggle (main row)
// - ReaderHeaderSubRows: mobile reading tabs, progress bar, pinned verses, tajweed bar
import React from 'react';

import { useSelector } from 'react-redux';

import styles from './ReaderHeaderSection.module.scss';

import ChapterNavigation from '@/components/QuranReader/ContextMenu/components/ChapterNavigation';
import MobileReadingTabs from '@/components/QuranReader/ContextMenu/components/MobileReadingTabs';
import PageInfo from '@/components/QuranReader/ContextMenu/components/PageInfo';
import ProgressBar from '@/components/QuranReader/ContextMenu/components/ProgressBar';
import useContextMenuState from '@/components/QuranReader/ContextMenu/hooks/useContextMenuState';
import contextMenuStyles from '@/components/QuranReader/ContextMenu/styles/ContextMenu.module.scss';
import PinnedVersesBar from '@/components/QuranReader/PinnedVersesBar';
import ReadingModeToggle from '@/components/QuranReader/ReadingPreferenceSwitcher/ReadingModeToggle';
import TajweedColors from '@/components/QuranReader/TajweedBar/TajweedBar';
import useIsMobile from '@/hooks/useIsMobile';
import { SwitcherContext } from '@/hooks/useReadingPreferenceSwitcher';
import { selectShowTajweedRules } from '@/redux/slices/QuranReader/styles';
import { Mushaf } from '@/types/QuranReader';
import { getChapterNumberFromKey } from '@/utils/verse';

/**
 * Middle section of the merged header (reader pages only).
 * Renders null when there is no reader context (mirrors the old ContextMenu guard).
 *
 * @returns {JSX.Element|null} The reader middle section or null outside reader context.
 */
export const ReaderHeaderMiddle: React.FC = () => {
  const {
    isSidebarNavigationVisible,
    chapterData,
    verseKey,
    juzNumber,
    localizedHizb,
    pageNumber,
    handleSidebarToggle,
    t,
  } = useContextMenuState();

  if (!verseKey || !chapterData) {
    return null;
  }

  return (
    <div className={styles.middleContainer} data-testid="reader-header-middle">
      <div className={contextMenuStyles.section}>
        <div className={contextMenuStyles.row}>
          <ChapterNavigation
            chapterName={chapterData.transliteratedName}
            isSidebarNavigationVisible={isSidebarNavigationVisible}
            onToggleSidebar={handleSidebarToggle}
            chapterNumber={getChapterNumberFromKey(verseKey)}
          />
        </div>
      </div>

      <div className={`${contextMenuStyles.section} ${contextMenuStyles.pageInfoSectionDesktop}`}>
        <div className={contextMenuStyles.row}>
          <PageInfo
            juzNumber={juzNumber}
            hizbNumber={localizedHizb}
            pageNumber={pageNumber}
            containerClassName={contextMenuStyles.pageInfoCustomContainer}
            t={t}
          />
        </div>
      </div>

      <div className={`${contextMenuStyles.section} ${contextMenuStyles.readingPreferenceSection}`}>
        <div className={contextMenuStyles.readingPreferenceContainer}>
          <ReadingModeToggle context={SwitcherContext.ContextMenu} />
        </div>
      </div>
    </div>
  );
};

/**
 * Extra rows below the main header row (reader pages only):
 * mobile reading tabs, desktop progress bar, pinned verses bar, tajweed colors bar.
 *
 * @returns {JSX.Element|null} The sub-rows or null outside reader context.
 */
export const ReaderHeaderSubRows: React.FC = () => {
  const { chapterData, verseKey, progress, mushaf, isTranslationMode, t } = useContextMenuState();
  const isMobileView = useIsMobile();
  const showTajweedRules = useSelector(selectShowTajweedRules);

  if (!verseKey || !chapterData) {
    return null;
  }

  return (
    <>
      {/* Mobile-only (hidden on desktop via its own stylesheet) */}
      <MobileReadingTabs t={t} />
      {/* Desktop-only progress bar on its own row */}
      {!isMobileView && <ProgressBar progress={progress} />}
      <PinnedVersesBar />
      {mushaf === Mushaf.QCFTajweedV4 && !isTranslationMode && showTajweedRules && (
        <TajweedColors />
      )}
    </>
  );
};

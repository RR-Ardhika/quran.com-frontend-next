import DEFAULT_SETTINGS, { DefaultSettings } from '../defaultSettings';

import Language from '@/types/Language';
import { QuranFont } from '@/types/QuranReader';

// FORK: QUR-005 — base defaults now use Indonesian wbw + translation 134 (King Fahad Quran
// Complex), so the id-locale wbw/translation overrides were removed. Keep font + language picks.

export default {
  ...DEFAULT_SETTINGS,
  readingPreferences: {
    ...DEFAULT_SETTINGS.readingPreferences,
    selectedReflectionLanguages: [Language.ID],
    selectedLessonLanguages: [Language.ID],
  },
  quranReaderStyles: {
    ...DEFAULT_SETTINGS.quranReaderStyles,
    quranFont: QuranFont.IndoPak,
  },
} as DefaultSettings;

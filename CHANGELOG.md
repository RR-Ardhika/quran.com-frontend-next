# Changelog

## [0.4.0] - 2026-09-18

### Added

- **Audio: duration-left countdown** — the slider row's right side now shows a live countdown of the time left (`-m:ss`, in the `remainingTime` slot next to the actions group); the total moved into the left time group, which now reads `elapsed / total` (`AudioPlayer/AudioPlayerSlider.tsx`).
- **Versioning & changelog** — the fork gets its own version (started at `0.4.0`, was upstream's `1.0.0`), this `CHANGELOG.md`, and a muted `v{version}` label next to the logo in the navbar (`Navbar/NavbarBody/`).
- **Hide-ayah: line-level modifier peek** — while a recitation is playing/paused, holding Alt/Ctrl/Shift/Meta now reveals the line containing the currently-playing word plus one neighbor line above and below (clamped to the same mushaf page), instead of the whole ayah. The never-played case is unchanged (whole-page reveal). `keyboardRevealedVerseKey` in `readingViewVerse` is replaced by `keyboardRevealedLineKey` (`Page{n}-Line{n}`); anchor resolution lives in `useHideAyahPeek` via the playing word's `data-word-location`.
- **Hide-ayah: peek fallback chain** — Alt-peek during playback no longer reveals nothing when the playing word's exact span is unavailable: it falls back to word 1 of the playing ayah (covers unset `wordLocation` during verse transitions and virtualized-out pages), then to the whole-page reveal used by the never-played case (`useHideAyahPeek.ts`).
- **Juz position resume** — reloading a juz page (`/juz/N`) scrolls to the persisted last-read verse when it belongs to that juz; otherwise the page opens at the top. The last-read verse is read directly from the redux-persist localStorage entry (avoids the mount-time intersection-observer race), the page number is resolved locally from the juz's page lookup, and the jump drives the reader's virtualized scroll (`scrollToVerseTarget`) directly with retry + post-settle corrective re-scrolls — Virtuoso's first by-index jump lands short of deep pages because item heights are still estimates. Browser scroll restoration is disabled on juz pages so it cannot undo the jump; stale `startingVerse` params are stripped. Hook: `src/components/QuranReader/hooks/useJuzPositionResume.ts`, wired in `ReadingView/index.tsx`.

### Fixed

- **Navbar/banner sizing** — `--navbar-container-height` no longer adds banner height (banners were removed earlier but the CSS still reserved 45–54px for them), fixing the phantom gap between the navbar and the sidebar navigation / reader content. The sidebar's stale offset and top padding are removed (`SidebarNavigation.module.scss`), and the Navbar `emptySpacePlaceholder` div is deleted.

### Changed

- **ESLint: function line-length limit off** — `react-func/max-lines-per-function` disabled globally (`.eslintrc.json`).

### Removed

- **Banner system** — the `banner` and `fundraisingBanner` redux slices, their persist wiring, the `bannerActive`/`desktopStandaloneBannerActive` classes, and the dead components using them (`components/Banner`, `components/Fundraising`, `components/DonatePopup`, `HomePageMessage`, `HomePageWelcomeMessage`) are deleted.

## [0.3.0] - 2026-08-25

### Added

- **Audio player actions regrouped** — all player buttons now form one group in the slider row, before the remaining time: `⋯ overflow | volume | prev | next | play | 👁 peek` (`AudioPlayer/AudioPlayerActionsGroup/`). The old centered `PlaybackControls` row and the standalone close button are deleted; close-player moved into the overflow menu (bottom, keeps the `audio-close-player` test id). The group is a single component so a position setting (left/middle/right) can be added later.
- **Hide-ayah: touch peek button** — hold-to-peek eye button in the audio player slider (before the remaining time) for touch devices that have no hover; press-and-hold reveals (current ayah while reciting, else the topmost visible page), release re-hides. Only shown when hide-ayah is on. Shared peek logic lives in `src/components/QuranReader/hooks/useHideAyahPeek.ts`.
- **Merged always-visible header** — the Navbar and the reader ContextMenu are merged into a single static header hosted by the Navbar: logo | sidebar toggle + chapter nav | page info | reading-mode toggle | settings | profile | language | search | sidebar nav | menu, with the reading progress bar (desktop) and mobile reading tabs on their own rows. All scroll-based show/hide was removed (`GlobalScrollListener`, `useDebounceNavbarVisibility` usage, `MobileStickyItemsBar`, the floating reading-preference switcher, navbar auto-hide during auto-scroll). Reader pieces live in `src/components/Navbar/NavbarBody/ReaderHeaderSection.tsx`; the old `QuranReader/ContextMenu/index.tsx` was deleted (its subcomponents are reused).
- **New reader defaults (fresh installs only — no persist migration)** — Arabic font scale 5 (was 3), translation font scale 1 (was 3), wbw font scale 5 (was 3); default translation = King Fahad Quran Complex, Indonesian (id 134, was 131 Clear Quran); wbw locale Indonesian (was English); wbw display = inline below-word translation only (was hover tooltip); word click = no audio (was play audio); mushaf = 15 lines (was 16).

### Removed

- **Reading-view page navigation buttons** — the floating prev/next page buttons (`ReadingView/PageNavigationButtons`) are deleted, component included.
- **ChapterHeader event promo** — the `ChapterEvent` promo card (and its `useChapterEvent` hook) shown at the top of a chapter page is deleted.
- **Fundraising/donate UI** — the top Banner, the homepage + reader fundraising banners, and the donate CTA in the NavigationDrawer are gone.

## [0.2.0] - 2026-08-21

### Added

- **Hide-ayah: line-level hover reveal** — hovering reveals the hovered mushaf line's blurred words and stays revealed anywhere in the line (`ReadingView/Line.tsx` delegated hover), so resting in gaps between words no longer re-blurs.
- **Hide-ayah: hold-Alt keyboard peek** — holding Alt in Reading view reveals content without the mouse: the currently-reciting ayah while playing, the last-played ayah when paused, or the whole current page when nothing has played; releasing re-hides (see `src/components/QuranReader/hooks/useHideAyahKeyboardReveal.ts`).
- **Hide-ayah: peek keybinds widened** — hold-to-peek now works with Alt, Ctrl, Shift, or the Windows/Command (Meta) key, not just Alt.

## [0.1.1] - 2026-08-17

### Added

- **Configurable audio CDN base URL** — audio URLs (word-by-word mp3s and chapter recitations) can be rewritten through a custom base via `NEXT_PUBLIC_AUDIO_BASE_URL` (see `src/utils/audioGateway.ts`); defaults to the official CDNs when unset.
- **Gateway URL fallback list** — `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_AUDIO_BASE_URL` accept a comma-separated list of candidate gateways; the first reachable one (probed via `<base>/healthz`) wins and is cached in `localStorage`, so the same build works on the dev machine (`localhost`) and LAN devices (tablet/phone). See `src/utils/gatewayResolver.ts`.

## [0.1.0] - 2026-08-17

### Added

- **Hide-ayah memorization mode** — opt-in toggle in the SettingsDrawer blurs Arabic glyph words in Reading (mushaf) view (word-by-word translation stays visible); hovering/tapping a word reveals its whole ayah. Persisted via redux-persist.
- **Public API bypass** — the signed API proxy is bypassed; all data calls go directly to the public `api.qurancdn.com` API. Base URL is configurable via `NEXT_PUBLIC_API_BASE_URL`.
- **Default reciter** — Sa'ud ash-Shuraym (id 10) instead of Mishari Rashid al-Afasy.
- **Dev server port** — `next dev` runs on port 6236 by default.

### Fixed

- **Hydration fix** — persisted audio-player context (reciter, volume, playback speed) is applied post-mount instead of at machine creation, fixing hydration errors on reload with a non-default reciter.

### Changed

- **Tooling** — husky pre-commit hooks removed; GitHub Actions workflows disabled (renamed to `.bak`, re-enable with `git mv`); `FUNDING.yml` kept pointing to the Quran Foundation.

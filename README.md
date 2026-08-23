<!--
*** Thanks for checking out this Quran.com repo. If you have a suggestion that would
*** make this better, please fork the repo and create a pull request or simply open
***  an issue with the tag "enhancement".
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://quran.com">
    <img src="public/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h1 align="center">The Noble Quran</h1>

  <p align="center">
    The official source code repository for Quran.com
    <br />
    <a href="https://discord.gg/SpEeJ5bWEQ"><strong>Join Quran.com community »</strong></a>
    <br />
    <br />
    <a href="https://quran.com">Visit Quran.com</a>
    ·
    <a href="https://github.com/quran/quran.com-frontend-next/issues">Report Bug</a>
    ·
    <a href="https://github.com/quran/quran.com-frontend-next/issues">Request Feature</a>
    •
    <a href="https://quran.github.io/quran.com-frontend-next/storybook/master">Storybook</a>
  </p>
</p>

<!-- PROJECT SHIELDS -->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Issues][issues-shield]][issues-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]

This project is the frontend for Quran.com. It is built on top of [Next.js](https://nextjs.org/docs/getting-started), a popular framework that takes the trouble and setup of setting up an isomorphic react app. We deploy it on now.sh automatically with automatic generation of builds for PRs.

### About This Fork

This is a personal fork of [`quran/quran.com-frontend-next`](https://github.com/quran/quran.com-frontend-next) for personal, non-commercial use.

- **Code**: upstream declares MIT (`package.json` + license badge), though the repo ships no LICENSE file. Modifications in this fork are marked with `// FORK:` comments and are MIT-licensed by the fork author.
- **Content & data**: Quran text, translations, tafsir, and audio fetched via quran.com APIs are governed by the [quran.com Terms](https://quran.com/terms-and-conditions) — **personal, non-commercial use only**. Do not host a public instance of this fork.
- **Fonts**: the mushaf fonts under `public/fonts` are from the King Fahd Glorious Quran Printing Complex and carry their own license; they are excluded from this fork. Restore them from upstream for local development.

Not affiliated with or endorsed by Quran.com / the Quran Foundation.

<!-- Add new fork changes to the top of this list as they land. -->
### Changes in This Fork

- **Reading-view page navigation buttons removed (QUR-005)** — the floating prev/next page buttons (`ReadingView/PageNavigationButtons`) are deleted, component included.
- **ChapterHeader event promo removed (QUR-005)** — the `ChapterEvent` promo card (and its `useChapterEvent` hook) shown at the top of a chapter page is deleted.

- **Merged always-visible header (QUR-005)** — the Navbar and the reader ContextMenu are merged into a single static header hosted by the Navbar: logo | sidebar toggle + chapter nav | page info | reading-mode toggle | settings | profile | language | search | sidebar nav | menu, with the reading progress bar (desktop) and mobile reading tabs on their own rows. All scroll-based show/hide was removed (`GlobalScrollListener`, `useDebounceNavbarVisibility` usage, `MobileStickyItemsBar`, the floating reading-preference switcher, navbar auto-hide during auto-scroll). Reader pieces live in `src/components/Navbar/NavbarBody/ReaderHeaderSection.tsx`; the old `QuranReader/ContextMenu/index.tsx` was deleted (its subcomponents are reused).
- **Fundraising/donate UI removed (QUR-005)** — the top Banner, the homepage + reader fundraising banners, and the donate CTA in the NavigationDrawer are gone.
- **New reader defaults (QUR-005, fresh installs only — no persist migration)** — Arabic font scale 5 (was 3), translation font scale 1 (was 3), wbw font scale 5 (was 3); default translation = King Fahad Quran Complex, Indonesian (id 134, was 131 Clear Quran); wbw locale Indonesian (was English); wbw display = inline below-word translation only (was hover tooltip); word click = no audio (was play audio); mushaf = 15 lines (was 16).
- **Gateway URL fallback list** — `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_AUDIO_BASE_URL` accept a comma-separated list of candidate gateways; the first reachable one (probed via `<base>/healthz`) wins and is cached in `localStorage`, so the same build works on the dev machine (`localhost`) and LAN devices (tablet/phone). See `src/utils/gatewayResolver.ts`.
- **Hide-ayah: peek keybinds widened** — hold-to-peek now works with Alt, Ctrl, Shift, or the Windows/Command (Meta) key, not just Alt (`src/components/QuranReader/hooks/useHideAyahKeyboardReveal.ts`).
- **Hide-ayah memorization mode** — opt-in toggle in the SettingsDrawer blurs Arabic glyph words in Reading (mushaf) view (word-by-word translation stays visible); hovering/tapping a word reveals its whole ayah. Persisted via redux-persist.
- **Hide-ayah: hold-Alt keyboard peek** — holding Alt in Reading view reveals content without the mouse: the currently-reciting ayah while playing, the last-played ayah when paused, or the whole current page when nothing has played; releasing re-hides (see `src/components/QuranReader/hooks/useHideAyahKeyboardReveal.ts`).
- **Hide-ayah: line-level hover reveal** — hovering reveals the hovered mushaf line's blurred words and stays revealed anywhere in the line (`ReadingView/Line.tsx` delegated hover), so resting in gaps between words no longer re-blurs.
- **Configurable audio CDN base URL** — audio URLs (word-by-word mp3s and chapter recitations) can be rewritten through a custom base via `NEXT_PUBLIC_AUDIO_BASE_URL` (see `src/utils/audioGateway.ts`); defaults to the official CDNs when unset.
- **Public API bypass** — the signed API proxy is bypassed; all data calls go directly to the public `api.qurancdn.com` API. Base URL is configurable via `NEXT_PUBLIC_API_BASE_URL`.
- **Hydration fix** — persisted audio-player context (reciter, volume, playback speed) is applied post-mount instead of at machine creation, fixing hydration errors on reload with a non-default reciter.
- **Default reciter** — Sa'ud ash-Shuraym (id 10) instead of Mishari Rashid al-Afasy.
- **Tooling** — husky pre-commit hooks removed; GitHub Actions workflows disabled (renamed to `.bak`, re-enable with `git mv`); `FUNDING.yml` kept pointing to the Quran Foundation.
- **Dev server port** — `next dev` runs on port 6236 by default.

### How to Contribute

We trust that you will not copy this idea/project, this is at the end for the sake of Allah and we all have good intentions while working with this project. But we must stress that copying the code/project is unacceptable.

### Running the App Locally

- Ensure you have the latest `nodejs` and `npm` installed. Prefer 10+
- Ensure you have `yarn` installed. Simply `npm i -g yarn`
- Clone this repo
- Run `yarn` on the repo to install `node_modules`
- Run `yarn dev` to start the app. If you wish to run on a different port, run `yarn dev -p 8000`
- Open `localhost:3000` in your browser

The app runs on Next.js and will automatically hot reload when you make changes.

### Environment Variables

Rename the `env.example` file to `env.local`.

### DLS (Design Language System)

One mistake we made previously is treated each component as unique. This made our work not scalable. Secondly, when looking at large companies, they often develop a design style language that can be used across the app without the need to create unique components and ensure better consistency across the product. We are trying to take a similar approach. If something can be used elsewhere, please put it inside the `dls/` directory and create stories for it.

### Storybook.js

Our components are built within Storybook.js. See files with name `.stories.tsx`. This helps engineers view their work outside of the product, making it super easy to test different configurations of the component.

[We also display all our components here](https://quran.github.io/quran.com-frontend-next/storybook/master).

### Recommended Extensions

Check `.vscode/extensions.json` for recommended VSCode Extensions

### TypeScript

We chose TypeScript as the language of choice of it's ease of type-safety. Please create types where you see fit.

### Helping Out and Issues

If you are interested to help out, please look at issues on the GitHub repo. This is a good place to start.

### Filing Bugs

Thank you for taking time to file a bug! We'd appreciate your help on fixing it 🙏. Please [open an issue](https://github.com/quran/quran.com-frontend-next/issues).

### Community

<a href="https://discord.gg/SpEeJ5bWEQ"><strong>Join Quran.com Discord community »</strong></a>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/quran/quran.com-frontend-next?style=for-the-badge
[contributors-url]: https://github.com/quran/quran.com-frontend-next/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/quran/quran.com-frontend-next?style=for-the-badge
[forks-url]: https://github.com/quran/quran.com-frontend-next/network/members
[stars-shield]: https://img.shields.io/github/stars/quran/quran.com-frontend-next?style=for-the-badge
[stars-url]: https://github.com/quran/quran.com-frontend-next/stargazers
[issues-shield]: https://img.shields.io/github/issues/quran/quran.com-frontend-next?style=for-the-badge
[issues-url]: https://github.com/quran/quran.com-frontend-next/issues
[license-shield]: https://img.shields.io/github/license/quran/quran.com-frontend-next?style=for-the-badge
[license-url]: https://github.com/quran/quran.com-frontend-next/blob/master/LICENSE.txt
[product-screenshot]: images/screenshot.png

### Credits

- Localization was made possible by the help of [Lokalise](https://lokalise.com/) which is a computer-aided translation system that focuses on productivity and quality assurance and provides a seamless localization workflow.

<p align="center">
  <img src="https://user-images.githubusercontent.com/15169499/139687128-15ed6189-6be2-44bf-9173-75cce317d546.png" width="400">
</p>

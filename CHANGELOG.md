# Changelog

## [2.6.1](https://github.com/alvaroaxsmith/portfolio/compare/v2.6.0...v2.6.1) (2026-11-19)


### Bug Fixes

* **about-me:** keep the journey diagram on screen while it is redrawn ([#176](https://github.com/alvaroaxsmith/portfolio/issues/176)) ([48b5184](https://github.com/alvaroaxsmith/portfolio/commit/48b5184259c9006b764af2cbb7c5b72682e72bb6))
* **home:** fall back to a copy of the photo served by the site ([#182](https://github.com/alvaroaxsmith/portfolio/issues/182)) ([777ec20](https://github.com/alvaroaxsmith/portfolio/commit/777ec20fe05e2b8e581b685fe50fe0878398bd5a))
* **skeleton:** keep the photo and certificate shimmer in step with the page ([#180](https://github.com/alvaroaxsmith/portfolio/issues/180)) ([e713bc8](https://github.com/alvaroaxsmith/portfolio/commit/e713bc814cf536619b0afb55ee8440876d43ce39))

## [2.6.0](https://github.com/alvaroaxsmith/portfolio/compare/v2.5.5...v2.6.0) (2026-11-19)


### Features

* **skeleton:** loading placeholders that read as loading, shaped like the content ([#145](https://github.com/alvaroaxsmith/portfolio/issues/145)) ([7ab997c](https://github.com/alvaroaxsmith/portfolio/commit/7ab997c380b720287d9bc3316a747875d848ddcb))


### Bug Fixes

* **about-me:** let touch scroll the career cards natively ([#163](https://github.com/alvaroaxsmith/portfolio/issues/163)) ([3a4d88b](https://github.com/alvaroaxsmith/portfolio/commit/3a4d88b73ad86d2142edd303cbd4fc732930a5b5))
* **navbar:** line the menu links up with the page margins ([#143](https://github.com/alvaroaxsmith/portfolio/issues/143)) ([fc8b6a1](https://github.com/alvaroaxsmith/portfolio/commit/fc8b6a1519ea3bb3e5802d29d8d42bae367f85b8))


### Performance

* **about-me:** draw only the journey diagram on screen ([#155](https://github.com/alvaroaxsmith/portfolio/issues/155)) ([1fe4631](https://github.com/alvaroaxsmith/portfolio/commit/1fe4631f3f9db6fbe645a0f13c757936825bc766))
* **about-me:** measure the highlights once per frame before restyling them ([#157](https://github.com/alvaroaxsmith/portfolio/issues/157)) ([255033e](https://github.com/alvaroaxsmith/portfolio/commit/255033e4a203f116957d2133a44d3155951d5722))
* **about-me:** render a closed panel only when it opens ([#161](https://github.com/alvaroaxsmith/portfolio/issues/161)) ([f8e43f9](https://github.com/alvaroaxsmith/portfolio/commit/f8e43f9773c8673a544dc0d2a54221bd93e679ba))
* **courses:** render only the table or the list, whichever fits the screen ([#159](https://github.com/alvaroaxsmith/portfolio/issues/159)) ([f848de3](https://github.com/alvaroaxsmith/portfolio/commit/f848de37f9c2d462165c181332d497204a7e1fc4))
* **courses:** serve the course list as a static file instead of a remote API ([#147](https://github.com/alvaroaxsmith/portfolio/issues/147)) ([b536984](https://github.com/alvaroaxsmith/portfolio/commit/b53698445867efafe0cd34c6ebb96e16f692d0dd))
* download the snack bar and the mobile menu sheet only when they open ([#153](https://github.com/alvaroaxsmith/portfolio/issues/153)) ([4a5e099](https://github.com/alvaroaxsmith/portfolio/commit/4a5e099b5000742d215f8f70fdc3b3b17c3e2d3e))
* **home:** load the photo straight from its fixed URL ([#149](https://github.com/alvaroaxsmith/portfolio/issues/149)) ([8dda0a3](https://github.com/alvaroaxsmith/portfolio/commit/8dda0a3dbcc5d97cbdb3a7ebc9c0dfe72c81d4ac))
* **lists:** show the next items right away instead of after a fake delay ([#151](https://github.com/alvaroaxsmith/portfolio/issues/151)) ([d577824](https://github.com/alvaroaxsmith/portfolio/commit/d577824a745897f8bc711c26db7b8cd28ff6645b))
* run without zone.js (zoneless change detection) ([#165](https://github.com/alvaroaxsmith/portfolio/issues/165)) ([3cda3ef](https://github.com/alvaroaxsmith/portfolio/commit/3cda3eff95efc850148d413a99163cdff859379d))


### Refactoring

* **about-me:** keep the career and highlights as typed data with semantic text keys ([#171](https://github.com/alvaroaxsmith/portfolio/issues/171)) ([04aa7e5](https://github.com/alvaroaxsmith/portfolio/commit/04aa7e5366c919846a05eb351f76649f8646c3da))
* load courses and projects with resources and derive the lists ([#167](https://github.com/alvaroaxsmith/portfolio/issues/167)) ([5bfcb76](https://github.com/alvaroaxsmith/portfolio/commit/5bfcb765b4ed9950e2f9f641075a18d62b9719e0))
* move SEO, page views, focus and language out of the app shell ([#169](https://github.com/alvaroaxsmith/portfolio/issues/169)) ([8fdfef8](https://github.com/alvaroaxsmith/portfolio/commit/8fdfef89606aafdeb4474fd9523f9f945c23b754))
* one safe storage helper and standalone Material imports ([#173](https://github.com/alvaroaxsmith/portfolio/issues/173)) ([9199cec](https://github.com/alvaroaxsmith/portfolio/commit/9199cece2439509b3502422e40e60d959508a757))

## [2.5.5](https://github.com/alvaroaxsmith/portfolio/compare/v2.5.4...v2.5.5) (2026-11-19)


### Bug Fixes

* **courses:** the course hint no longer blocks the menu and closes when leaving the page ([#138](https://github.com/alvaroaxsmith/portfolio/issues/138)) ([8bc8196](https://github.com/alvaroaxsmith/portfolio/commit/8bc8196f286e7d66e0c75eddd2e076f9822620f2))


### Performance

* **about-me:** download Mermaid only when the career journey opens ([#139](https://github.com/alvaroaxsmith/portfolio/issues/139)) ([e61ed91](https://github.com/alvaroaxsmith/portfolio/commit/e61ed91af5784710c3c3f383b4b1afd36bbe1c0d))
* **router:** preload the pages once the first one is on screen ([#140](https://github.com/alvaroaxsmith/portfolio/issues/140)) ([0bd1617](https://github.com/alvaroaxsmith/portfolio/commit/0bd1617613edccbb0bdb1ac8ffd08d0db7aa7831))

## [2.5.4](https://github.com/alvaroaxsmith/portfolio/compare/v2.5.3...v2.5.4) (2026-11-19)


### Build and dependencies

* **deps:** bump dompurify from 3.4.16 to 3.4.18 in the npm-security group across 1 directory ([#124](https://github.com/alvaroaxsmith/portfolio/issues/124)) ([07f105a](https://github.com/alvaroaxsmith/portfolio/commit/07f105abf15ac3c51e9c896a939655e481cbef1c))
* **deps:** bump the npm-minor-and-patch group across 1 directory with 17 updates ([#134](https://github.com/alvaroaxsmith/portfolio/issues/134)) ([2b0d2d5](https://github.com/alvaroaxsmith/portfolio/commit/2b0d2d50511161d0bc093c77667e21f4d09a3e4d))
* **deps:** bump the npm-security group across 1 directory with 3 updates ([#133](https://github.com/alvaroaxsmith/portfolio/issues/133)) ([c3f21aa](https://github.com/alvaroaxsmith/portfolio/commit/c3f21aa890802a121241d76c1326786927c0081d))

## [2.5.3](https://github.com/alvaroaxsmith/portfolio/compare/v2.5.2...v2.5.3) (2026-10-21)


### Bug Fixes

* hosting rules for cache, security headers, missing files and social preview (phase 13) ([#120](https://github.com/alvaroaxsmith/portfolio/issues/120)) ([85b3100](https://github.com/alvaroaxsmith/portfolio/commit/85b3100e54ba8b9387513bc7c5c25c81c0fed297))


### Build and dependencies

* **deps-dev:** bump @types/node from 26.6.4 to 26.6.5 in the npm-minor-and-patch group ([#114](https://github.com/alvaroaxsmith/portfolio/issues/114)) ([f439409](https://github.com/alvaroaxsmith/portfolio/commit/f4394093f9a29881b75a0e2089c47a0f8fec3fff))
* **deps:** bump the npm-minor-and-patch group across 1 directory with 15 updates ([#121](https://github.com/alvaroaxsmith/portfolio/issues/121)) ([f894acd](https://github.com/alvaroaxsmith/portfolio/commit/f894acd2796d7c27ddfdcdc77f4914eb6b47deb3))
* **deps:** Mermaid 12, with the package's own types (phase 12c) ([#116](https://github.com/alvaroaxsmith/portfolio/issues/116)) ([b7e90d6](https://github.com/alvaroaxsmith/portfolio/commit/b7e90d658efee38a927daef64d2d7a9291814e87))

## [2.5.2](https://github.com/alvaroaxsmith/portfolio/compare/v2.5.1...v2.5.2) (2026-10-12)


### Build and dependencies

* **deps:** Font Awesome 7 and angular-fontawesome 5 for Angular 22 (phase 12b) ([#113](https://github.com/alvaroaxsmith/portfolio/issues/113)) ([6a2f94d](https://github.com/alvaroaxsmith/portfolio/commit/6a2f94dd3bce923fbd2da380f12de04d7df21a43))
* **deps:** ngx-translate 18 with standalone providers (phase 12a) ([#111](https://github.com/alvaroaxsmith/portfolio/issues/111)) ([a20084d](https://github.com/alvaroaxsmith/portfolio/commit/a20084dcf45854ca9a12f34ce6e9914cd1052d60))

## [2.5.1](https://github.com/alvaroaxsmith/portfolio/compare/v2.5.0...v2.5.1) (2026-10-10)


### Bug Fixes

* **a11y:** names, roles and states for assistive technologies (phase 10) ([#108](https://github.com/alvaroaxsmith/portfolio/issues/108)) ([c10c252](https://github.com/alvaroaxsmith/portfolio/commit/c10c2521f5008a825aeebe2044186f5349a99fff))


### Refactoring

* modern Angular signals, after-render effects and zone-free window listeners (phase 11) ([#110](https://github.com/alvaroaxsmith/portfolio/issues/110)) ([48389b0](https://github.com/alvaroaxsmith/portfolio/commit/48389b06b3dd1944147906479a7dbbdd36f87d0b))

## [2.5.0](https://github.com/alvaroaxsmith/portfolio/compare/v2.4.0...v2.5.0) (2026-10-10)


### Features

* **a11y:** pause control for the rotating word, and keyboard focus fixes (phase 9) ([#107](https://github.com/alvaroaxsmith/portfolio/issues/107)) ([5767564](https://github.com/alvaroaxsmith/portfolio/commit/5767564f66edcb1e1f40a1258c87a4612e7fde15))


### Build and dependencies

* **deps:** bump the npm-minor-and-patch group across 1 directory with 6 updates ([#103](https://github.com/alvaroaxsmith/portfolio/issues/103)) ([44a0f5c](https://github.com/alvaroaxsmith/portfolio/commit/44a0f5c53fbe2a5f59c2a8aa4942e796451a472c))

## [2.4.0](https://github.com/alvaroaxsmith/portfolio/compare/v2.3.0...v2.4.0) (2026-10-10)


### Features

* not-found page for addresses that do not exist, instead of a blank screen ([0f0dd37](https://github.com/alvaroaxsmith/portfolio/commit/0f0dd37967cdf1b88046515200e40959c92ee5bf)), closes [#72](https://github.com/alvaroaxsmith/portfolio/issues/72)


### Bug Fixes

* skip link, scroll on navigation and stuck loading states in courses and the certificate sheet ([0f0dd37](https://github.com/alvaroaxsmith/portfolio/commit/0f0dd37967cdf1b88046515200e40959c92ee5bf)), closes [#72](https://github.com/alvaroaxsmith/portfolio/issues/72)


### CI

* release-please with draft releases, and the live version in the page ([7cd6736](https://github.com/alvaroaxsmith/portfolio/commit/7cd6736d3d2ae3562f6a59da4c024dab7b9a0350))

## Earlier releases

Technical history generated by [release-please](https://github.com/googleapis/release-please) from the commit messages. The notes for visitors, in Portuguese, are in [GitHub Releases](https://github.com/alvaroaxsmith/portfolio/releases); releases up to v2.3.0 are described only there.

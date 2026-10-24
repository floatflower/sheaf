# Third-party notices

Sheaf's own code is released under the MIT License (see `LICENSE`). It bundles the following
material under its own terms, which is not covered by that license.

## Noto Sans and Noto Serif

`resources/fonts/` contains Noto Sans and Noto Serif (Latin, Traditional Chinese, Simplified Chinese,
Japanese and Korean), converted to WOFF2 by `scripts/make-fonts.py`. Exported documents embed subsets of
them. The fonts are copyright The Noto Project Authors and licensed under the
[SIL Open Font License 1.1](https://openfontlicense.org); the licence texts are the `OFL-*.txt` files in
that folder and ship with the app.

## Swiper

`src/renderer/src/builtin/lightbox/` contains the Swiper bundle (`swiper-bundle.min.js` and `.css`), which the
built-in image lightbox adds to exported HTML pages. Swiper is copyright Vladimir Kharlampidi and released under
the [MIT License](https://github.com/nolimits4web/swiper/blob/master/LICENSE).

## npm dependencies

The libraries the app is built from (Electron, React, CodeMirror, unified and others) are distributed
under their own licenses, mostly MIT. See each package in `node_modules` for its license text.

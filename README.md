# Sheaf website

The product page for [Sheaf](https://github.com/floatflower/sheaf). This is an orphan branch: it shares no history
with `main`, which holds the app itself.

Vite, React, Tailwind v4 and shadcn/ui. Download links come from the GitHub Releases API at page load (no token is
needed for a public repository), so the page never has to be rebuilt for a new release.

```
npm install
npm run dev       # develop
npm run build     # type-check, build into docs/, then prerender every page
```

Every page is prerendered: the build renders each one to HTML (`scripts/prerender.mjs`, from `src/entry-server.tsx`) and
puts it inside `#root`, so crawlers and link previews see the real text, and the client hydrates it. Pages are
prerendered in the default language (繁體中文); a visitor who prefers English is switched after load. Anything that
reads `window`, `localStorage` or the clock while rendering must wait for an effect, or hydration will not match.

`docs/` is the build output and **is committed**: GitHub Pages serves it directly, so rebuild before pushing.

## Publishing

Repository Settings → Pages → Build and deployment → Source: **Deploy from a branch**, branch **`website`**, folder
**`/docs`**. The site is at **https://sheaf.floatflower.me** (`public/CNAME` holds the domain and every build copies it into
`docs/`). Every link is relative, so it also works at `https://<user>.github.io/sheaf/`.

## Editing

- Copy and translations (繁體中文 and English): `src/lib/i18n.ts`, including the slogan.
- The syntax guide: its text is `src/lib/syntax.*.json`, and the code samples are the `.md` files in `src/examples/`.
  The pictures in `public/examples/` were rendered from those same files by the app, so re-take them if a sample changes.
- The customize guide (themes and plugins): its text is `src/lib/customize.*.json`; the `.css`, `.js` and `.md` files in
  `src/examples/` are the samples it shows, and were loaded into the app to draw `public/examples/customize-*.png`.
- Link preview image: `public/og.png`, built by `python3 scripts/make-og.py`.
- Screenshots: `public/screens/`.
- Release lookup and which file is which platform: `src/lib/releases.ts`.

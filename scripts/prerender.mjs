// Puts the rendered markup of every page inside <div id="root"> of the built HTML, so crawlers and link previews see
// the real content and visitors see it before any script runs. The client then hydrates that markup.
//
//   vite build                                  client bundle + HTML into docs/
//   vite build --ssr src/entry-server.tsx       the same pages as a Node module into .ssr/
//   node scripts/prerender.mjs                  this script
import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const { pages } = await import(pathToFileURL(resolve('.ssr/entry-server.js')).href)

const targets = { home: 'docs/index.html', syntax: 'docs/syntax/index.html', customize: 'docs/customize/index.html' }
for (const [name, file] of Object.entries(targets)) {
  const html = await readFile(file, 'utf8')
  if (!html.includes('<div id="root"></div>')) throw new Error(`${file}: no empty #root to fill`)
  const out = html
    .replace('<div id="root"></div>', () => `<div id="root">${pages[name]()}</div>`)
    // Its text is in the page now.
    .replace(/\s*<noscript>[\s\S]*?<\/noscript>/, '')
  await writeFile(file, out)
  console.log(`prerendered ${file} (${Math.round(out.length / 1024)} kB)`)
}

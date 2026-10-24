import { inlineLocalImages } from './localImages'
import { pluginCss, renderMarkdown, runPostRender, type ExportResource, type MdPlugin, type RenderTarget } from './markdown'
import previewCss from '../styles/preview.css?raw'

export function collectCss(themeCss: string, plugins: MdPlugin[], html: string): string {
  return [previewCss, pluginCss(plugins, html), themeCss].join('\n')
}

/** The export failed because of one plugin's `exportHtml`. */
export class PluginExportError extends Error {
  constructor(
    readonly pluginId: string,
    readonly pluginName: string,
    readonly cause: unknown
  ) {
    super(cause instanceof Error ? cause.message : String(cause))
  }
}

/** Written beside the page by the Bundle export. */
export interface ExportFile {
  path: string
  data: Uint8Array
}

/** Stands for the page's `_files` folder in links; the main process swaps in the real name once it is chosen. */
const FILES_TOKEN = '@@SHEAF_FILES@@'

const segment = (s: string): string => s.replace(/[^\w.-]+/g, '-')
const escapeEnd = (code: string, tag: 'script' | 'style'): string => code.replace(new RegExp(`</(${tag})`, 'gi'), '<\\/$1')

export interface ExportResult {
  html: string
  /** Files for the Bundle export to write; empty otherwise. */
  files: ExportFile[]
}

/** A self-contained HTML document: styles inlined, mermaid already turned into SVG. */
export async function buildExportHtml(
  source: string,
  title: string,
  themeCss: string,
  plugins: MdPlugin[],
  docPath: string | null,
  target: Exclude<RenderTarget, 'preview'> = 'html'
): Promise<ExportResult> {
  const body = document.createElement('div')
  body.innerHTML = await inlineLocalImages(await renderMarkdown(source, plugins), docPath, 'data')
  await runPostRender(body, plugins, { themeCss, target })

  // Plugins add to the page only for a real HTML file, not for the PDF that is printed from it.
  let head = ''
  let pluginStyles = ''
  let scripts = ''
  const files: ExportFile[] = []
  const link = (id: string, file: string): string => `${FILES_TOKEN}/plugins/${segment(id)}/${file.split('/').map(encodeURIComponent).join('/')}`
  const place = (id: string, r: ExportResource): string | null => {
    if (target !== 'html-bundle' || !r.file) return null
    files.push({ path: `plugins/${segment(id)}/${r.file}`, data: new TextEncoder().encode(r.code) })
    return link(id, r.file)
  }
  if (target !== 'pdf') {
    for (const p of plugins) {
      if (!p.exportHtml) continue
      const id = p.id ?? p.name ?? 'plugin'
      try {
        const a = await p.exportHtml({
          target,
          themeCss,
          readAsset: async (path) => new TextDecoder().decode(await window.api.readPluginAsset(id, path)),
          readAssetBytes: (path) => window.api.readPluginAsset(id, path)
        })
        head += a.head ?? ''
        for (const r of a.styles ?? []) {
          const href = place(id, r)
          pluginStyles += href ? `<link rel="stylesheet" href="${href}">\n` : `<style>${escapeEnd(r.code, 'style')}</style>\n`
        }
        for (const r of a.scripts ?? []) {
          const src = place(id, r)
          const type = r.module ? ' type="module"' : ''
          scripts += src ? `<script${type} src="${src}"></script>\n` : `<script${type}>${escapeEnd(r.code, 'script')}</script>\n`
        }
      } catch (err) {
        throw new PluginExportError(id, p.name ?? id, err)
      }
    }
  }

  // The bundled fonts live in the app, so a theme that uses them gets them cut down to this document's
  // characters and embedded; otherwise the file would fall back to whatever the reader has installed.
  const kinds = (['sans', 'serif'] as const).filter((k) => themeCss.includes(`Noto ${k === 'sans' ? 'Sans' : 'Serif'}`))
  const fonts = kinds.length ? await window.api.embedFonts(body.textContent ?? '', [...kinds]) : ''

  const esc = title.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)
  const html = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc}</title>
<style>${fonts}
${collectCss(themeCss, plugins, body.innerHTML)}</style>
${pluginStyles}${head}
</head>
<body class="markdown-body">
${body.innerHTML}
${scripts}</body>
</html>`
  return { html, files }
}

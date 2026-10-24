import { readdir, readFile } from 'fs/promises'
import { isAbsolute, join, relative, resolve } from 'path'

import type { PluginFolder, PluginMetadata } from '../shared/plugins'

const OPTIONAL = ['version', 'description', 'author', 'license', 'homepage', 'main'] as const

/** `path` resolved inside `root`, or null when it points outside (`..`, an absolute path). */
export function insideFolder(root: string, path: string): string | null {
  if (!path || isAbsolute(path)) return null
  const full = resolve(root, path)
  const rel = relative(root, full)
  return rel && !rel.startsWith('..') && !isAbsolute(rel) ? full : null
}

function parseMetadata(text: string): PluginMetadata | string {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch (err) {
    return err instanceof Error ? err.message : String(err)
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return 'expected an object'
  const obj = raw as Record<string, unknown>
  if (typeof obj.name !== 'string' || !obj.name.trim()) return '"name" is required'
  const out: PluginMetadata = { name: obj.name.trim() }
  for (const key of OPTIONAL) {
    const v = obj[key]
    if (v === undefined) continue
    if (typeof v !== 'string') return `"${key}" must be a string`
    out[key] = v
  }
  return out
}

/** Every folder in `dir` is a plugin: `metadata.json` describes it and `main` (default `index.js`) is its code. */
export async function listPluginFolders(dir: string): Promise<PluginFolder[]> {
  const found: PluginFolder[] = []
  for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith('.')) continue
    const id = entry.name
    if (!entry.isDirectory()) {
      if (id.endsWith('.js')) found.push({ id, problem: { code: 'legacy' } })
      continue
    }
    const root = join(dir, id)
    let text: string
    try {
      text = await readFile(join(root, 'metadata.json'), 'utf-8')
    } catch {
      found.push({ id, problem: { code: 'noMetadata' } })
      continue
    }
    const metadata = parseMetadata(text)
    if (typeof metadata === 'string') {
      found.push({ id, problem: { code: 'invalidMetadata', detail: metadata } })
      continue
    }
    const main = metadata.main ?? 'index.js'
    const file = insideFolder(root, main)
    try {
      if (!file) throw new Error('outside the plugin folder')
      found.push({ id, metadata, code: await readFile(file, 'utf-8') })
    } catch (err) {
      found.push({ id, metadata, problem: { code: 'noEntry', detail: `${main}: ${err instanceof Error ? err.message : String(err)}` } })
    }
  }
  return found
}

/** A file inside a plugin's own folder, for the plugin to embed or copy when it exports. */
export async function readPluginAsset(dir: string, id: string, path: string): Promise<Buffer> {
  const root = insideFolder(dir, id)
  const file = root && id === relative(dir, root) ? insideFolder(root, path) : null
  if (!root || !file) throw new Error(`Not a file inside the plugin folder: ${path}`)
  return readFile(file)
}

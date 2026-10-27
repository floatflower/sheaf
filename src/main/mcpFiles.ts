import { mkdir, readFile, realpath, stat, writeFile } from 'fs/promises'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'path'
import { scanFolder, type TreeNode } from './folder'

/*
 * File access for the AI tools. Everything is confined to the folder open in the sidebar, to
 * Markdown files, and to visible paths (nothing under a dot-directory), so an assistant can keep a
 * journal or read notes but cannot reach the rest of the disk.
 */

const MAX_READ = 2 * 1024 * 1024
const MAX_HITS = 50
const MARKDOWN = /\.md$/i

export class FileToolError extends Error {}

const fail = (message: string): never => {
  throw new FileToolError(message)
}

const inside = (root: string, path: string): boolean => {
  const rel = relative(root, path)
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))
}

/** The nearest ancestor that exists, so a file that is about to be created can still be checked. */
async function existingAncestor(path: string): Promise<string> {
  let current = path
  for (;;) {
    try {
      await stat(current)
      return current
    } catch {
      const parent = dirname(current)
      if (parent === current) return current
      current = parent
    }
  }
}

/**
 * Turn what the assistant sent (relative to the folder, or absolute) into a safe absolute path.
 * Symbolic links are resolved first, so a link inside the folder cannot lead outside it.
 */
export async function resolveDocument(root: string, requested: string): Promise<string> {
  const base = await realpath(root)
  const path = resolve(base, requested)
  if (!inside(base, path)) fail('路徑必須在目前開啟的資料夾內')
  if (!MARKDOWN.test(path)) fail('只能存取 .md 檔')
  const rel = relative(base, path)
  if (rel.split(sep).some((part) => part.startsWith('.'))) fail('不能存取以 . 開頭的檔案或資料夾')

  // The file itself if it exists, otherwise the closest folder that does: either way, links are resolved.
  if (!inside(base, await realpath(await existingAncestor(path)))) fail('路徑必須在目前開啟的資料夾內')
  return path
}

const exists = (path: string): Promise<boolean> =>
  stat(path).then(
    (s) => s.isFile(),
    () => false
  )

export interface DocumentEntry {
  path: string
  name: string
  mtime: string
  size: number
}

/** A glob with only `*` (anything but `/`), `**` (anything) and `?`, matched against the relative path. */
function globToRegExp(glob: string): RegExp {
  let out = ''
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i]
    if (c === '*') {
      if (glob[i + 1] === '*') {
        out += '.*'
        i++
        if (glob[i + 1] === '/') i++
      } else out += '[^/]*'
    } else if (c === '?') out += '[^/]'
    else out += c.replace(/[.+^${}()|[\]\\]/g, '\\$&')
  }
  return new RegExp(`^${out}$`, 'i')
}

function flatten(tree: TreeNode[]): string[] {
  return tree.flatMap((n) => (n.dir ? flatten(n.children ?? []) : [n.path]))
}

export async function listDocuments(root: string, options: { dir?: string; glob?: string }): Promise<{ root: string; documents: DocumentEntry[]; truncated: boolean }> {
  const base = await realpath(root)
  let from = base
  if (options.dir) {
    from = resolve(base, options.dir)
    if (!inside(base, from)) fail('dir 必須在目前開啟的資料夾內')
    if (!inside(base, await realpath(await existingAncestor(from)))) fail('dir 必須在目前開啟的資料夾內')
  }
  const scan = await scanFolder(from)
  const pattern = options.glob ? globToRegExp(options.glob) : null
  const documents: DocumentEntry[] = []
  for (const path of flatten(scan.tree)) {
    const rel = relative(base, path).split(sep).join('/')
    if (pattern && !pattern.test(rel) && !pattern.test(rel.split('/').pop() ?? '')) continue
    const s = await stat(path).catch(() => null)
    if (!s) continue
    documents.push({ path: rel, name: rel.split('/').pop() ?? rel, mtime: s.mtime.toISOString(), size: s.size })
  }
  documents.sort((a, b) => (a.mtime < b.mtime ? 1 : a.mtime > b.mtime ? -1 : 0)) // newest first
  return { root: base, documents, truncated: scan.truncated }
}

export async function readDocument(root: string, requested: string): Promise<{ path: string; content: string }> {
  const path = await resolveDocument(root, requested)
  const s = await stat(path).catch(() => null)
  if (!s?.isFile()) fail(`找不到檔案：${requested}`)
  if (s!.size > MAX_READ) fail('檔案太大（上限 2MB）')
  return { path, content: await readFile(path, 'utf-8') }
}

export async function createDocument(root: string, requested: string, content: string, overwrite: boolean): Promise<{ path: string; created: boolean }> {
  const path = await resolveDocument(root, requested)
  const there = await exists(path)
  if (there && !overwrite) fail(`檔案已存在：${requested}（要覆寫請設 overwrite，或改用 append_to_document）`)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, content, 'utf-8')
  return { path, created: !there }
}

/** What to add after `existing` so that `text` lands as its own paragraph block. */
export function appendSuffix(existing: string, text: string): string {
  const body = `${text.replace(/\n*$/, '')}\n`
  if (existing.trim() === '') return body
  return (existing.endsWith('\n\n') ? '' : existing.endsWith('\n') ? '\n' : '\n\n') + body
}

export async function appendToDocument(root: string, requested: string, text: string, createIfMissing: boolean): Promise<{ path: string; created: boolean }> {
  const path = await resolveDocument(root, requested)
  const there = await exists(path)
  if (!there && !createIfMissing) fail(`找不到檔案：${requested}`)
  const existing = there ? await readFile(path, 'utf-8') : ''
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, existing.trim() === '' ? appendSuffix('', text) : existing + appendSuffix(existing, text), 'utf-8')
  return { path, created: !there }
}

/** Replace `find` in `content`; the same rules as the open-document tool, so the two behave alike. */
export function replacedIn(content: string, find: string, replace: string, replaceAll: boolean): { content: string; count: number } {
  const at: number[] = []
  for (let i = content.indexOf(find); i !== -1; i = content.indexOf(find, i + find.length)) at.push(i)
  if (at.length === 0) fail('找不到 find 指定的文字（必須逐字相同，包含空白與換行）')
  if (at.length > 1 && !replaceAll) fail(`find 在文件中出現 ${at.length} 次，請加長 find 讓它唯一，或設定 replaceAll`)
  let out = ''
  let last = 0
  for (const i of at) {
    out += content.slice(last, i) + replace
    last = i + find.length
  }
  return { content: out + content.slice(last), count: at.length }
}

export async function editDocument(root: string, requested: string, find: string, replace: string, replaceAll: boolean): Promise<{ path: string; replaced: number }> {
  const { path, content } = await readDocument(root, requested)
  const result = replacedIn(content, find, replace, replaceAll)
  await writeFile(path, result.content, 'utf-8')
  return { path, replaced: result.count }
}

export interface SearchHit {
  path: string
  line: number
  text: string
}

export async function searchDocuments(root: string, query: string, dir?: string): Promise<{ hits: SearchHit[]; truncated: boolean }> {
  const { root: base, documents } = await listDocuments(root, { dir })
  const needle = query.toLowerCase()
  const hits: SearchHit[] = []
  for (const doc of documents) {
    if (doc.size > MAX_READ) continue
    const lines = (await readFile(join(base, doc.path), 'utf-8').catch(() => '')).split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].toLowerCase().includes(needle)) continue
      if (hits.length >= MAX_HITS) return { hits, truncated: true }
      hits.push({ path: doc.path, line: i + 1, text: lines[i].trim().slice(0, 200) })
    }
  }
  return { hits, truncated: false }
}

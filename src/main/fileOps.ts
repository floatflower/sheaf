import { constants } from 'fs'
import { copyFile, mkdir, rename, stat, writeFile } from 'fs/promises'
import { basename, dirname, join, relative, isAbsolute } from 'path'
import { shell } from 'electron'
import { resolveDocument } from './mcpFiles'

/*
 * Creating, renaming and deleting files from the sidebar. Like the AI tools, these only touch
 * Markdown files inside the open folder. Errors carry a short code the window turns into text.
 */

export type FileOpError = 'invalid' | 'exists' | 'missing' | 'outside'

export class FileOpFailure extends Error {
  constructor(public code: FileOpError) {
    super(code)
  }
}

const exists = (path: string): Promise<boolean> =>
  stat(path).then(
    () => true,
    () => false
  )

/** A single file name: no folders, nothing hidden, `.md` added when missing. */
function cleanName(raw: string): string {
  const name = raw.trim()
  if (!name || /[\\/:*?"<>|\0]/.test(name) || name.startsWith('.') || name === '..') throw new FileOpFailure('invalid')
  return /\.md$/i.test(name) ? name : `${name}.md`
}

async function inside(root: string, path: string): Promise<string> {
  try {
    return await resolveDocument(root, path)
  } catch {
    throw new FileOpFailure('outside')
  }
}

export async function createFile(root: string, dir: string, rawName: string): Promise<{ path: string; name: string }> {
  const name = cleanName(rawName)
  const path = await inside(root, join(dir, name))
  if (await exists(path)) throw new FileOpFailure('exists')
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, '', { encoding: 'utf-8', flag: 'wx' })
  return { path, name }
}

export async function renameFile(root: string, from: string, rawName: string): Promise<{ path: string; name: string }> {
  const name = cleanName(rawName)
  const source = await inside(root, from)
  const target = await inside(root, join(dirname(source), name))
  if (!(await exists(source))) throw new FileOpFailure('missing')
  // A case-only change names the same file on a case-insensitive disk, so it is not a clash.
  if (source.toLowerCase() !== target.toLowerCase() && (await exists(target))) throw new FileOpFailure('exists')
  if (source !== target) await rename(source, target)
  return { path: target, name: basename(target) }
}

/** `Note.md` becomes `Note Copy.md`, then `Note Copy 2.md`, `Note Copy 3.md`… whichever is free. */
export async function duplicateFile(root: string, from: string): Promise<{ path: string; name: string }> {
  const source = await inside(root, from)
  if (!(await exists(source))) throw new FileOpFailure('missing')
  const stem = basename(source).replace(/\.md$/i, '')
  for (let n = 1; ; n++) {
    const name = `${stem} Copy${n === 1 ? '' : ` ${n}`}.md`
    const target = join(dirname(source), name)
    try {
      await copyFile(source, target, constants.COPYFILE_EXCL) // never replaces a file that is already there
      return { path: target, name }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err
    }
  }
}

/**
 * Move a file or folder into another folder of the workspace. Never replaces anything, and a
 * folder cannot go into itself. Folders are checked through a stand-in file name, because the
 * path rules are written for Markdown files.
 */
export async function moveEntry(root: string, from: string, toDir: string): Promise<{ path: string; name: string; dir: boolean }> {
  const isDir = (await stat(from).catch(() => null))?.isDirectory() ?? false
  const source = isDir ? dirname(await inside(root, join(from, 'x.md'))) : await inside(root, from)
  const dest = dirname(await inside(root, join(toDir, 'x.md')))
  if (!(await exists(source))) throw new FileOpFailure('missing')
  const name = basename(source)
  const target = join(dest, name)
  if (target === source) return { path: source, name, dir: isDir }
  const rel = relative(source, dest)
  if (isDir && (rel === '' || (!rel.startsWith('..') && !isAbsolute(rel)))) throw new FileOpFailure('invalid')
  if (await exists(target)) throw new FileOpFailure('exists')
  await rename(source, target)
  return { path: target, name, dir: isDir }
}

/** Moves to the Trash / Recycle Bin rather than deleting for good. */
export async function trashFile(root: string, path: string): Promise<void> {
  const target = await inside(root, path)
  if (!(await exists(target))) throw new FileOpFailure('missing')
  await shell.trashItem(target)
}

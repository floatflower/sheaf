import { app } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

import type { RecentItem } from '../shared/recent'

export type { RecentItem }

const MAX_RECENT = 10

const file = (): string => join(app.getPath('userData'), 'recent.json')

let items: RecentItem[] = []

export const recentItems = (): readonly RecentItem[] => items

export async function loadRecent(): Promise<void> {
  try {
    const saved: unknown = JSON.parse(await readFile(file(), 'utf-8'))
    items = Array.isArray(saved)
      ? saved
          .filter((i): i is RecentItem => typeof i?.path === 'string' && (i.kind === 'file' || i.kind === 'folder'))
          .slice(0, MAX_RECENT)
      : []
  } catch {
    items = []
  }
}

const persist = (): Promise<void> => writeFile(file(), JSON.stringify(items, null, 2), 'utf-8').catch(() => {})

/** Put an item at the top of the list. */
export async function addRecent(item: RecentItem): Promise<void> {
  items = [item, ...items.filter((i) => i.path !== item.path)].slice(0, MAX_RECENT)
  if (item.kind === 'file') app.addRecentDocument(item.path) // the dock / taskbar keeps its own list
  await persist()
}

export async function removeRecent(path: string): Promise<void> {
  items = items.filter((i) => i.path !== path)
  await persist()
}

export async function clearRecent(): Promise<void> {
  items = []
  app.clearRecentDocuments()
  await persist()
}

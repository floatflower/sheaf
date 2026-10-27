import { watch, type FSWatcher } from 'fs'
import { basename, dirname, join } from 'path'

interface Directory {
  watcher: FSWatcher
  names: Set<string>
}

const directories = new Map<string, Directory>()
const timers = new Map<string, NodeJS.Timeout>()

function close(dir: string): void {
  directories.get(dir)?.watcher.close()
  directories.delete(dir)
}

/**
 * Report (debounced) when any of `paths` changes on disk. The parent folders are watched rather than
 * the files, because many editors and sync tools save by replacing the file, which ends a watch
 * on the old one. Replaces whatever was watched before.
 */
export function watchFiles(paths: string[], onChange: (path: string) => void): void {
  const wanted = new Map<string, Set<string>>()
  for (const path of paths) {
    const dir = dirname(path)
    wanted.set(dir, (wanted.get(dir) ?? new Set()).add(basename(path)))
  }

  for (const dir of [...directories.keys()]) if (!wanted.has(dir)) close(dir)

  for (const [dir, names] of wanted) {
    const existing = directories.get(dir)
    if (existing) {
      existing.names = names
      continue
    }
    try {
      const watcher = watch(dir, (_event, filename) => {
        const current = directories.get(dir)
        const name = filename?.toString()
        if (!current || !name || !current.names.has(name)) return
        const path = join(dir, name)
        clearTimeout(timers.get(path))
        timers.set(
          path,
          setTimeout(() => {
            timers.delete(path)
            onChange(path)
          }, 150)
        )
      })
      watcher.on('error', () => close(dir))
      directories.set(dir, { watcher, names })
    } catch {
      /* A folder that cannot be watched just means no live reload for its files. */
    }
  }
}

export function stopWatchingFiles(): void {
  for (const dir of [...directories.keys()]) close(dir)
  for (const timer of timers.values()) clearTimeout(timer)
  timers.clear()
}

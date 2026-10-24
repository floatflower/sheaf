import type { MdPlugin } from './markdown'
import { builtinPlugins } from '@/builtin'
import { i18n } from '@/i18n'
import type { PluginMetadata, PluginProblem } from '../../../shared/plugins'

export interface PluginEntry {
  /** Stable id used to remember the enabled state: the folder name, or `builtin:<name>`. */
  file: string
  /** Display name. */
  name: string
  /** From `metadata.json`; built-in plugins have none. */
  metadata?: PluginMetadata
  builtin?: boolean
  enabled: boolean
  /** Only set for enabled plugins that loaded successfully. */
  plugin?: MdPlugin
  error?: string
}

function describe(problem: PluginProblem): string {
  const detail = 'detail' in problem ? problem.detail : ''
  return i18n.t(`plugins.problem.${problem.code}`, { detail })
}

/**
 * Read every plugin folder and load the enabled ones (ES modules whose default export is an MdPlugin).
 * Disabled plugins are listed but never imported, so their code does not run.
 */
export async function loadPlugins(disabled: ReadonlySet<string>): Promise<PluginEntry[]> {
  const entries: PluginEntry[] = builtinPlugins.map(({ id, plugin }) => ({
    file: id,
    name: plugin.name ?? id,
    builtin: true,
    enabled: !disabled.has(id),
    plugin: disabled.has(id) ? undefined : { ...plugin, id }
  }))
  for (const { id: file, metadata, code, problem } of await window.api.listPlugins()) {
    const name = metadata?.name ?? file
    if (problem) {
      entries.push({ file, name, metadata, enabled: true, error: describe(problem) })
      continue
    }
    if (disabled.has(file)) {
      entries.push({ file, name, metadata, enabled: false })
      continue
    }
    const url = URL.createObjectURL(new Blob([code!], { type: 'text/javascript' }))
    try {
      const mod = await import(/* @vite-ignore */ url)
      const plugin = mod.default as MdPlugin | undefined
      if (!plugin || typeof plugin !== 'object') throw new Error(i18n.t('plugins.noDefaultExport'))
      entries.push({ file, name, metadata, enabled: true, plugin: { ...plugin, id: file, name } })
    } catch (err) {
      entries.push({ file, name, metadata, enabled: true, error: err instanceof Error ? err.message : String(err) })
    } finally {
      URL.revokeObjectURL(url)
    }
  }
  return entries
}

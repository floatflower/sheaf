/** What a plugin's `metadata.json` may say. Only `name` is required. */
export interface PluginMetadata {
  name: string
  version?: string
  description?: string
  author?: string
  license?: string
  homepage?: string
  /** The entry module, relative to the plugin folder. Defaults to `index.js`. */
  main?: string
}

export type PluginProblem =
  | { code: 'legacy' } // a loose .js file from before plugins became folders
  | { code: 'noMetadata' }
  | { code: 'invalidMetadata'; detail: string }
  | { code: 'noEntry'; detail: string }

export interface PluginFolder {
  /** The folder name; it also keys the enabled state. */
  id: string
  metadata?: PluginMetadata
  code?: string
  problem?: PluginProblem
}

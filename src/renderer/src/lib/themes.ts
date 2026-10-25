import defaultCss from '../styles/theme-default.css?raw'
import manuscriptCss from '../styles/theme-manuscript.css?raw'
import paperCss from '../styles/theme-paper.css?raw'

export interface Theme {
  name: string
  css: string
  builtin?: boolean
}

export const builtinThemes: Theme[] = [
  { name: 'Default', css: defaultCss, builtin: true },
  { name: 'Manuscript', css: defaultCss + '\n' + manuscriptCss, builtin: true },
  { name: 'Paper', css: defaultCss + '\n' + paperCss, builtin: true }
]

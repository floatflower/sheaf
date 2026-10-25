import defaultCss from '../styles/theme-default.css?raw'
import manuscriptCss from '../styles/theme-manuscript.css?raw'
import scholiaCss from '../styles/theme-scholia.css?raw'

export interface Theme {
  name: string
  css: string
  builtin?: boolean
}

export const builtinThemes: Theme[] = [
  { name: 'Default', css: defaultCss, builtin: true },
  { name: 'Manuscript', css: manuscriptCss, builtin: true },
  { name: 'Scholia', css: scholiaCss, builtin: true }
]

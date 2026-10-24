import { renderToString } from 'react-dom/server'
import App from './App'
import CustomizePage from './CustomizePage'
import SyntaxPage from './SyntaxPage'

/** The markup of each page in the default language, for scripts/prerender.mjs to put inside #root. */
export const pages = {
  home: () => renderToString(<App />),
  syntax: () => renderToString(<SyntaxPage />),
  customize: () => renderToString(<CustomizePage />)
}

import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import CustomizePage from './CustomizePage'

// Follow the system's light or dark setting.
const dark = window.matchMedia('(prefers-color-scheme: dark)')
const apply = (): void => {
  document.documentElement.classList.toggle('dark', dark.matches)
}
apply()
dark.addEventListener('change', apply)

// The pages are prerendered at build time: adopt that markup when it is there, and render from scratch (dev server) when not.
const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <CustomizePage />
  </StrictMode>
)
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)

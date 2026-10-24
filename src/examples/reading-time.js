export default {
  name: 'Reading time',
  postRender(root) {
    const text = [...root.querySelectorAll('p, li, td, h1, h2, h3, h4, h5, h6')].map((el) => el.textContent).join('')
    const minutes = Math.max(1, Math.round(text.replace(/\s/g, '').length / 500))
    const note = document.createElement('p')
    note.className = 'reading-time'
    note.textContent = `About ${minutes} min read`
    note.style.cssText = 'color: #71717a; font-size: 0.85em; margin: 0 0 1em;'
    root.prepend(note)
  }
}

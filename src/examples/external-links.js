function markExternalLinks() {
  const walk = (node) => {
    if (node.type === 'element' && node.tagName === 'a' && /^https?:/.test(node.properties?.href ?? '')) {
      node.properties.className = [...(node.properties.className ?? []), 'external']
    }
    node.children?.forEach(walk)
  }
  return walk
}

export default {
  name: 'External links',
  rehypePlugins: [markExternalLinks],
  css: `.markdown-body a.external::after { content: ' ↗'; font-size: 0.8em; }`
}

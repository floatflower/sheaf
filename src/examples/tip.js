export default {
  name: 'Tip box',
  directives: {
    tip: ({ attributes }) => ({
      tagName: 'div',
      properties: { className: ['tip'], dataTitle: attributes.title ?? 'Tip' }
    })
  },
  css: `
.markdown-body .tip { margin: 1em 0; padding: 0.6em 1em; border-left: 4px solid #10b981; border-radius: 4px; background: #ecfdf5; }
.markdown-body .tip::before { content: attr(data-title); display: block; font-weight: 600; color: #047857; }
.markdown-body .tip > :last-child { margin-bottom: 0; }
`,
  docs: `
### Tip box
:::tip{title="Heads up"}
Text of the tip. The title attribute is optional.
:::
`
}

import DocPage, { type Doc } from '@/components/DocPage'
import type { Lang } from '@/lib/i18n'
import zh from '@/lib/syntax.zh-TW.json'
import en from '@/lib/syntax.en.json'
import callout from '@/examples/callout.md?raw'
import caption from '@/examples/caption.md?raw'
import chartConfig from '@/examples/chart-config.md?raw'
import chartTable from '@/examples/chart-table.md?raw'
import math from '@/examples/math.md?raw'
import mermaid from '@/examples/mermaid.md?raw'
import pagebreak from '@/examples/pagebreak.md?raw'
import todo from '@/examples/todo.md?raw'

// The same files the screenshots in public/examples were rendered from, so the code shown is the code that was drawn.
const FILES: Record<string, string> = {
  callout,
  caption,
  'chart-config': chartConfig,
  'chart-table': chartTable,
  math,
  mermaid,
  pagebreak,
  todo
}

const DOCS: Record<Lang, Doc> = { 'zh-TW': zh as Doc, en: en as Doc }

export default function SyntaxPage(): React.JSX.Element {
  return <DocPage docs={DOCS} files={FILES} current="syntax" />
}

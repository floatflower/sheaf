import DocPage, { type Doc } from '@/components/DocPage'
import type { Lang } from '@/lib/i18n'
import zh from '@/lib/customize.zh-TW.json'
import en from '@/lib/customize.en.json'
import chartOverride from '@/examples/chart-override.md?raw'
import externalLinks from '@/examples/external-links.js?raw'
import readingTime from '@/examples/reading-time.js?raw'
import rose from '@/examples/rose.css?raw'
import tip from '@/examples/tip.js?raw'

// Every file here was loaded into the real app to draw the screenshots next to it.
const FILES: Record<string, string> = {
  'chart-override.md': chartOverride,
  'external-links.js': externalLinks,
  'reading-time.js': readingTime,
  'rose.css': rose,
  'tip.js': tip
}

const DOCS: Record<Lang, Doc> = { 'zh-TW': zh as Doc, en: en as Doc }

export default function CustomizePage(): React.JSX.Element {
  return <DocPage docs={DOCS} files={FILES} current="customize" />
}

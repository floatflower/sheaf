import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export interface ExportErrorInfo {
  /** `HTML` or `PDF`. */
  kind: string
  /** The plugin that failed, when it was one. */
  plugin?: { id: string; name: string }
  message: string
  stack?: string
}

/** The plain-text report the user can save and send along. */
export function errorReport(e: ExportErrorInfo, app: { name: string; version: string; platform: string }): string {
  return [
    `${app.name} ${app.version} (${app.platform})`,
    new Date().toISOString(),
    `Export: ${e.kind}`,
    ...(e.plugin ? [`Plugin: ${e.plugin.name} (${e.plugin.id})`] : []),
    '',
    e.message,
    ...(e.stack ? ['', e.stack] : [])
  ].join('\n')
}

interface Props {
  error: ExportErrorInfo | null
  onClose: () => void
  onSave: () => void
}

export default function ExportErrorDialog({ error, onClose, onSave }: Props): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <Dialog open={!!error} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('exportError.title', { kind: error?.kind })}</DialogTitle>
          <DialogDescription>
            {error?.plugin ? t('exportError.plugin', { name: error.plugin.name }) : t('exportError.description')}
          </DialogDescription>
        </DialogHeader>
        <pre className="max-h-60 overflow-auto rounded-md border bg-muted p-3 text-xs whitespace-pre-wrap break-words">
          {error?.message}
        </pre>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="cursor-pointer" onClick={onSave}>
            {t('exportError.save')}
          </Button>
          <Button className="cursor-pointer" onClick={onClose}>
            {t('exportError.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

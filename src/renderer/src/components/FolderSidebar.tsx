import { useEffect, useRef, useState } from 'react'
import { ChevronRight, FilePlus, FileText, Folder, FolderOpen, Pencil, RefreshCw, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { FolderScan, TreeNode } from '../../../main/folder'
import { Button } from '@/components/ui/button'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { cn } from '@/lib/utils'

interface Props {
  width: number
  className?: string
  scan: FolderScan
  currentPath: string | null
  expanded: ReadonlySet<string>
  onToggle: (path: string) => void
  onOpen: (path: string) => void
  onRefresh: () => void
  onClose: () => void
  /** Each resolves true when it worked; on false the name stays editable (the window explains why). */
  onCreate: (dir: string, name: string) => Promise<boolean>
  onRename: (path: string, name: string) => Promise<boolean>
  onDelete: (path: string) => void
}

/** What is being named right now: an existing file, or a new one waiting to be created. */
type Editing = { kind: 'rename'; path: string } | { kind: 'create' } | null

interface RowProps extends Pick<Props, 'currentPath' | 'expanded' | 'onToggle' | 'onOpen' | 'onDelete'> {
  node: TreeNode
  depth: number
  editing: Editing
  onStartRename: (path: string) => void
  onSubmitRename: (path: string, name: string) => Promise<boolean>
  onCancelEdit: () => void
}

/** `Untitled.md`, then `Untitled-01.md`, `Untitled-02.md`… whichever is free. */
function untitledName(tree: TreeNode[]): string {
  const taken = new Set(tree.filter((n) => !n.dir).map((n) => n.name.toLowerCase()))
  if (!taken.has('untitled.md')) return 'Untitled.md'
  for (let n = 1; ; n++) {
    const name = `Untitled-${String(n).padStart(2, '0')}.md`
    if (!taken.has(name.toLowerCase())) return name
  }
}

interface NameInputProps {
  initial: string
  depth: number
  onSubmit: (name: string) => Promise<boolean>
  onCancel: () => void
}

/** A file name being typed in the tree. Enter confirms, Escape or clicking away cancels. */
function NameInput({ initial, depth, onSubmit, onCancel }: NameInputProps): React.JSX.Element {
  const { t } = useTranslation()
  const input = useRef<HTMLInputElement>(null)
  const busy = useRef(false)

  useEffect(() => {
    const el = input.current
    if (!el) return
    el.focus()
    // Select the name but not the extension, so typing replaces just that.
    el.setSelectionRange(0, initial.replace(/\.md$/i, '').length)
  }, [initial])

  return (
    <div style={{ paddingLeft: 6 + depth * 14 }} className="flex items-center gap-1.5 py-0.5 pr-2">
      <ChevronRight className="invisible size-3.5 shrink-0" />
      <FileText className="size-4 shrink-0 text-foreground/70" />
      <input
        ref={input}
        defaultValue={initial}
        aria-label={t('sidebar.fileName')}
        spellCheck={false}
        className="min-w-0 flex-1 rounded-sm border border-ring bg-background px-1 py-0.5 text-sm outline-none"
        onKeyDown={async (e) => {
          if (e.key === 'Escape') return onCancel()
          if (e.key !== 'Enter' || busy.current) return
          busy.current = true
          const ok = await onSubmit(e.currentTarget.value)
          busy.current = false
          if (!ok) input.current?.focus()
        }}
        onBlur={() => !busy.current && onCancel()}
      />
    </div>
  )
}

function Row({ node, depth, currentPath, expanded, onToggle, onOpen, onDelete, editing, onStartRename, onSubmitRename, onCancelEdit }: RowProps): React.JSX.Element {
  const { t } = useTranslation()
  const open = expanded.has(node.path)
  const selected = !node.dir && node.path === currentPath
  const Icon = node.dir ? (open ? FolderOpen : Folder) : FileText

  if (editing?.kind === 'rename' && editing.path === node.path) {
    return (
      <li>
        <NameInput initial={node.name} depth={depth} onSubmit={(name) => onSubmitRename(node.path, name)} onCancel={onCancelEdit} />
      </li>
    )
  }

  const button = (
      <button
        type="button"
        title={node.path}
        aria-expanded={node.dir ? open : undefined}
        aria-current={selected ? 'true' : undefined}
        onClick={() => (node.dir ? onToggle(node.path) : onOpen(node.path))}
        style={{ paddingLeft: 6 + depth * 14 }}
        className={cn(
          'flex w-full cursor-pointer items-center gap-1.5 rounded-sm py-1 pr-2 text-left text-sm outline-none',
          'hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring',
          selected && 'bg-accent font-medium text-accent-foreground'
        )}
      >
        {/* Files get an empty slot so their names line up with sibling folders. */}
        <ChevronRight
          className={cn('size-3.5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-90', !node.dir && 'invisible')}
        />
        <Icon className={cn('size-4 shrink-0', node.dir ? 'text-muted-foreground' : 'text-foreground/70')} />
        <span className="truncate">{node.name}</span>
      </button>
  )

  return (
    <li>
      {node.dir ? (
        button
      ) : (
        <ContextMenu>
          <ContextMenuTrigger asChild>{button}</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onSelect={() => onStartRename(node.path)}>
              <Pencil />
              {t('sidebar.rename')}
            </ContextMenuItem>
            <ContextMenuItem variant="destructive" onSelect={() => onDelete(node.path)}>
              <Trash2 />
              {t('sidebar.delete')}
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )}
      {node.dir && open && node.children && (
        <ul>
          {node.children.map((child) => (
            <Row
              key={child.path}
              node={child}
              depth={depth + 1}
              currentPath={currentPath}
              expanded={expanded}
              onToggle={onToggle}
              onOpen={onOpen}
              onDelete={onDelete}
              editing={editing}
              onStartRename={onStartRename}
              onSubmitRename={onSubmitRename}
              onCancelEdit={onCancelEdit}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function FolderSidebar({ width, className, scan, currentPath, expanded, onToggle, onOpen, onRefresh, onClose, onCreate, onRename, onDelete }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const [editing, setEditing] = useState<Editing>(null)
  const stopEditing = (): void => setEditing(null)
  const submitRename = async (path: string, name: string): Promise<boolean> => {
    const ok = await onRename(path, name)
    if (ok) stopEditing()
    return ok
  }
  return (
    <aside className={cn('flex h-full shrink-0 flex-col border-r', className)} style={{ width, maxWidth: '85%' }} aria-label={t('sidebar.label')}>
      <div className="flex items-center gap-1 border-b py-1 pl-3 pr-1">
        <span className="min-w-0 flex-1 truncate text-sm font-medium" title={scan.root}>
          {scan.name}
        </span>
        <Button variant="ghost" size="icon-sm" aria-label={t('sidebar.newFile')} title={t('sidebar.newFile')} onClick={() => setEditing({ kind: 'create' })}>
          <FilePlus />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label={t('sidebar.refresh')} title={t('sidebar.refresh')} onClick={onRefresh}>
          <RefreshCw />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label={t('sidebar.close')} title={t('sidebar.close')} onClick={onClose}>
          <X />
        </Button>
      </div>

      <nav className="min-h-0 flex-1 overflow-auto p-1">
        {scan.tree.length === 0 && editing?.kind !== 'create' ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">{t('sidebar.empty')}</p>
        ) : (
          <ul>
            {editing?.kind === 'create' && (
              <li>
                <NameInput
                  initial={untitledName(scan.tree)}
                  depth={0}
                  onSubmit={async (name) => {
                    const ok = await onCreate(scan.root, name)
                    if (ok) stopEditing()
                    return ok
                  }}
                  onCancel={stopEditing}
                />
              </li>
            )}
            {scan.tree.map((node) => (
              <Row
                key={node.path}
                node={node}
                depth={0}
                currentPath={currentPath}
                expanded={expanded}
                onToggle={onToggle}
                onOpen={onOpen}
                onDelete={onDelete}
                editing={editing}
                onStartRename={(path) => setEditing({ kind: 'rename', path })}
                onSubmitRename={submitRename}
                onCancelEdit={stopEditing}
              />
            ))}
          </ul>
        )}
        {scan.truncated && <p className="px-3 py-2 text-xs text-muted-foreground">{t('sidebar.truncated')}</p>}
      </nav>
    </aside>
  )
}
